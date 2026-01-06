const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

try {
    const filePath = path.join(__dirname, '../data/seeds/Holiday-2026.xlsx');
    const outPath = path.join(__dirname, '../backend/data/persistence/holidays.json');
    
    console.log(`Reading: ${filePath}`);
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Read raw data
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    // Headers: Date, Day, Holiday Name, Type, Status
    // Data starts at index 1
    
    const holidays = [];
    
    // Helper to format date
    const formatDate = (serial) => {
        if (!serial) return null;
        const dateObj = XLSX.SSF.parse_date_code(serial);
        // Pad month/day with 0
        const y = dateObj.y;
        const m = String(dateObj.m).padStart(2, '0');
        const d = String(dateObj.d).padStart(2, '0');
        return `${y}-${m}-${d}`;
    };

    // Helper to slugify
    const slugify = (text) => {
        return text.toString().toLowerCase()
            .replace(/\s+/g, '-')           // Replace spaces with -
            .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
            .replace(/\-\-+/g, '-')         // Replace multiple - with single -
            .replace(/^-+/, '')             // Trim - from start
            .replace(/-+$/, '');            // Trim - from end
    };
    
    // Process rows (skip header)
    for (let i = 1; i < data.length; i++) {
        const row = data[i];
        if (!row || row.length === 0) continue;
        
        const serial = row[0];
        const name = row[2];
        
        if (serial && name) {
            const dateStr = formatDate(serial);
            if (dateStr) {
                const year = dateStr.split('-')[0];
                const id = `${slugify(name)}-${year}`;
                
                holidays.push({
                    id: id,
                    name: name,
                    date: dateStr
                });
            }
        }
    }
    
    // Ensure dir exists
    const dir = path.dirname(outPath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(outPath, JSON.stringify(holidays, null, 2));
    console.log(`Successfully wrote ${holidays.length} holidays to ${outPath}`);
    
} catch (e) {
    console.error('Error importing holidays:', e);
    process.exit(1);
}
