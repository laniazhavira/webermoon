
function parseCustomDate(dateString) {
    // Define month mappings
    if (!dateString) return null;
    const months = {
        JAN: 0, FEB: 1, MAR: 2, APR: 3, MAY: 4, JUN: 5,
        JUL: 6, AUG: 7, SEP: 8, OCT: 9, NOV: 10, DEC: 11
    };

    // Split the date string (e.g., "21-FEB-2025")
    const [day, monthAbbr, year] = dateString.split("-");

    // Convert to a Date object
    return new Date(year, months[monthAbbr.toUpperCase()], day);
}

function isValidDate(date) {
    let parsedDate = parseCustomDate(date);
    return parsedDate instanceof Date && !isNaN(parsedDate);
}

module.exports = { parseCustomDate, isValidDate };