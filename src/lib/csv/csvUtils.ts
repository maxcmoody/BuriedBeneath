import { CONTENT_SCHEMAS, type ContentGroup, type CsvRow } from '../../data/schemas/contentSchemas';

const escapeCell = (value: string) => {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
};

export const rowsToCsv = (group: ContentGroup, rows: CsvRow<string>[]) => {
  const columns = CONTENT_SCHEMAS[group].columns;
  const header = columns.join(',');
  const body = rows.map((row) => columns.map((column) => escapeCell(String(row[column] ?? ''))).join(',')).join('\n');
  return `${header}\n${body}`;
};

export const parseCsv = (text: string): string[][] => {
  const rows: string[][] = [];
  let current = '';
  let row: string[] = [];
  let inQuotes = false;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    const next = text[i + 1];
    if (ch === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      row.push(current);
      current = '';
    } else if ((ch === '\n' || ch === '\r') && !inQuotes) {
      if (ch === '\r' && next === '\n') i += 1;
      row.push(current);
      if (row.some((cell) => cell.length > 0)) rows.push(row);
      row = [];
      current = '';
    } else {
      current += ch;
    }
  }
  if (current.length > 0 || row.length > 0) {
    row.push(current);
    rows.push(row);
  }
  return rows;
};

export const csvToRows = (group: ContentGroup, text: string): CsvRow<string>[] => {
  const parsed = parseCsv(text);
  if (!parsed.length) return [];
  const headers = parsed[0];
  const expected = CONTENT_SCHEMAS[group].columns;
  if (headers.join('|') !== expected.join('|')) {
    throw new Error(`Header mismatch for ${group}. Expected: ${expected.join(', ')}`);
  }
  return parsed.slice(1).map((line) => Object.fromEntries(expected.map((column, idx) => [column, line[idx] ?? ''])));
};

export const downloadFile = (filename: string, content: string, type = 'text/csv;charset=utf-8') => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};
