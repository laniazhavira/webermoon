const express = require('express');
const router = express.Router();
const db = require('../db'); // Adjust the path to your db module
const { authorizeUser, authorizeMitra, authorizeAdmin } = require('../middleware/authorize');
const { isValidDate } = require('../utils/parseDate');

// get All request data
router.get("/all", authorizeUser, async(req, res) => {
    try {

        const { role, username } = req.user;
        let params = []
        let sql = `
            SELECT 
                id, flow_status, cluster_id, requested_by, requested_at, approved_by, approved_at
            FROM 
                logs
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
        res.status(500).json({ status: "Server error", details: error.message })
    }
});

// get site detail by request id
router.get("/site/detail/:idRequest", authorizeUser, async(req, res) => {
    try {
        const { idRequest } = req.params;

        // Fetch cluster details
        const clusterSql = `
            SELECT 
                c.id as cluster_id, c.name as cluster_name, r.name as regional_name, w.name as witel_name, s.name as sto_name,
                c.remark, c.status_osp, c.plan_survey, c.survey,
                c.plan_delivery, c.delivery, c.plan_instalasi, c.instalasi,
                c.plan_integrasi, c.integrasi, c.is_drop, c.ihld, c.catuan_id
            FROM clusters c
            JOIN sto s ON c.sto_id = s.id AND c.witel_id = s.witel_id
            JOIN witel w ON s.witel_id = w.id
            JOIN regional r ON w.regional_id = r.id
            WHERE c.id = (SELECT cluster_id FROM logs WHERE id = ?)`;
        const [clusterResult] = await db.query(clusterSql, [idRequest]);

        if (clusterResult.length === 0) {
            return res.status(404).json({ message: `Cluster with request ID ${idRequest} not found` });
        }

        // Fetch column-level changes
        const changesSql = `
            SELECT 
                field, prev_value, new_value, status
            FROM changes
            WHERE logs_id = ?`;
        const [changes] = await db.query(changesSql, [idRequest]);

        res.status(200).json({ cluster: clusterResult[0], changes });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ status: "Server error", details: error.message });
    }
});

// get request detail by id
router.get("/detail/:idRequest", authorizeUser, async(req, res) => {
    try {

        const { idRequest } = req.params;
        const { username, role } = req.user
        let sql = `
            SELECT 
                *
            FROM 
                logs
            WHERE 
                id = ? `;
        let params = [idRequest];
        if (role === "mitra") {
            sql += ` AND requested_by = ?`;
            params.push(username);
        }

        const [result] = await db.query(sql, params);

        if (result.length === 0) {
            return res.status(400).json({ message: `request not found` });
        }

        sql = `SELECT field, prev_value, new_value FROM changes WHERE logs_id = ?`

        const [changes] = await db.query(sql, [idRequest]);

        if (changes.length > 0) {
            return res.status(200).json({ message: "Changes detected", changes, status: result[0].flow_status, notes: result[0].notes });
        } else {
            return res.status(200).json({ message: "No changes detected", status: result[0].flow_status, notes: result[0].notes });
        }

        // res.status(200).json({ existing, result });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ status: "Server error", details: error.message })
    }
});

// change request status and update site
router.patch("/verify/:idRequest", authorizeAdmin, async(req, res) => {
    try {
        const { username } = req.user;
        const { idRequest } = req.params;
        const { flowStatus, notes, change } = req.body;

        if (change.length === 0) {
            return res.status(400).json({ message: "Nothing to change" });
        }

        const [log] = await db.query(`SELECT flow_status as status FROM logs WHERE id = ?`, [idRequest]);

        if (log.length === 0) {
            return res.status(404).json({ message: `Request with id ${idRequest} not found` })
        }

        if (log[0].status !== "Requested") {
            return res.status(409).json({ message: "Request sudah pernah diverifikasi sebelumnya" })
        }

        const now = new Date();

        let sql = `
            UPDATE logs
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
                        clusters
                    WHERE 
                        id = (SELECT
                                    cluster_id
                                FROM
                                    logs
                                WHERE
                                    id = ?)`;
            const [id] = await db.query(sql, [idRequest]);

            // Build the SET clause dynamically
            const setClause = change.map(change => `${change.field} = ?`).join(", ");

            // Extract values for placeholders
            const values = change.map(change => change.new_value);
            values.push(id[0].id)

            sql = `UPDATE clusters SET ${setClause} WHERE id = ?`
            await db.query(sql, values);

            // Update status dynamically
            const sqlSelect = `
                SELECT survey, plan_delivery, delivery, plan_instalasi, instalasi, 
                    plan_integrasi, integrasi, is_drop 
                FROM clusters WHERE id = ?`;
            const [rows] = await db.query(sqlSelect, [id[0].id]);

            const { survey, plan_delivery, delivery, plan_instalasi, instalasi, plan_integrasi, integrasi, is_drop } = rows[0];

            let status;
            let now = new Date();

            if (is_drop) status = "Drop";
            else if (isValidDate(integrasi)) status = 'Realisasi Integrasi';
            else if (!isValidDate(integrasi) && isValidDate(instalasi) && isValidDate(plan_integrasi) && now >= isValidDate(plan_integrasi)) status = 'Plan Integrasi';
            else if (isValidDate(instalasi)) status = 'Realisasi Instalasi';
            else if (!isValidDate(instalasi) && isValidDate(delivery) && isValidDate(plan_instalasi) && now >= isValidDate(plan_instalasi)) status = 'Plan Instalasi';
            else if (isValidDate(delivery)) status = 'Realisasi Delivery';
            else if (!isValidDate(delivery) && isValidDate(survey) && isValidDate(plan_delivery) && now >= isValidDate(plan_delivery)) status = 'Plan Delivery';
            else if (isValidDate(survey)) status = 'Realisasi Survey';
            else status = 'Plan Survey';

            const sqlUpdateStatus = `UPDATE clusters SET status = ? WHERE id = ?`;
            await db.query(sqlUpdateStatus, [status, id[0].id]);

            return res.status(200).json({ message: "Approve request successful" });
        }

        res.status(200).json({ message: "Reject request successful" });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ status: "Server error", details: error.message })
    }
});

// add request by site id
router.post("/site/:idCluster/add", authorizeMitra, async(req, res) => {
    try {

        const { idCluster } = req.params;

        if (!idCluster) {
            return res.status(400).json({ message: "idCluster is required" });
        }

        const [cluster] = await db.query(`SELECT * FROM clusters WHERE id = ?`, [idCluster]);
        if (cluster.length === 0) {
            return res.status(404).json({ message: `cluster with cluster id ${idCluster} not found` });
        }

        const fields = [
            'remark', 'status_osp', 'plan_survey', 'survey',
            'plan_delivery', 'delivery', 'plan_instalasi', 'instalasi',
            'plan_integrasi', 'integrasi', 'is_drop', 'ihld', 'catuan_id'
        ];
        let changes = [];

        fields.forEach(field => {
            if (cluster[0][field] !== req.body[field]) {
                changes.push({
                    field,
                    existingValue: cluster[0][field],
                    newValue: req.body[field]
                });
            }
        });

        if (changes.length === 0) {
            return res.status(400).json({ message: "No changes detected. Please update at least one field." });
        }

        const { username } = req.user;
        const now = new Date();

        let sql = `INSERT INTO logs (cluster_id, requested_by, requested_at, flow_status)
                    VALUES
                        (?, ?, ?, ?)`
        const [logResult] = await db.query(sql, [idCluster, username, now, "Requested"]);

        // Insert changes into the changes table
        for (const change of changes) {
            sql = `INSERT INTO changes (logs_id, field, prev_value, new_value)
                    VALUES (?, ?, ?, ?)`;
            await db.query(sql, [logResult.insertId, change.field, change.existingValue, change.newValue]);
        }

        res.status(201).json({ message: "Successfully created the request" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ status: "Server error", details: error.message })
    }
});

module.exports = router;