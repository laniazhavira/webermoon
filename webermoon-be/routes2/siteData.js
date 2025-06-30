const express = require('express');
const router = express.Router();
const db = require('../db'); // Adjust the path to your db module
const { authorizeUser, authorizeGuest, authorizeMitra } = require('../middleware/authorize');
const { isValidDate } = require('../utils/parseDate');

// Group by region witel or sto
const groupByName = (data) => {
    return data.reduce((acc, { id, name, status, count }) => {
        if (!acc[name]) {
            acc[name] = { id, values: [] };
        }
        acc[name].values.push({ status, count });
        return acc;
    }, {});
};

// Group by priority
const groupByPriority = (data) => {
    return data.reduce((acc, { name, priority, count }) => {
        if (!acc[name]) {
            acc[name] = {};
        }

        if (!acc["Total"]) {
            acc["Total"] = {};
        }

        acc[name][priority] = count;
        acc["Total"][priority] = (acc["Total"][priority] || 0) + count;
        return acc;
    }, {});
};

// Group by status for chart data
const groupByStatus = (data) => {
    return data.reduce((acc, { month_year, status, count }) => {

        if (!acc[status]) {
            acc[status] = { values: [], cumulativeSum: 0 };
        }

        // Accumulate the count
        acc[status].cumulativeSum += count;

        acc[status].values.push({ month_year, count: acc[status].cumulativeSum });
        return acc;
    }, {});
};

const curveFilterCondition = (filterRegional, params) => {
    let filterCondition = '';
    if (filterRegional) {
        const regionalArray = filterRegional.split(', ').map(item => item.trim()); // Ensure it's an array
        if (regionalArray.length > 0) {
            const index = regionalArray.map(() => '?').join(', '); // Create ?, ? dynamically

            filterCondition += ` AND r.id IN (${index})`;
            params.push(...regionalArray); // Spread array values into params
        }
    }
    return filterCondition;
}

// For curve sql query
function generateQuery(columnName, statusCondition, filterRegional, params) {
    return `
        SELECT 
            COALESCE(DATE_FORMAT(STR_TO_DATE(${columnName}, '%d-%b-%Y'), '%b %Y'), 'Unscheduled') AS month_year, 
            status, 
            COUNT(*) AS count
        FROM clusters2 c
        JOIN sto2 s
            ON c.sto_id = s.id AND c.witel_id = s.witel_id
        JOIN witel2 w
            ON s.witel_id = w.id
        JOIN regional2 r
            ON w.regional_id = r.id
        WHERE status = '${statusCondition}'
        ${curveFilterCondition(filterRegional, params)}
        GROUP BY month_year, status
        HAVING month_year != 'Unscheduled'
    `;
}

// get all data for each table region, witel, sto
router.get("/table", authorizeGuest, async(req, res) => {
    try {

        const { filterRegional, filterWitel, filterSto, type } = req.query; // Get filter values from query params

        // Initialize the SQL query and parameters array
        let valueTable, orderValue;
        if (!filterRegional || type === 'regional') {
            valueTable = 'r.id, r.name';
            orderValue = 'r.name';
        } else if (!filterWitel || type === 'witel') {
            valueTable = 'w.id, w.name';
            orderValue = 'w.name';
        } else {
            valueTable = 's.id, s.name';
            orderValue = 's.name';
        }

        let sql = `
            SELECT 
                ${valueTable}, status, COUNT(*) AS count 
            FROM 
                clusters2 c
            JOIN sto2 s
                ON c.sto_id = s.id AND c.witel_id = s.witel_id
            JOIN witel2 w
                ON s.witel_id = w.id
            JOIN regional2 r
                ON w.regional_id = r.id
            WHERE 
                1=1`;
        let params = [];
        if (filterSto) {
            sql += ` AND r.id = ? AND w.id = ?`;
            params.push(filterRegional, filterWitel);

            const stoArray = filterSto.split(', ').map(item => item.trim()); // Ensure it's an array
            if (stoArray.length > 0) {
                const index = stoArray.map(() => '?').join(', '); // Create ?, ?, ? dynamically

                sql += ` AND s.id IN (${index})`;
                params.push(...stoArray); // Spread array values into params
            }
        } else if (filterWitel) {
            sql += ` AND r.id = ?`;
            params.push(filterRegional);

            const witelArray = filterWitel.split(', ').map(item => item.trim()); // Ensure it's an array
            if (witelArray.length > 0) {
                const index = witelArray.map(() => '?').join(', '); // Create ?, ?, ? dynamically

                sql += ` AND w.id IN (${index})`;
                params.push(...witelArray); // Spread array values into params
            }
        } else if (filterRegional) {
            const regionalArray = filterRegional.split(', ').map(item => item.trim()); // Ensure it's an array
            if (regionalArray.length > 0) {
                const index = regionalArray.map(() => '?').join(', '); // Create ?, ?, ? dynamically

                sql += ` AND r.id IN (${index})`;
                params.push(...regionalArray); // Spread array values into params
            }
        }
        sql += ` GROUP BY ${valueTable}, status ORDER BY ${orderValue}, status`;


        const [tmp] = await db.query(sql, params);
        const response = groupByName(tmp);

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

        result = {};
        let total = new Array(15).fill(0);

        // Populate counts dynamically
        for (const key in response) {
            const statusCounts = Object.fromEntries(Object.values(statusMap).map(key => [key, 0]));
            if (response.hasOwnProperty(key)) {
                const { id, values } = response[key];
                // Populate counts dynamically
                values.forEach(({ status, count }) => {
                    const key = statusMap[status];
                    if (key) statusCounts[key] = count;
                });
                // Kalkulasi status
                const relokasiNotYet = 0;
                // index sesuai dengan id node
                const finalCount = [
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

                finalCount.forEach((value, index) => { total[index] += finalCount[index] });

                // Save to result object
                result[key] = { id, values: finalCount };
            }
            result = {...result, Total: { id: null, values: total } };
        }

        // Make it so total is inserted last
        const orderedEntries = [
            ...Object.entries(result).filter(([key]) => key !== "Total"), ["Total", result.Total] // Append Total at the end
        ];
        const orderedResult = Object.fromEntries(orderedEntries);

        res.status(200).json({ result: orderedResult });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ status: "Server error", details: error.message })
    }
});

// get data for counting priority in each region
router.get("/priority", authorizeGuest, async(req, res) => {
    try {

        const { filterRegional, filterWitel, filterSto, type } = req.query; // Get filter values from query params

        // Initialize the SQL query and parameters array
        let valueTable;
        if (!filterRegional || type === 'regional') {
            valueTable = 'r.name';
        } else if (!filterWitel || type === 'witel') {
            valueTable = 'w.name';
        } else {
            valueTable = 's.name';
        }

        let sql = `
            SELECT 
                ${valueTable}, prioritas as priority, COUNT(*) AS count 
            FROM 
                clusters2 c
            JOIN sto2 s
                ON c.sto_id = s.id AND c.witel_id = s.witel_id
            JOIN witel2 w
                ON s.witel_id = w.id
            JOIN regional2 r
                ON w.regional_id = r.id
            WHERE 
                1=1`;
        let params = [];
        if (filterSto) {
            sql += ` AND r.id = ? AND w.id = ?`;
            params.push(filterRegional, filterWitel);

            const stoArray = filterSto.split(', ').map(item => item.trim()); // Ensure it's an array
            if (stoArray.length > 0) {
                const index = stoArray.map(() => '?').join(', '); // Create ?, ?, ? dynamically

                sql += ` AND s.id IN (${index})`;
                params.push(...stoArray); // Spread array values into params
            }
        } else if (filterWitel) {
            sql += ` AND r.id = ?`;
            params.push(filterRegional);

            const witelArray = filterWitel.split(', ').map(item => item.trim()); // Ensure it's an array
            if (witelArray.length > 0) {
                const index = witelArray.map(() => '?').join(', '); // Create ?, ?, ? dynamically

                sql += ` AND w.id IN (${index})`;
                params.push(...witelArray); // Spread array values into params
            }
        } else if (filterRegional) {
            const regionalArray = filterRegional.split(', ').map(item => item.trim()); // Ensure it's an array
            if (regionalArray.length > 0) {
                const index = regionalArray.map(() => '?').join(', '); // Create ?, ?, ? dynamically

                sql += ` AND r.id IN (${index})`;
                params.push(...regionalArray); // Spread array values into params
            }
        }
        sql += ` GROUP BY ${valueTable}, prioritas ORDER BY ${valueTable}, prioritas`;


        const [tmp] = await db.query(sql, params);

        const result = groupByPriority(tmp);
        const orderedEntries = [
            ...Object.entries(result).filter(([key]) => key !== "Total"), ["Total", result.Total] // Append Total at the end
        ];
        const orderedResult = Object.fromEntries(orderedEntries);



        res.status(200).json({ result: orderedResult });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ status: "Server error", details: error.message })
    }
});

// get all data for site table
router.get("/chart", authorizeGuest, async(req, res) => {
    try {

        const { status, filterRegional } = req.query; // Get filter values from query params

        let params = []
        let sql = '';
        if (status === "delivery") {
            sql = `
                ${generateQuery('plan_delivery', 'Plan Delivery', filterRegional, params)}
                UNION ALL
                ${generateQuery('delivery', 'Realisasi Delivery', filterRegional, params)}
                `;
        } else if (status === "instalasi") {
            sql = `
                ${generateQuery('plan_instalasi', 'Plan Instalasi', filterRegional, params)}
                UNION ALL
                ${generateQuery('instalasi', 'Realisasi Instalasi', filterRegional, params)}
                `;
        } else if (status === "integrasi") {
            sql = `
                ${generateQuery('plan_integrasi', 'Plan Integrasi', filterRegional, params)}
                UNION ALL
                ${generateQuery('integrasi', 'Realisasi Integrasi', filterRegional, params)}
                `;
        } else if (status === "survey") {
            sql = `
                ${generateQuery('plan_survey', 'Plan Survey', filterRegional, params)}
                UNION ALL
                ${generateQuery('survey', 'Realisasi Survey', filterRegional, params)}
                `;
        } else {
            sql = generateQuery('is_drop', 'Drop', filterRegional, params);
        }
        sql += ` ORDER BY
                    STR_TO_DATE(CONCAT('01-', month_year), '%d-%b %Y') ASC, 
                    status ASC`;

        const [tmp] = await db.query(sql, params);

        const result = groupByStatus(tmp);

        res.status(200).json({ result });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ status: "Server error", details: error.message })
    }
});

// get all data for site table
router.get("/site", authorizeGuest, async(req, res) => {
    try {

        const { filterSite, filterWitel, filterSto } = req.query; // Get filter values from query params

        let sql = `
            SELECT 
                id, name, is_drop, status, mitra, plan_survey, survey, plan_delivery, delivery, plan_instalasi, instalasi, plan_integrasi, integrasi, type_olt, merk_otn, prioritas
            FROM 
                clusters2 c
            WHERE 
                witel_id = ? AND sto_id = ?`;
        let params = [filterWitel, filterSto];
        if (filterSite) {
            sql += ` AND id = ? ORDER BY name`; // Filter by Site (REG 1, REG 2, etc.) for witel
            params.push(filterSite);
        } else {
            sql += ` ORDER BY name`;
        }

        const [result] = await db.query(sql, params);

        res.status(200).json({ result });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ status: "Server error", details: error.message })
    }
});

// get all data for site table
router.get("/site/:idSite", authorizeGuest, async(req, res) => {
    try {

        const { idSite } = req.params; // Get filter values from query params

        let sql = `
            SELECT 
                c.id as cluster_id, c.name as cluster_name, r.name as regional_name, w.name as witel_name, s.name as sto_name, is_drop, status, mitra, plan_survey, survey, 
                plan_delivery, delivery, plan_instalasi, instalasi, plan_integrasi, integrasi, type_olt, merk_otn, prioritas
            FROM 
                clusters2 c
            JOIN sto2 s
                ON c.sto_id = s.id AND c.witel_id = s.witel_id
            JOIN witel2 w
                ON s.witel_id = w.id
            JOIN regional2 r
                ON w.regional_id = r.id
            WHERE 
                c.id = ?`;
        let params = [idSite];

        const [result] = await db.query(sql, params);
        if (result.length === 0) {
            return res.status(404).json({ message: `cluster with cluster id ${idSite} not found` });
        }

        res.status(200).json({ result: result[0] });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ status: "Server error", details: error.message })
    }
});

// get all data for site table
router.get("/site/form-detail/:idSite", authorizeMitra, async(req, res) => {
    try {

        const { idSite } = req.params; // Get filter values from query params

        let sql = `
            SELECT 
                c.id as cluster_id, c.name as cluster_name, r.name as regional_name, w.name as witel_name, s.name as sto_name, is_drop, status, mitra, plan_survey, survey, 
                plan_delivery, delivery, plan_instalasi, instalasi, plan_integrasi, integrasi, type_olt, merk_otn, prioritas
            FROM
                clusters2 c
            JOIN sto2 s
                ON c.sto_id = s.id AND c.witel_id = s.witel_id
            JOIN witel2 w
                ON s.witel_id = w.id
            JOIN regional2 r
                ON w.regional_id = r.id
            WHERE 
                c.id = ?`;
        let params = [idSite];

        const [result] = await db.query(sql, params);

        if (result.length === 0) {
            return res.status(404).json({ message: `cluster with cluster id ${idSite} not found` });
        }

        res.status(200).json({ result: result[0] });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ status: "Server error", details: error.message })
    }
});

// add new site
router.post("/site/add", authorizeUser, async(req, res) => {
    try {

        // const { filterSite, filterWitel, filterSto } = req.query;

        const {
            name,
            sto_id,
            witel_id,
            status,
            mitra,
            plan_survey,
            survey,
            plan_delivery,
            delivery,
            plan_instalasi,
            instalasi,
            plan_integrasi,
            integrasi,
            is_drop,
            type_olt,
            merk_otn,
            prioritas
        } = req.body;

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

        let sql = `
            INSERT INTO clusters2 
                (name, sto_id, witel_id, status, mitra, plan_survey, survey, plan_delivery, delivery, plan_instalasi, instalasi,
                plan_integrasi, integrasi, is_drop, type_olt, merk_otn, prioritas)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        let params = [name, sto_id, witel_id, status, mitra, plan_survey, survey, plan_delivery, delivery, plan_instalasi, instalasi,
                plan_integrasi, integrasi, is_drop, type_olt, merk_otn, prioritas
        ];

        const [result] = await db.query(sql, params);

        res.status(201).json({ message: "Successfully added new site!", result });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ status: "Server error", details: error.message })
    }
});

module.exports = router;