import { useRef } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { fonts, radius } from '@/constants/theme';
import { useColors } from '@/lib/theme/useColors';
import { formatCurrency } from '@/lib/currency/format';
import { DEFAULT_CATEGORIES } from '@/constants/categories';
import { t } from '@/i18n';
import { Pencil, Trash2 } from 'lucide-react-native';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import type { Transaction } from '@/drizzle/schema';

interface TransactionCardProps {
  transaction: Transaction;
  onEdit:      (tx: Transaction) => void;
  onDelete:    (id: string) => void;
}

function formatDate(dateStr: string): string {
  const today     = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  if (dateStr === today)     return t('common.today');
  if (dateStr === yesterday) return t('common.yesterday');
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('fr-TN', {
    day: 'numeric', month: 'short',
  });
}

export function TransactionCard({ transaction, onEdit, onDelete }: TransactionCardProps) {
  const swipeRef = useRef<Swipeable>(null);
  const c = useColors();
  const category = DEFAULT_CATEGORIES.find((cat) => cat.id === transaction.categoryId);
  const isIncome = transaction.type === 'INCOME';

  function handleEdit() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    swipeRef.current?.close();
    onEdit(transaction);
  }

  function handleDelete() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    swipeRef.current?.close();
    onDelete(transaction.id);
  }

  const renderLeftActions = () => (
    <TouchableOpacity
      onPress={handleEdit}
      style={{
        backgroundColor: c.surface2,
        justifyContent:  'center',
        alignItems:      'center',
        width:           72,
        marginBottom:    8,
        borderRadius:    radius.md,
        borderWidth:     1,
        borderColor:     c.border,
        gap:             4,
      }}
    >
      <Pencil size={20} color={c.textMuted} strokeWidth={1.5} />
      <Text style={{ fontFamily: fonts.body, fontSize: 11, color: c.textMuted }}>
        {t('common.edit')}
      </Text>
    </TouchableOpacity>
  );

  const renderRightActions = () => (
    <TouchableOpacity
      onPress={handleDelete}
      style={{
        backgroundColor: c.danger,
        justifyContent:  'center',
        alignItems:      'center',
        width:           72,
        marginBottom:    8,
        borderRadius:    radius.md,
        gap:             4,
      }}
    >
      <Trash2 size={20} color={c.dangerFg} strokeWidth={1.5} />
      <Text style={{ fontFamily: fonts.body, fontSize: 11, color: c.dangerFg }}>
        {t('common.delete')}
      </Text>
    </TouchableOpacity>
  );

  return (
    <Swipeable
      ref={swipeRef}
      renderLeftActions={renderLeftActions}
      renderRightActions={renderRightActions}
      overshootLeft={false}
      overshootRight={false}
      friction={2}
    >
      <View
        style={{
          flexDirection:   'row',
          alignItems:      'center',
          backgroundColor: c.surface,
          borderRadius:    radius.md,
          padding:         14,
          marginBottom:    8,
          gap:             12,
          borderWidth:     1,
          borderColor:     c.border,
        }}
      >
        <View
          style={{
            width:           44,
            height:          44,
            borderRadius:    22,
            backgroundColor: (category?.color ?? '#6B7280') + '22',
            justifyContent:  'center',
            alignItems:      'center',
          }}
        >
          {category ? (
            <CategoryIcon name={category.icon} color={category.color} size={22} />
          ) : (
            <CategoryIcon name={isIncome ? 'TrendingUp' : 'TrendingDown'} color={isIncome ? c.success : c.danger} size={22} />
          )}
        </View>

        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: fonts.bodyMd, fontSize: 14, color: c.text }} numberOfLines={1}>
            {category?.name ?? transaction.type}
          </Text>
          {transaction.note ? (
            <Text style={{ fontFamily: fonts.body, fontSize: 12, color: c.textMuted, marginTop: 2 }} numberOfLines={1}>
              {transaction.note}
            </Text>
          ) : null}
          <Text style={{ fontFamily: fonts.body, fontSize: 11, color: c.textMuted, marginTop: 2 }}>
            {formatDate(transaction.date)}
          </Text>
        </View>

        <Text style={{
          fontFamily: fonts.mono,
          fontSize:   15,
          color:      isIncome ? c.success : c.danger,
        }}>
          {isIncome ? '+' : '-'}{formatCurrency(transaction.amount, transaction.currency)}
        </Text>
      </View>
    </Swipeable>
  );
}
