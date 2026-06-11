import { View, Text } from 'react-native';
import { PolarChart, Pie } from 'victory-native';
import { fonts } from '@/constants/theme';
import { useColors } from '@/lib/theme/useColors';
import { formatCurrency } from '@/lib/currency/format';

interface Props {
  spent:    number;
  total:    number;
  currency: string;
  size?:    number;
}

export function SpendingDonut({ spent, total, currency, size = 180 }: Props) {
  const c = useColors();
  const remaining = Math.max(0, total - spent);
  const hasData   = total > 0;

  const chartData = hasData
    ? [
        { label: 'Spent',     value: Math.min(spent, total), color: c.accent   },
        { label: 'Remaining', value: remaining,               color: c.surface2 },
      ]
    : [
        { label: 'Empty', value: 1, color: c.surface2 },
      ];

  const pct = hasData ? Math.min(100, Math.round((spent / total) * 100)) : 0;

  return (
    <View style={{ alignItems: 'center', gap: 8 }}>
      <View style={{ width: size, height: size }}>
        <PolarChart
          data={chartData}
          labelKey="label"
          valueKey="value"
          colorKey="color"
        >
          <Pie.Chart innerRadius="65%" />
        </PolarChart>

        {/* Centre label */}
        <View
          style={{
            position:       'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            justifyContent: 'center',
            alignItems:     'center',
          }}
        >
          <Text style={{ fontFamily: fonts.mono, fontSize: 22, color: c.text }}>
            {pct}%
          </Text>
          <Text style={{ fontFamily: fonts.body, fontSize: 11, color: c.textMuted }}>
            spent
          </Text>
        </View>
      </View>

      {/* Legend */}
      <View style={{ flexDirection: 'row', gap: 20 }}>
        <View style={{ alignItems: 'center', gap: 2 }}>
          <Text style={{ fontFamily: fonts.mono, fontSize: 14, color: c.accent }}>
            {formatCurrency(spent, currency)}
          </Text>
          <Text style={{ fontFamily: fonts.body, fontSize: 11, color: c.textMuted }}>spent</Text>
        </View>
        <View style={{ width: 1, backgroundColor: c.border }} />
        <View style={{ alignItems: 'center', gap: 2 }}>
          <Text style={{ fontFamily: fonts.mono, fontSize: 14, color: c.text }}>
            {formatCurrency(total, currency)}
          </Text>
          <Text style={{ fontFamily: fonts.body, fontSize: 11, color: c.textMuted }}>budget</Text>
        </View>
      </View>
    </View>
  );
}
