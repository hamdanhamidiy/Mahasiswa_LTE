const xlsx = require('xlsx');

try {
  const workbook = xlsx.readFile('./data/DATABASE SISWA LTE TAHUN 2020-2026.xlsx');
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

  console.log("Sheet Name:", sheetName);
  console.log("Total Rows:", data.length);
  console.log("Headers:", data[0]);
  console.log("First Data Row:", data[1]);
} catch (e) {
  console.error("Error reading excel:", e.message);
}
