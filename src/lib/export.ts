/**
 * Utility functions for exporting data to CSV files.
 * Supports UTF-8 BOM for proper Excel compatibility with Indonesian characters.
 */

interface CSVColumn<T> {
  header: string;
  accessor: (row: T) => string | number | boolean | null | undefined;
}

/**
 * Export an array of data to a CSV file and trigger download.
 * @param data - Array of data objects
 * @param columns - Column definitions with header and accessor
 * @param filename - Name of the downloaded file (without extension)
 */
export function exportToCSV<T>(
  data: T[],
  columns: CSVColumn<T>[],
  filename: string
): void {
  // Build CSV content with BOM for Excel UTF-8 support
  const BOM = '\uFEFF';
  const header = columns.map(c => escapeCSV(c.header)).join(',');
  const rows = data.map(row =>
    columns.map(c => escapeCSV(String(c.accessor(row) ?? ''))).join(',')
  );
  const csv = BOM + [header, ...rows].join('\r\n');

  // Create blob and trigger download
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export data as a JSON file and trigger download.
 * @param data - Any serializable data
 * @param filename - Name of the downloaded file (without extension)
 */
export function exportToJSON(data: unknown, filename: string): void {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/** Escape a value for CSV (wrap in quotes if it contains comma, newline, or quote) */
function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('\n') || value.includes('"')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
