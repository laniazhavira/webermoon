const express = require('express');
const router = express.Router();
const db = require('../db'); // Adjust the path to your db module
const { authorizeUser, authorizeMitra, authorizeAdmin } = require('../middleware/authorize');
const { isValidDate } = require('../utils/parseDate');


// Get all request data
router.get("/all1", authorizeUser, async (req, res) => {
    try {
        const { role, username } = req.user;
        let params = [];
        let sql = `
            SELECT 
                id, flow_status, cluster_id, requested_by, requested_at, approved_by, approved_at
            FROM 
                logs1
            WHERE 
                1=1 `;
        if (role === "mitra") {
            sql += ` AND requested_by = ?`;
            params.push(username);
        }

        const [result] = await db.query(sql, params);
        res.status(200).json({ result });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ status: "Server error", details: error.message });
    }
});

// Get site detail by request id
router.get("/site/detail/:idRequest", authorizeUser, async (req, res) => {
    try {
        const { idRequest } = req.params;

        // Fetch cluster details
        const clusterSql = `
            SELECT 
                c.id as cluster_id, c.name as cluster_name, r.name as regional_name, w.name as witel_name, s.name as sto_name,
                c.status, c.mitra, c.plan_survey, c.survey,
                c.plan_delivery, c.delivery, c.plan_instalasi, c.instalasi,
                c.plan_integrasi, c.integrasi, c.is_drop, c.type_olt, c.merk_otn, c.prioritas
            FROM clusters1 c
            JOIN sto1 s ON c.sto_id = s.id AND c.witel_id = s.witel_id
            JOIN witel1 w ON s.witel_id = w.id
            JOIN regional1 r ON w.regional_id = r.id
            WHERE c.id = (SELECT cluster_id FROM logs1 WHERE id = ?)`;
        const [clusterResult] = await db.query(clusterSql, [idRequest]);

        if (clusterResult.length === 0) {
            return res.status(404).json({ message: `Cluster with request ID ${idRequest} not found` });
        }

        // Fetch column-level changes
        const changes1Sql = `
         SELECT 
             field, prev_value, new_value
         FROM changes1
         WHERE logs_id = ?`;

        const [changes1] = await db.query(changes1Sql, [idRequest]);

        res.status(200).json({ cluster: clusterResult[0], changes1 });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ status: "Server error", details: error.message });
    }
});

// Get request detail by id
router.get("/detail/:idRequest", authorizeUser, async (req, res) => {
    try {
        const { idRequest } = req.params;
        const { username, role } = req.user;
        let sql = `
            SELECT 
                *
            FROM 
                logs1
            WHERE 
                id = ? `;
        let params = [idRequest];
        if (role === "mitra") {
            sql += ` AND requested_by = ?`;
            params.push(username);
        }

        const [result] = await db.query(sql, params);

        if (result.length === 0) {
            return res.status(400).json({ message: `Request not found` });
        }

        sql = `SELECT field, prev_value, new_value FROM changes1 WHERE logs_id = ?`;
        const [changes1] = await db.query(sql, [idRequest]);

        if (changes1.length > 0) {
            return res.status(200).json({ message: "Changes detected", changes1, status: result[0].flow_status, notes: result[0].notes });
        } else {
            return res.status(200).json({ message: "No changes detected", status: result[0].flow_status, notes: result[0].notes });
        }
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ status: "Server error", details: error.message });
    }
});

// Change request status and update site
router.patch("/verify/:idRequest", authorizeAdmin, async (req, res) => {
    try {
        const { username } = req.user;
        const { idRequest } = req.params;
        const { flowStatus, notes, change } = req.body;

        if (change.length === 0) {
            return res.status(400).json({ message: "Nothing to change" });
        }

        const [log] = await db.query(`SELECT flow_status as status FROM logs1 WHERE id = ?`, [idRequest]);

        if (log.length === 0) {
            return res.status(404).json({ message: `Request with id ${idRequest} not found` });
        }

        if (log[0].status !== "Requested") {
            return res.status(409).json({ message: "Request has already been verified" });
        }

        const now = new Date();

        let sql = `
            UPDATE logs1
            SET
                approved_by = ?,
                approved_at = ?, 
                flow_status = ?, 
                notes = ? 
            WHERE 
                id = ? `;

        // Update request table
        await db.query(sql, [username, now, flowStatus, notes, idRequest]);

        // Only update site table if it is approved
        if (flowStatus === "Approved") {
            sql = `
                SELECT id
                FROM
                    clusters1
                WHERE 
                    id = (SELECT
                                cluster_id
                            FROM
                                logs1
                            WHERE
                                id = ?)`;
            const [id] = await db.query(sql, [idRequest]);

            // Build the SET clause dynamically
            const setClause = change.map(change => `${change.field} = ?`).join(", ");

            // Normalize date fields before updating
            const values = change.map(change => change.new_value);
            values.push(id[0].id)

            sql = `UPDATE clusters1 SET ${setClause} WHERE id = ?`;
            await db.query(sql, values);

            // Update status dynamically
            const sqlSelect = `
                SELECT survey, plan_delivery, delivery, plan_instalasi, instalasi, 
                    plan_integrasi, integrasi, is_drop 
                FROM clusters1 WHERE id = ?`;
            const [rows] = await db.query(sqlSelect, [id[0].id]);

            const { survey, plan_delivery, delivery, plan_instalasi, instalasi, plan_integrasi, integrasi, is_drop } = rows[0];

            let status;
            if (is_drop) status = "Drop";
            else if (isValidDate(integrasi)) status = 'Realisasi Integrasi';
            else if (!isValidDate(integrasi) && isValidDate(instalasi) && isValidDate(plan_integrasi) && now >= isValidDate(plan_integrasi)) status = 'Plan Integrasi';
            else if (isValidDate(instalasi)) status = 'Realisasi Instalasi';
            else if (!isValidDate(instalasi) && isValidDate(delivery) && isValidDate(plan_instalasi) && now >= isValidDate(plan_instalasi)) status = 'Plan Instalasi';
            else if (isValidDate(delivery)) status = 'Realisasi Delivery';
            else if (!isValidDate(delivery) && isValidDate(survey) && isValidDate(plan_delivery) && now >= isValidDate(plan_delivery)) status = 'Plan Delivery';
            else if (isValidDate(survey)) status = 'Realisasi Survey';
            else status = 'Plan Survey';

            const sqlUpdateStatus = `UPDATE clusters1 SET status = ? WHERE id = ?`;
            await db.query(sqlUpdateStatus, [status, id[0].id]);

            return res.status(200).json({ message: "Approve request successful" });
        }

        res.status(200).json({ message: "Reject request successful" });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ status: "Server error", details: error.message });
    }
});

// Add request by site id
router.post("/site/:idCluster/add", authorizeMitra, async (req, res) => {
    try {
        const { idCluster } = req.params;
        const { username } = req.user;

        // Ambil data cluster lama
        const [clusterOld] = await db.query(`SELECT * FROM clusters1 WHERE id = ?`, [idCluster]);
        if (clusterOld.length === 0) {
            return res.status(404).json({ message: `Cluster not found` });
        }
        const oldData = clusterOld[0];
        const newData = req.body;

        // Cek perubahan
        const changes1 = [];
        const allowedFields = [
            "mitra", "plan_survey", "survey", "plan_delivery", "delivery",
            "plan_instalasi", "instalasi", "plan_integrasi", "integrasi",
            "type_olt", "merk_otn", "is_drop"
        ];

        for (const field of allowedFields) {
            if (newData[field] != oldData[field]) {
                changes1.push({
                    field,
                    prev_value: oldData[field],
                    new_value: newData[field]
                });
            }
        }

        if (changes1.length === 0) {
            return res.status(400).json({ message: "Tidak ada perubahan" });
        }

        // Insert ke logs1
        const now = new Date();
        const [logResult] = await db.query(`
            INSERT INTO logs1 (cluster_id, requested_by, requested_at, flow_status)
            VALUES (?, ?, ?, ?)`, [idCluster, username, now, "Requested"]);

        const logId = logResult.insertId;

        // Insert ke changes
        for (const change of changes1) {
            await db.query(`
                INSERT INTO changes1 (logs_id, field, prev_value, new_value)
                VALUES (?, ?, ?, ?)`,
                [logId, change.field, change.prev_value, change.new_value, 'Pending']);
        }

        res.status(200).json({ message: "Request berhasil diajukan untuk approval" });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ status: "Server error", details: error.message });
    }
});




module.exports = router;
