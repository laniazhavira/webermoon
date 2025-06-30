const express = require('express');
const router = express.Router();
const db = require('../db');
const fileUpload = require('express-fileupload');
const exceljs = require('exceljs');
const { authorizeAdmin } = require('../middleware/authorize');

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

// Normalize date to YYYY-MM-DD (strip time). Return null if invalid.
function normalizeDate(date) {
    if (!date) return null;
    if (!(date instanceof Date)) {
        date = new Date(date); // Convert string/number to Date
    }
    if (isNaN(date.getTime())) {
        throw new Error(`Invalid date: ${date}`);
    }
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

// Get or Insert into a table with caching support and optional additional fields (eg. foreign key references)
async function getOrInsert(connection, table, value, cache, additionalFields = {}) {
    if (!value) return null;
    if (cache[value]) return cache[value];

    try {
        // Check if exists
        const [existing] = await connection.query(
            `SELECT id FROM ${table} WHERE name = ?`, [value]
        );
        if (existing.length > 0) {
            cache[value] = existing[0].id;
            return existing[0].id;
        }

        // Prepare query components
        const addFieldsKeys = Object.keys(additionalFields);
        const columns = addFieldsKeys.length ? `name, ${addFieldsKeys.join(', ')}` : 'name';
        const placeholders = addFieldsKeys.length ? `${new Array(addFieldsKeys.length + 1).fill('?').join(', ')}` : `?`;
        const values = [value, ...addFieldsKeys.map(k => additionalFields[k])];

        // Insert new record
        const [result] = await connection.query(
            `INSERT INTO ${table} (${columns}) VALUES (${placeholders})`, values
        );

        cache[value] = result.insertId;
        return result.insertId;
    } catch (error) {
        console.error(`Error in getOrInsert for table ${table}, value ${value}:`, error.message);
        throw error;
    }
}

// Get or Insert for STO table which has composite unique key (name + witel_id)
async function getOrInsertSto(connection, stoName, witelId, cache) {
    if (!stoName) return null;
    const key = `${stoName}-${witelId}`;
    if (cache[key]) return cache[key];

    try {
        // Check if exists
        const [existing] = await connection.query(
            `SELECT id FROM sto1 WHERE name = ? AND witel_id = ?`, [stoName, witelId]
        );
        if (existing.length > 0) {
            cache[key] = existing[0].id;
            return existing[0].id;
        }

        // Get max id for witel_id
        const [maxResult] = await connection.query(
            `SELECT MAX(id) AS maxId FROM sto1 WHERE witel_id = ?`, [witelId]
        );
        const newId = (maxResult[0].maxId || 0) + 1;

        // Insert new sto record
        await connection.query(
            `INSERT INTO sto1 (id, name, witel_id) VALUES (?, ?, ?)`, [newId, stoName, witelId]
        );

        cache[key] = newId;
        return newId;
    } catch (error) {
        console.error(`Error in getOrInsertSto for stoName ${stoName} witelId ${witelId}:`, error.message);
        throw error;
    }
}

// Compute status based on dates and is_drop flag
function computeStatus(planSurvey, survey, planDelivery, delivery, planInstalasi, instalasi, planIntegrasi, integrasi, isDrop) {
    if (isDrop) return 'Drop';
    if (integrasi) return 'Realisasi Integrasi';
    if (instalasi) return 'Realisasi Instalasi';
    if (delivery) return 'Realisasi Delivery';
    if (survey) return 'Realisasi Survey';
    return 'Plan Survey';
}

// Main route handler for excel upload with authorization
router.post('/excel-upload', authorizeAdmin, fileUpload(), async (req, res) => {
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        if (!req.files || !req.files.excelFile) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const file = req.files.excelFile;
        const workbook = new exceljs.Workbook();
        await workbook.xlsx.load(file.data);

        // Use sheet named "Data" or first sheet fallback
        const worksheet = workbook.getWorksheet('Data') || workbook.worksheets[0];
        if (!worksheet) {
            return res.status(400).json({ error: 'Worksheet not found' });
        }

        // Clear clusters1 table before new inserts
        await connection.query('DELETE FROM clusters1');

        // Prepare caches for performance
        const regionalCache = {};
        const witelCache = {};
        const stoCache = {};

        // Process rows starting from row 3 (skip header rows 1 and 2)
        const rows = [];
        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber >= 3) rows.push(row);
        });

        for (const row of rows) {
            // Extract data from columns (adjusted to your Excel columns)
            const regionalName = (row.getCell('A').value || '').toString().trim();
            const witelName = (row.getCell('B').value || '').toString().trim();
            const stoName = (row.getCell('C').value || '').toString().trim();
            const name = (row.getCell('D').value || '').toString().trim();
            const typeOlt = (row.getCell('E').value || '').toString().trim();
            const merkOtn = (row.getCell('F').value || '').toString().trim();
            const mitra = (row.getCell('G').value || '').toString().trim();
            const prioritas = (row.getCell('H').value || '').toString().trim();
            const planSurvey = normalizeDate(row.getCell('J').value);
            const survey = normalizeDate(row.getCell('K').value);
            const planDelivery = normalizeDate(row.getCell('L').value);
            const delivery = normalizeDate(row.getCell('M').value);
            const planInstalasi = normalizeDate(row.getCell('N').value);
            const instalasi = normalizeDate(row.getCell('O').value);
            const planIntegrasi = normalizeDate(row.getCell('P').value);
            const integrasi = normalizeDate(row.getCell('Q').value);
            const isDropRaw = row.getCell('R').value;
            const isDrop = Boolean(isDropRaw);

            // Insert or get regional id
            const regionalId = await getOrInsert(connection, 'regional1', regionalName, regionalCache);
            if (!regionalId) {
                throw new Error(`Failed to get or insert regional: ${regionalName}`);
            }

            // Insert or get witel id with foreign key regional_id
            const witelId = await getOrInsert(connection, 'witel1', witelName, witelCache, { regional_id: regionalId });
            if (!witelId) {
                throw new Error(`Failed to get or insert witel: ${witelName}`);
            }

            // Insert or get sto id with foreign key witel_id
            const stoId = await getOrInsertSto(connection, stoName, witelId, stoCache);
            if (!stoId) {
                throw new Error(`Failed to get or insert sto: ${stoName}`);
            }

            // Compute status
            const status = computeStatus(planSurvey, survey, planDelivery, delivery, planInstalasi, instalasi, planIntegrasi, integrasi, isDrop);

            // Insert record into clusters1 table with all fields
            await connection.query(
                `INSERT INTO clusters1 
                (name, sto_id, witel_id, status, mitra, plan_survey, survey, plan_delivery, delivery, plan_instalasi, instalasi, plan_integrasi, integrasi, is_drop, type_olt, merk_otn, prioritas)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    name, stoId, witelId, status, mitra,
                    formatTime(planSurvey),
                    formatTime(survey), formatTime(planDelivery), formatTime(delivery), formatTime(planInstalasi),
                    formatTime(instalasi), formatTime(planIntegrasi), formatTime(integrasi),
                    isDrop, typeOlt, merkOtn, prioritas
                ]
            );
        }

        // Commit transaction
        await connection.commit();

        res.json({ message: 'Excel data uploaded successfully' });

    } catch (err) {
        await connection.rollback();
        console.error('Error processing Excel upload:', err);
        res.status(500).json({ error: err.message });
    } finally {
        connection.release();
    }
});

module.exports = router;
