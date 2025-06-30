const express = require('express');
const router = express.Router();
const db = require('../db'); // Adjust the path to your db module
const { authorizeGuest } = require('../middleware/authorize');

// get all data for tree graph
router.get("/get-data", authorizeGuest,  async (req, res) => {
    try {

    const { filterMitra, filterRegional, filterPrioritas } = req.query; // Get filter values from query params
        
        // Initialize the SQL query and parameters array
        let sql = `
            SELECT 
                status, COUNT(*) AS count 
            FROM 
                clusters c
            JOIN sto s
                ON c.sto_id = s.id AND c.witel_id = s.witel_id
            JOIN witel w
                ON s.witel_id = w.id
            JOIN regional r
                ON w.regional_id = r.id
            WHERE 
                1=1`;
        let params = [];

        // Apply filters based on the received query parameters
        if (filterMitra) {
            sql += ` AND mitra = ?`; // Filter by mitra (fh or zte)
            params.push(filterMitra);
        }
        
        if (filterRegional) {
            sql += ` AND r.name = ?`; // Filter by regional (REG 1, REG 2, etc.)
            params.push(filterRegional);
        }

        if (filterPrioritas) {
            sql += ` AND status_osp = ?`; // Filter by regional (REG 1, REG 2, etc.)
            params.push(filterPrioritas);
        }
        
        sql += ` GROUP BY status ORDER BY status`; // Group by status and order by status
        
        const [statusCounter] = await db.query(sql, params);
        
        const statusMap = {
            "Drop": "dropNotYet",
            "Plan Delivery": "planDelivery",
            "Plan Instalasi": "planInstalasi",
            "Plan Integrasi": "planIntegrasi",
            "Plan Survey": "planSurvey",
            "Realisasi Delivery": "realisasiDelivery",
            "Realisasi Instalasi": "realisasiInstalasi",
            "Realisasi Integrasi": "realisasiIntegrasi",
            "Realisasi Survey": "realisasiSurvey"
        };
        
        // Initialize all variables with default value 0
        const statusCounts = Object.fromEntries(Object.values(statusMap).map(key => [key, 0]));
        
        // Populate counts dynamically
        statusCounter.forEach(({ status, count }) => {
            const key = statusMap[status];
            if (key) statusCounts[key] = count;
        });

        // Kalkulasi status
        const relokasiNotYet = 0;
        const survey = statusCounts.planSurvey + statusCounts.realisasiSurvey;
        const delivery = statusCounts.planDelivery + statusCounts.realisasiDelivery;
        const instalasi = statusCounts.planInstalasi + statusCounts.realisasiInstalasi;
        const integrasi = statusCounts.planIntegrasi + statusCounts.realisasiIntegrasi;
        const notYet = statusCounts.dropNotYet + relokasiNotYet;
        const overall = notYet + survey + delivery + instalasi + integrasi;

        // index sesuai dengan id node
        const result = [
            overall,
            notYet, 
            survey, 
            delivery, 
            instalasi, 
            integrasi, 
            statusCounts.dropNotYet, 
            relokasiNotYet, 
            statusCounts.planSurvey, 
            statusCounts.realisasiSurvey, 
            statusCounts.planDelivery, 
            statusCounts.realisasiDelivery,
            statusCounts.planInstalasi, 
            statusCounts.realisasiInstalasi, 
            statusCounts.planIntegrasi, 
            statusCounts.realisasiIntegrasi
        ]
        res.status(200).json({result});
    } catch (error) {
        console.error(error.message);
        res.status(500).json({status: "Server error", details: error.message})
    }
});

module.exports = router;