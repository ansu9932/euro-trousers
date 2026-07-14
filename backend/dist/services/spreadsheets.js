import ExcelJS from 'exceljs';
export async function exportWorkbook(sheetName, columns, rows) { const workbook = new ExcelJS.Workbook(), sheet = workbook.addWorksheet(sheetName); sheet.columns = columns; sheet.addRows(rows); sheet.getRow(1).font = { bold: true }; sheet.autoFilter = { from: 'A1', to: `${String.fromCharCode(64 + Math.min(columns.length, 26))}1` }; return Buffer.from(await workbook.xlsx.writeBuffer()); }
export async function parseWorkbook(buffer, required) { const workbook = new ExcelJS.Workbook(); await workbook.xlsx.load(buffer); const sheet = workbook.worksheets[0]; if (!sheet)
    throw new Error('WORKBOOK_EMPTY'); const headers = sheet.getRow(1).values.slice(1).map(String), missing = required.filter(x => !headers.includes(x)); if (missing.length)
    throw new Error(`MISSING_COLUMNS:${missing.join(',')}`); const rows = []; sheet.eachRow((row, index) => { if (index === 1)
    return; const result = {}; headers.forEach((header, i) => result[header] = row.getCell(i + 1).value); rows.push(result); }); return rows; }
