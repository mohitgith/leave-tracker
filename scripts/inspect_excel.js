const XLSX = require('xlsx');
const path = require('path');

try {
    const filePath = path.join(__dirname, '../Holiday-2026.xlsx');
    console.log(`Reading: ${filePath}`);
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    // Read first 10 rows as array of arrays
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    console.log('--- First 10 Rows ---');
    console.log(JSON.stringify(data.slice(0, 10), null, 2));
} catch (e) {
    console.error('Error reading excel:', e);
}
