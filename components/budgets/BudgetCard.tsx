import { useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { fonts, radius } from '@/constants/theme';
import { useColors } from '@/lib/theme/useColors';
import { formatCurrency } from '@/lib/currency/format';
import { DEFAULT_CATEGORIES } from '@/constants/categories';
import { t } from '@/i18n';
import { Trash2, RotateCw } from 'lucide-react-native';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import type { Budget } from '@/drizzle/schema';

interface BudgetCardProps {
  budget:   Budget;
  spent:    number;
  onDelete: (id: string) => void;
}

export function BudgetCard({ budget, spent, onDelete }: BudgetCardProps) {
  const c = useColors();

  function progressColor(pct: number): string {
    if (pct >= 0.9) return c.danger;
    if (pct >= 0.7) return '#F59E0B';
    return c.accent;
  }

  const pct      = budget.amount > 0 ? Math.min(spent / budget.amount, 1) : 0;
  const pctLabel = Math.round(pct * 100);
  const barColor = progressColor(pct);
  const category = DEFAULT_CATEGORIES.find((cat) => cat.id === budget.categoryId);
  const remaining = Math.max(budget.amount - spent, 0);

  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withSpring(pct, { damping: 20, stiffness: 90 });
  }, [pct]);

  const barStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%` as `${number}%`,
  }));

  return (
    <View
      style={{
        backgroundColor: c.surface,
        borderRadius:    radius.xl,
        borderWidth:     1,
        borderColor:     c.border,
        padding:         20,
        marginBottom:    12,
      }}
    >
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
        <View
          style={{
            width:           40,
            height:          40,
            borderRadius:    20,
            backgroundColor: (category?.color ?? '#6B7280') + '22',
            justifyContent:  'center',
            alignItems:      'center',
            marginRight:     12,
          }}
        >
          <CategoryIcon name={category?.icon ?? 'LayoutGrid'} color={category?.color ?? c.textMuted} size={22} />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: fonts.bodyMd, fontSize: 15, color: c.text }}>
            {category?.name ?? 'Budget'}
          </Text>
          <Text style={{ fontFamily: fonts.body, fontSize: 12, color: c.textMuted, marginTop: 2 }}>
            {pctLabel}% {t('budgets.spent').toLowerCase()}
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => onDelete(budget.id)}
          hitSlop={{ top: 12, right: 12, bottom: 12, left: 12 }}
        >
          <Trash2 size={16} color={c.textMuted} strokeWidth={1.5} />
        </TouchableOpacity>
      </View>

      {/* Progress bar */}
      <View
        style={{
          height:          8,
          backgroundColor: c.surface2,
          borderRadius:    4,
          overflow:        'hidden',
          marginBottom:    12,
        }}
      >
        <Animated.View
          style={[
            { height: 8, borderRadius: 4, backgroundColor: barColor },
            barStyle,
          ]}
        />
      </View>

      {/* Amounts */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <View>
          <Text style={{ fontFamily: fonts.body, fontSize: 11, color: c.textMuted }}>
            {t('budgets.spent')}
          </Text>
          <Text style={{ fontFamily: fonts.mono, fontSize: 14, color: barColor }}>
            {formatCurrency(spent, budget.currency)}
          </Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={{ fontFamily: fonts.body, fontSize: 11, color: c.textMuted }}>
            {t('budgets.remaining')}
          </Text>
          <Text style={{ fontFamily: fonts.mono, fontSize: 14, color: c.text }}>
            {formatCurrency(remaining, budget.currency)}
          </Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={{ fontFamily: fonts.body, fontSize: 11, color: c.textMuted }}>Limit</Text>
          <Text style={{ fontFamily: fonts.mono, fontSize: 14, color: c.textMuted }}>
            {formatCurrency(budget.amount, budget.currency)}
          </Text>
        </View>
      </View>

      {budget.rollover && (
        <View style={{ marginTop: 10, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <RotateCw size={12} color={c.textMuted} strokeWidth={1.5} />
          <Text style={{ fontFamily: fonts.body, fontSize: 11, color: c.textMuted }}>
            {t('budgets.rollover')}
          </Text>
        </View>
      )}
    </View>
  );
}
