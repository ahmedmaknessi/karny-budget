import { CURRENCIES } from '@/constants/currencies';

export function formatCurrency(
  amount: number,
  currencyCode: string = 'TND',
  locale: string = 'fr-TN',
): string {
  const currency = CURRENCIES.find((c) => c.code === currencyCode);
  const decimals = currency?.decimals ?? 2;

  try {
    return new Intl.NumberFormat(locale, {
      style:                 'currency',
      currency:              currencyCode,
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(amount);
  } catch {
    return `${amount.toFixed(decimals)} ${currencyCode}`;
  }
}

export function formatAmount(amount: number, currencyCode: string = 'TND'): string {
  const currency = CURRENCIES.find((c) => c.code === currencyCode);
  const decimals = currency?.decimals ?? 2;
  return amount.toFixed(decimals);
}
