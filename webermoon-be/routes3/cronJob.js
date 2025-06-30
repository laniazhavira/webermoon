const cron = require("node-cron");
const db = require("./db");
const { isValidDate, parseCustomDate } = require("../utils/parseDate");

// Schedule job to run every night at 00:00
cron.schedule("0 0 * * *", async() => {
    console.log("Running scheduled status update...");

    try {
        // Start transaction
        const connection = await db.getConnection();
        await connection.beginTransaction();

        const [clusters3] = await connection.query(`
            SELECT id, is_drop, plan_survey, survey, plan_delivery, delivery, 
                plan_instalasi, instalasi, plan_integrasi, integrasi 
            FROM clusters3
        `);

        const now = new Date();
        const updates = [];

        // Update status for each row
        for (const cluster of clusters3) {
            let status;
            const { id, survey, plan_delivery, delivery, plan_instalasi, instalasi, plan_integrasi, integrasi, is_drop } = cluster;

            if (is_drop) status = "Drop";
            else if (isValidDate(integrasi)) status = "Realisasi Integrasi";
            else if (!isValidDate(integrasi) && isValidDate(instalasi) && isValidDate(plan_integrasi) && now >= new Date(plan_integrasi)) status = "Plan Integrasi";
            else if (isValidDate(instalasi)) status = "Realisasi Instalasi";
            else if (!isValidDate(instalasi) && isValidDate(delivery) && isValidDate(plan_instalasi) && now >= new Date(plan_instalasi)) status = "Plan Instalasi";
            else if (isValidDate(delivery)) status = "Realisasi Delivery";
            else if (!isValidDate(delivery) && isValidDate(survey) && isValidDate(plan_delivery) && now >= new Date(plan_delivery)) status = "Plan Delivery";
            else if (isValidDate(survey)) status = "Realisasi Survey";
            else status = "Plan Survey";

            updates.push([status, id]);
        }

        if (updates.length > 0) {
            await connection.query(
                "UPDATE clusters3 SET status = ? WHERE id = ?", [updates.map(u => u[0]), updates.map(u => u[1])]
            );
        }

        // Commit transaction
        await connection.commit();
        connection.release();

        console.log("Status update completed!");
    } catch (error) {
        console.error("Error updating status:", error);
    }
});