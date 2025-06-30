const express = require('express');
const router = express.Router();
const db = require('../db');
const fileUpload = require('express-fileupload');
const exceljs = require('exceljs');
const { authorizeAdmin, authorizeUser } = require('../middleware/authorize');

function formatTime(time) {
    // Check if time is a valid timestamp (number or Date object)
    if (time && !isNaN(new Date(time).getTime())) {
        // Parse the timestamp and format it as "DD-MMM-YYYY"
        const date = new Date(time);
        const day = String(date.getDate()).padStart(2, '0'); // Ensure 2 digits for day
        const month = date.toLocaleString('default', { month: 'short' }).toUpperCase(); // Get short month name
        const year = date.getFullYear();

        return `${day}-${month}-${year}`;
    }

    // If time is not a valid timestamp, return it as is
    return time;
}

function normalizeDate(date) {
    if (!date) return null; // Handle undefined/null cases

    if (!(date instanceof Date)) {
        date = new Date(date); // Convert string/number to Date
    }

    if (isNaN(date.getTime())) {
        throw new Error(`Invalid date: ${date}`);
    }

    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

// Function to format date values in "dd-MMM-YYYY" format
const formatExcelDate = (value) => {
    if (!value) return null; // Return null if value is empty
    const date = new Date(value);
    if (isNaN(date)) return value; // Return original if it's not a valid date

    const excelSerial = (Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) - Date.UTC(1899, 11, 30)) / (1000 * 60 * 60 * 24);

    return excelSerial;
};


function getResultValue(value) {
    if (!value) return null; // Handle empty cell case
    if (value.error) return null;

    if (value.result) {
        return value.result; // Return the 'result' if it's an object with a 'result' property
    }

    // If 'cell' has a formula but no computed result, fallback to 'value'
    if (value.formula && !value.result) {
        return null;
    }

    return value; // Return the value as is if it's a plain value
}

async function getNextStoId(connection, witelId) {
    try {
        await connection.beginTransaction();

        // Query the highest `sto_id` for the given `witel_id`
        const [result] = await connection.query(
            `SELECT MAX(id) AS max_id FROM sto WHERE witel_id = ?`, [witelId]
        );

        await connection.commit();

        // If there's no existing record, return 1 (or another starting value)
        const nextStoId = result[0] && result[0].max_id != null ? result[0].max_id + 1 : 1;

        return nextStoId;
    } catch (err) {
        await connection.rollback(); // Rollback on failure
        console.error(err.message);
        throw err; // Rethrow error for the caller to handle
    }
}


// Dynamically insert based on the table and value it provide (Regional, Witel, STO)
async function getOrInsert(connection, table, value, cache, additionalFields = {}) {
    if (cache[value]) return cache[value];

    try {
        // Start a transaction
        await connection.beginTransaction();

        // Check if the value already exists
        const [existing] = await connection.query(
            `SELECT id FROM ${table} WHERE name = ?`, [value]
        );
        if (existing.length > 0) {
            cache[value] = existing[0].id;
            await connection.commit();
            return existing[0].id;
        }

        // Insert new record
        const [result] = await connection.query(
            `INSERT INTO ${table} (name${Object.keys(additionalFields).length ? ', ' + Object.keys(additionalFields).join(', ') : ''}) 
             VALUES (?${Object.keys(additionalFields).length ? ', ' + Object.values(additionalFields).map(() => '?').join(', ') : ''})`, [value, ...Object.values(additionalFields)]
        );

        await connection.commit(); // Commit the transaction

        cache[value] = result.insertId;
        return result.insertId;
    } catch (error) {
        await connection.rollback(); // Rollback on failure
        console.error(error.message);
    }
}


async function getOrInsertWeakEntity(connection, table, value, cache, additionalFields) {
    if (!value) value = "ini kolom kosong";
    const compositeKey = `${value}-${additionalFields.witel_id}`;

    if (cache[compositeKey]) {
        return cache[compositeKey]; // Return cached ID
    }

    try {
        await connection.beginTransaction(); // Start transaction

        // Check if the STO already exists
        const [existing] = await connection.query(
            `SELECT id FROM ${table} WHERE name = ? AND witel_id = ?`, [value, additionalFields.witel_id]
        );
        if (existing.length > 0) {
            cache[compositeKey] = existing[0].id;
            await connection.commit();
            return existing[0].id;
        }

        // Get next available sto_id
        const newStoId = await getNextStoId(connection, additionalFields.witel_id);

        // Insert new STO record
        await connection.query(
            `INSERT INTO ${table} (id, name, witel_id) VALUES (?, ?, ?)`, [newStoId, value, additionalFields.witel_id]
        );

        await connection.commit(); // Commit transaction

        cache[compositeKey] = newStoId;
        return newStoId;
    } catch (error) {
        await connection.rollback(); // Rollback on failure
        console.error(error.message);
    }
}


// Determine status and extract all data from the row
function extractRowData(row, type) {
    const mappings = {
        "zte": {
            regional: 2,
            witel: 3,
            sto: 6,
            ihld: 7,
            cluster: 8,
            catuanId: 10,
            remark: 19,
            statusOsp: 16,
            keteranganOsp: 12,
            planSurvey: 20,
            survey: 21,
            planDelivery: 22,
            delivery: 23,
            planInstalasi: 24,
            instalasi: 25,
            planIntegrasi: 26,
            integrasi: 27,
            drop: 28
        },
        "fh": {
            regional: 2,
            witel: 3,
            sto: 4,
            cluster: 6,
            ihld: 7,
            catuanId: 8,
            remark: 66,
            statusOsp: 15,
            keteranganOsp: 13,
            planSurvey: 30,
            survey: 32,
            planDelivery: 33,
            delivery: 35,
            planInstalasi: 48,
            instalasi: 50,
            planIntegrasi: 60,
            integrasi: 62,
            drop: 65
        }
    };

    const cols = mappings[type];
    const now = new Date();
    const regionalName = getResultValue(row.getCell(cols.regional).value);
    const witelName = getResultValue(row.getCell(cols.witel).value);
    // Set value sto to null if it is '.'
    const stoName = getResultValue(row.getCell(cols.sto).value === '.' ? '' : row.getCell(cols.sto).value);
    const clusterName = getResultValue(row.getCell(cols.cluster).value);
    const remark = getResultValue(row.getCell(cols.remark).value);
    const keteranganOsp = getResultValue(row.getCell(cols.keteranganOsp).value);
    const planSurvey = getResultValue(row.getCell(cols.planSurvey).value);
    const survey = getResultValue(row.getCell(cols.survey).value);
    const planDelivery = getResultValue(row.getCell(cols.planDelivery).value);
    const delivery = getResultValue(row.getCell(cols.delivery).value);
    const planInstalasi = getResultValue(row.getCell(cols.planInstalasi).value);
    const instalasi = getResultValue(row.getCell(cols.instalasi).value);
    const planIntegrasi = getResultValue(row.getCell(cols.planIntegrasi).value);
    const integrasi = getResultValue(row.getCell(cols.integrasi).value);
    const ihld = getResultValue(row.getCell(cols.ihld).value);
    const catuanId = getResultValue(row.getCell(cols.catuanId).value);
    const drop = !!row.getCell(cols.drop).value;

        let statusOsp = getResultValue(row.getCell(cols.statusOsp).value);
        if (type === "zte") {
            if (statusOsp.includes("Drop")) statusOsp = "P4";
            else if (keteranganOsp === "0. PROPOSE DROP") statusOsp = "P4";
            else if (statusOsp === "P1 (Need Uplink)") statusOsp = "P1";
        } else {
            if (statusOsp !== "P1" && statusOsp !== "P2" && statusOsp !== "P3") {
                if (keteranganOsp === "0. DROP") statusOsp = "P4";
                else statusOsp = "P1";
            }
        }
        let status;

if (drop) {
  status = 'Drop';
} else if (integrasi) {
  status = 'Realisasi Integrasi';
} else if (planIntegrasi) {
  status = 'Plan Integrasi';
} else if (instalasi) {
  status = 'Realisasi Instalasi';
} else if (planInstalasi) {
  status = 'Plan Instalasi';
} else if (delivery) {
  status = 'Realisasi Delivery';
} else if (planDelivery) {
  status = 'Plan Delivery';
} else if (survey && String(survey).toLowerCase() !== 'drop') {
  status = 'Realisasi Survey';
} else if (planSurvey) {
  status = 'Plan Survey';
} else {
  status = 'Plan Survey'; // fallback if all fields empty
}




    return {
        regionalName,
        witelName,
        stoName,
        clusterName,
        remark,
        statusOsp,
        keteranganOsp,
        ihld,
        catuanId,
        planSurvey,
        survey,
        planDelivery,
        delivery,
        planInstalasi,
        instalasi,
        planIntegrasi,
        integrasi,
        drop,
        status
    };
}

router.post("/excel-upload", authorizeAdmin, fileUpload(), async(req, res) => {
    const connection = await db.getConnection(); // Get connection for transaction
    try {
        await connection.beginTransaction(); // Start transaction

        if (!req.files || !req.files.excelFile) {
            return res.status(400).send('No file uploaded.');
        }

        const file = req.files.excelFile;
        const workbook = new exceljs.Workbook();
        await workbook.xlsx.load(file.data);

        const { type } = req.body;
        if (type !== "zte" && type !== "fh") {
            return res.status(400).json({ error: "Invalid type. Use 'zte' or 'fh'." });
        }

        const worksheet = workbook.getWorksheet("Data");
        if (!worksheet) {
            return res.status(404).json({ error: "Sheet 'Data' not found." });
        }

        let sql = `DELETE r 
                    FROM regional r
                    JOIN witel w ON w.regional_id = r.id
                    JOIN sto s ON s.witel_id = w.id  
                    JOIN clusters c ON c.sto_id = s.id AND c.witel_id = s.witel_id
                    WHERE c.mitra = ?`;
        await connection.query(sql, [type]);

        let regionalCache = {},
            witelCache = {},
            stoCache = {};
        const rows = [];
        worksheet.eachRow((row, rowNumber) => {
            if (type === "fh" && rowNumber > 498) return;
            if (rowNumber > 2) rows.push(row);
        });

        for (const row of rows) {
            const {
                regionalName,
                witelName,
                stoName,
                clusterName,
                status,
                drop,
                remark,
                statusOsp,
                keteranganOsp,
                ihld,
                catuanId,
                planSurvey,
                survey,
                planDelivery,
                delivery,
                planInstalasi,
                instalasi,
                planIntegrasi,
                integrasi
            } = extractRowData(row, type);

            let regionalId = await getOrInsert(connection, "regional", regionalName, regionalCache, {}, connection);
            let witelId = await getOrInsert(connection, "witel", witelName, witelCache, { regional_id: regionalId }, connection);
            let stoId = await getOrInsertWeakEntity(connection, "sto", stoName, stoCache, { witel_id: witelId }, connection);

            const query = `
                INSERT INTO clusters 
                    (name, sto_id, witel_id, status, remark, status_osp, keterangan_osp, ihld, catuan_id, plan_survey, survey, 
                    plan_delivery, delivery, plan_instalasi, instalasi, plan_integrasi, integrasi, is_drop, mitra) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            await connection.query(query, [
                clusterName, stoId, witelId, status, remark, statusOsp, keteranganOsp, ihld, catuanId, formatTime(planSurvey),
                formatTime(survey), formatTime(planDelivery), formatTime(delivery), formatTime(planInstalasi),
                formatTime(instalasi), formatTime(planIntegrasi), formatTime(integrasi), drop, type
            ]);
        }

        await connection.commit(); // Commit transaction
        res.status(200).json({ message: "Data berhasil di insert" });
    } catch (error) {
        await connection.rollback(); // Rollback transaction on error
        console.error(error);
        res.status(500).send("Server error");
    } finally {
        connection.release(); // Release connection
    }
});

router.get("/export-excel", async(req, res) => {
    try {
        let sql = `SELECT 
                    r.name as REGIONAL, w.name as WITEL, s.name as STO, c.name as Cluster, ihld as IHLD_ID, catuan_id as CATUAN_ID, mitra as MITRA, status_osp as PRIO, keterangan_osp as STATUS_OSP, 
                    plan_survey as PLAN_SURVEY, survey as AKTUAL_SURVEY, plan_delivery as PLAN_DELIVERY, delivery as AKTUAL_DELIVERY, plan_instalasi as PLAN_INSTALASI, instalasi as AKTUAL_INSTALASI,
                    plan_integrasi as PLAN_INTEGRASI, integrasi as AKTUAL_INTEGRASI, CASE WHEN is_drop = 1 THEN 'Drop' ELSE NULL END AS 'DROP', remark as REMARK
                   FROM 
                    clusters c
                   JOIN sto s
                        ON c.sto_id = s.id AND c.witel_id = s.witel_id
                    JOIN witel w
                        ON s.witel_id = w.id
                    JOIN regional r
                        ON w.regional_id = r.id`
        const [data] = await db.query(sql);

        // Create a new Excel workbook and worksheet
        const workbook = new exceljs.Workbook();
        const worksheet = workbook.addWorksheet("Data");

        // Define Excel columns
        worksheet.columns = [
            { header: "REGIONAL", key: "REGIONAL", width: 15 },
            { header: "WITEL", key: "WITEL", width: 15 },
            { header: "STO", key: "STO", width: 15 },
            { header: "Cluster", key: "Cluster", width: 70 },
            { header: "IHLD ID", key: "IHLD_ID", width: 15 },
            { header: "CATUAN ID", key: "CATUAN_ID", width: 15 },
            { header: "MITRA", key: "MITRA", width: 15 },
            { header: "PRIO", key: "PRIO", width: 10 },
            { header: "STATUS OSP", key: "STATUS_OSP", width: 20 },
            { header: "PLAN SURVEY", key: "PLAN_SURVEY", width: 15 },
            { header: "AKTUAL SURVEY", key: "AKTUAL_SURVEY", width: 15 },
            { header: "PLAN DELIVERY", key: "PLAN_DELIVERY", width: 15 },
            { header: "AKTUAL DELIVERY", key: "AKTUAL_DELIVERY", width: 15 },
            { header: "PLAN INSTALASI", key: "PLAN_INSTALASI", width: 15 },
            { header: "AKTUAL INSTALASI", key: "AKTUAL_INSTALASI", width: 15 },
            { header: "PLAN INTEGRASI", key: "PLAN_INTEGRASI", width: 15 },
            { header: "AKTUAL INTEGRASI", key: "AKTUAL_INTEGRASI", width: 15 },
            { header: "DROP", key: "DROP", width: 10 },
            { header: "REMARK", key: "REMARK", width: 90 },
        ];

        // Process data and add rows
        data.forEach(row => {
            worksheet.addRow({
                REGIONAL: row.REGIONAL,
                WITEL: row.WITEL,
                STO: row.STO,
                Cluster: row.Cluster,
                IHLD_ID: row.IHLD_ID,
                CATUAN_ID: row.CATUAN_ID,
                MITRA: row.MITRA.toUpperCase(),
                PRIO: row.PRIO,
                STATUS_OSP: row.STATUS_OSP,
                PLAN_SURVEY: formatExcelDate(row.PLAN_SURVEY),
                AKTUAL_SURVEY: formatExcelDate(row.AKTUAL_SURVEY),
                PLAN_DELIVERY: formatExcelDate(row.PLAN_DELIVERY),
                AKTUAL_DELIVERY: formatExcelDate(row.AKTUAL_DELIVERY),
                PLAN_INSTALASI: formatExcelDate(row.PLAN_INSTALASI),
                AKTUAL_INSTALASI: formatExcelDate(row.AKTUAL_INSTALASI),
                PLAN_INTEGRASI: formatExcelDate(row.PLAN_INTEGRASI),
                AKTUAL_INTEGRASI: formatExcelDate(row.AKTUAL_INTEGRASI),
                DROP: row.DROP,
                REMARK: row.REMARK,
            });
        });

        worksheet.getColumn("PLAN_SURVEY").numFmt = "DD-MMM-YYYY";
        worksheet.getColumn("AKTUAL_SURVEY").numFmt = "DD-MMM-YYYY";
        worksheet.getColumn("PLAN_DELIVERY").numFmt = "DD-MMM-YYYY";
        worksheet.getColumn("AKTUAL_DELIVERY").numFmt = "DD-MMM-YYYY";
        worksheet.getColumn("PLAN_INSTALASI").numFmt = "DD-MMM-YYYY";
        worksheet.getColumn("AKTUAL_INSTALASI").numFmt = "DD-MMM-YYYY";
        worksheet.getColumn("PLAN_INTEGRASI").numFmt = "DD-MMM-YYYY";
        worksheet.getColumn("AKTUAL_INTEGRASI").numFmt = "DD-MMM-YYYY";

        // Set row height for all rows
        worksheet.eachRow((row, rowNumber) => {

            row.eachCell({ includeEmpty: true }, (cell) => {
                cell.alignment = {
                    horizontal: 'center',
                    vertical: 'middle',
                    wrapText: true
                };

                // Apply solid 1px black border for all cells
                cell.border = {
                    top: { style: 'thin', color: { argb: '000000' } },
                    left: { style: 'thin', color: { argb: '000000' } },
                    bottom: { style: 'thin', color: { argb: '000000' } },
                    right: { style: 'thin', color: { argb: '000000' } }
                };

                // Apply background color only for header row
                if (rowNumber === 1) {
                    row.height = 30;
                    cell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'BFBFBF' }
                    };
                    cell.font = { bold: true };
                }
            });
        });

        // Set response headers to return an Excel file
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.setHeader("Content-Disposition", "attachment; filename=Progress Preorder Mini OLT.xlsx");

        // Write workbook to response stream
        await workbook.xlsx.write(res);
        res.end();

    } catch (err) {
        console.error(err);
        res.status(500).send({ status: "Server Error", details: err.message });
    }
});

module.exports = router;