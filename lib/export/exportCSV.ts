import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { DEFAULT_CATEGORIES } from '@/constants/categories';
import type { Transaction } from '@/drizzle/schema';

function cell(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return '';
  const s = String(value);
  return s.includes(',') || s.includes('"') || s.includes('\n')
    ? `"${s.replace(/"/g, '""')}"`
    : s;
}

function categoryName(id: string): string {
  return DEFAULT_CATEGORIES.find((c) => c.id === id)?.name ?? id;
}

export async function exportTransactionsCSV(txs: Transaction[]): Promise<void> {
  const headers = ['Date', 'Type', 'Amount', 'Currency', 'Category', 'Note'];

  const rows = txs.map((tx) =>
    [tx.date, tx.type, tx.amount, tx.currency, categoryName(tx.categoryId), tx.note ?? '']
      .map(cell)
      .join(','),
  );

  const csv = [headers.join(','), ...rows].join('\n');
  const uri = `${FileSystem.cacheDirectory}transactions_${Date.now()}.csv`;

  await FileSystem.writeAsStringAsync(uri, csv, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  const canShare = await Sharing.isAvailableAsync();
  if (!canShare) throw new Error('Sharing not available on this device');

  await Sharing.shareAsync(uri, {
    mimeType:    'text/csv',
    dialogTitle: 'Export Transactions',
    UTI:         'public.comma-separated-values-text',
  });
}
