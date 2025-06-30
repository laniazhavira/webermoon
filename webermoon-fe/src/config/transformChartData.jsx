const monthMap = {
    Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
    Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11
};

const parseMonthYear = (monthYear) => {
    const [month, year] = monthYear.split(" ");
    return new Date(year, monthMap[month]);
};

const transformChartData = (data, planKey, realizationKey) => {
    const months = new Map();

    // Ensure plan and realisasi exist
    const planValues = data[planKey]?.values || [];
    const realisasiValues = data[realizationKey]?.values || [];

    // Process Plan values
    for (const item of planValues) {
        const key = item.month_year;
        if (!months.has(key)) {
            months.set(key, { name: key, plan: 0, realisasi: 0 });
        }
        months.get(key).plan += item.count; // Use += to accumulate counts
    }

    // Process Realisasi values
    for (const item of realisasiValues) {
        const key = item.month_year;
        if (!months.has(key)) {
            months.set(key, { name: key, plan: 0, realisasi: 0 });
        }
        months.get(key).realisasi += item.count; // Use += to accumulate counts
    }

    // Ensure at least 3 months of placeholder data
    const requiredMonths = ["Dec 2024", "Jan 2025", "Feb 2025"];
    for (const month of requiredMonths) {
        if (!months.has(month)) {
            months.set(month, { name: month, plan: 0, realisasi: 0 });
        }
    }

    // Convert Map to sorted array (sorted by month-year)
    const sortedData = Array.from(months.values()).sort((a, b) => parseMonthYear(a.name) - parseMonthYear(b.name));

    // Ensure missing months take the previous month's values
    let lastPlan = 0;
    let lastRealisasi = 0;

    for (const item of sortedData) {
        if (item.plan === 0 && lastPlan !== 0) {
            item.plan = lastPlan; // Carry over previous plan value
        } else {
            lastPlan = item.plan; // Update lastPlan when new value appears
        }

        if (item.realisasi === 0 && lastRealisasi !== 0) {
            item.realisasi = lastRealisasi; // Carry over previous realisasi value
        } else {
            lastRealisasi = item.realisasi; // Update lastRealisasi when new value appears
        }
    }

    return sortedData;
};

export default transformChartData;
