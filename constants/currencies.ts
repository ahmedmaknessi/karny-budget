export interface Currency {
  code:   string;
  name:   string;
  symbol: string;
  flag:   string;
  decimals: number;
}

export const CURRENCIES: Currency[] = [
  { code: 'TND', name: 'Tunisian Dinar',      symbol: 'د.ت',  flag: '🇹🇳', decimals: 3 },
  { code: 'USD', name: 'US Dollar',            symbol: '$',    flag: '🇺🇸', decimals: 2 },
  { code: 'EUR', name: 'Euro',                 symbol: '€',    flag: '🇪🇺', decimals: 2 },
  { code: 'GBP', name: 'British Pound',        symbol: '£',    flag: '🇬🇧', decimals: 2 },
  { code: 'SAR', name: 'Saudi Riyal',          symbol: '﷼',    flag: '🇸🇦', decimals: 2 },
  { code: 'AED', name: 'UAE Dirham',           symbol: 'د.إ',  flag: '🇦🇪', decimals: 2 },
  { code: 'QAR', name: 'Qatari Riyal',         symbol: 'ر.ق',  flag: '🇶🇦', decimals: 2 },
  { code: 'KWD', name: 'Kuwaiti Dinar',        symbol: 'د.ك',  flag: '🇰🇼', decimals: 3 },
  { code: 'MAD', name: 'Moroccan Dirham',      symbol: 'د.م.', flag: '🇲🇦', decimals: 2 },
  { code: 'DZD', name: 'Algerian Dinar',       symbol: 'د.ج',  flag: '🇩🇿', decimals: 2 },
  { code: 'EGP', name: 'Egyptian Pound',       symbol: 'ج.م',  flag: '🇪🇬', decimals: 2 },
  { code: 'LYD', name: 'Libyan Dinar',         symbol: 'ل.د',  flag: '🇱🇾', decimals: 3 },
  { code: 'TRY', name: 'Turkish Lira',         symbol: '₺',    flag: '🇹🇷', decimals: 2 },
  { code: 'CHF', name: 'Swiss Franc',          symbol: 'Fr',   flag: '🇨🇭', decimals: 2 },
  { code: 'CAD', name: 'Canadian Dollar',      symbol: 'CA$',  flag: '🇨🇦', decimals: 2 },
  { code: 'JPY', name: 'Japanese Yen',         symbol: '¥',    flag: '🇯🇵', decimals: 0 },
];

export const DEFAULT_CURRENCY = 'TND';
