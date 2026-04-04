import { Transaction } from '@/types';

export function exportToCSV(data: Transaction[], filename: string): void {
  const headers = ['Date', 'Description', 'Amount', 'Category', 'Type'];
  const rows = data.map(t => [t.date, t.description, t.amount.toString(), t.category, t.type]);
  const csv = [headers, ...rows].map(r => r.map(cell => `"${cell}"`).join(',')).join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function parseCSV(csvText: string): Omit<Transaction, 'id'>[] {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) throw new Error('CSV must have headers and at least one row');

  const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim().toLowerCase());
  const requiredHeaders = ['date', 'description', 'amount', 'category', 'type'];

  for (const required of requiredHeaders) {
    if (!headers.includes(required)) {
      throw new Error(`Missing required column: ${required}`);
    }
  }

  return lines.slice(1).filter(l => l.trim()).map((line, i) => {
    const values = line.split(',').map(v => v.replace(/"/g, '').trim());
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => { row[h] = values[idx] || ''; });

    if (!row.date || !row.description || !row.amount) {
      throw new Error(`Row ${i + 2}: Missing required fields`);
    }

    const amount = parseFloat(row.amount);
    if (isNaN(amount)) throw new Error(`Row ${i + 2}: Invalid amount "${row.amount}"`);

    return {
      date: row.date,
      description: row.description,
      amount,
      category: (row.category as Transaction['category']) || 'other_expense',
      type: (row.type === 'income' ? 'income' : 'expense') as 'income' | 'expense',
    };
  });
}
