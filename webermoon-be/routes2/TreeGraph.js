const express = require('express');
const router = express.Router();
const db = require('../db');
const { authorizeGuest } = require('../middleware/authorize');

// Get all data for battery tree graph
router.get('/get-data', authorizeGuest, async (req, res) => {
    try {
        const { filterMitra, filterRegional, filterPrioritas } = req.query;

        let sql = `
      SELECT 
        c.status AS status, COUNT(*) AS count
      FROM clusters2 c
      JOIN sto2 s ON c.sto_id = s.id AND c.witel_id = s.witel_id
      JOIN witel2 w ON s.witel_id = w.id
      JOIN regional2 r ON w.regional_id = r.id
      WHERE 1=1
    `;

        const params = [];

        if (filterMitra) {
            sql += ` AND c.mitra = ?`;
            params.push(filterMitra);
        }

        if (filterRegional) {
            sql += ` AND r.id = ?`;
            params.push(filterRegional);
        }

        if (filterPrioritas) {
            sql += ` AND c.prioritas = ?`;
            params.push(filterPrioritas);
        }

        sql += ` GROUP BY c.status ORDER BY c.status`;

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

        // Inisialisasi dengan 0
        const statusCounts = Object.fromEntries(Object.values(statusMap).map(key => [key, 0]));

        // Isi berdasarkan query
        statusCounter.forEach(({ status, count }) => {
            const key = statusMap[status];
            if (key) statusCounts[key] = count;
        });

        // Hitung agregasi
        const relokasiNotYet = 0;
        const survey = statusCounts.planSurvey + statusCounts.realisasiSurvey;
        const delivery = statusCounts.planDelivery + statusCounts.realisasiDelivery;
        const instalasi = statusCounts.planInstalasi + statusCounts.realisasiInstalasi;
        const integrasi = statusCounts.planIntegrasi + statusCounts.realisasiIntegrasi;
        const notYet = statusCounts.dropNotYet + relokasiNotYet;
        const overall = notYet + survey + delivery + instalasi + integrasi;

        // Urutan sesuai ID node frontend
        const result = [
            overall,                // 0
            notYet,                 // 1
            survey,                 // 2
            delivery,               // 3
            instalasi,              // 4
            integrasi,              // 5
            statusCounts.dropNotYet,       // 6
            relokasiNotYet,                // 7
            statusCounts.planSurvey,       // 8
            statusCounts.realisasiSurvey,  // 9
            statusCounts.planDelivery,     // 10
            statusCounts.realisasiDelivery,// 11
            statusCounts.planInstalasi,    // 12
            statusCounts.realisasiInstalasi,// 13
            statusCounts.planIntegrasi,    // 14
            statusCounts.realisasiIntegrasi// 15
        ];

        res.status(200).json({ result });

    } catch (error) {
        console.error('Error fetching tree graph data:', error);
        res.status(500).json({ status: "Server error", details: error.message });
    }
});

module.exports = router;

