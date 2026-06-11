import { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { t } from '@/i18n';
import { fonts, radius } from '@/constants/theme';
import { useColors } from '@/lib/theme/useColors';

type DateRange = 'all' | 'week' | 'month' | '3months';

export interface FilterState {
  dateFrom?:   string;
  dateTo?:     string;
  search?:     string;
}

interface FilterBarProps {
  onChange: (filters: FilterState) => void;
}

function getRangeDates(range: DateRange): Pick<FilterState, 'dateFrom' | 'dateTo'> {
  const now   = new Date();
  const today = now.toISOString().split('T')[0];
  if (range === 'week') {
    const d = new Date(now);
    d.setDate(d.getDate() - 7);
    return { dateFrom: d.toISOString().split('T')[0], dateTo: today };
  }
  if (range === 'month') {
    const d = new Date(now.getFullYear(), now.getMonth(), 1);
    return { dateFrom: d.toISOString().split('T')[0], dateTo: today };
  }
  if (range === '3months') {
    const d = new Date(now);
    d.setMonth(d.getMonth() - 3);
    return { dateFrom: d.toISOString().split('T')[0], dateTo: today };
  }
  return {};
}

const RANGES: { key: DateRange; label: string }[] = [
  { key: 'all',     label: 'All' },
  { key: 'week',    label: 'This Week' },
  { key: 'month',   label: 'This Month' },
  { key: '3months', label: '3 Months' },
];

export function FilterBar({ onChange }: FilterBarProps) {
  const c = useColors();
  const [activeRange, setActiveRange] = useState<DateRange>('month');
  const [search,      setSearch]      = useState('');

  function selectRange(range: DateRange) {
    setActiveRange(range);
    onChange({ ...getRangeDates(range), search: search || undefined });
  }

  function onSearchChange(text: string) {
    setSearch(text);
    onChange({ ...getRangeDates(activeRange), search: text || undefined });
  }

  return (
    <View style={{ paddingHorizontal: 20, paddingTop: 16, gap: 12 }}>
      <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
        {RANGES.map((r) => {
          const active = activeRange === r.key;
          return (
            <TouchableOpacity
              key={r.key}
              onPress={() => selectRange(r.key)}
              style={{
                paddingHorizontal: 14,
                paddingVertical:   7,
                borderRadius:      radius.full,
                backgroundColor:   active ? c.accent : c.surface2,
                borderWidth:       1,
                borderColor:       active ? c.accent : c.border,
              }}
            >
              <Text style={{
                fontFamily: fonts.body,
                fontSize:   13,
                color:      active ? c.accentFg : c.textMuted,
              }}>
                {r.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <TextInput
        value={search}
        onChangeText={onSearchChange}
        placeholder={t('transactions.searchPlaceholder')}
        placeholderTextColor={c.textMuted}
        style={{
          backgroundColor:   c.surface2,
          borderRadius:      radius.md,
          paddingHorizontal: 16,
          paddingVertical:   10,
          fontFamily:        fonts.body,
          fontSize:          14,
          color:             c.text,
          borderWidth:       1,
          borderColor:       c.border,
        }}
      />
    </View>
  );
}
