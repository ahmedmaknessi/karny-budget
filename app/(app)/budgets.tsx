import { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { MonthSelector } from '@/components/budgets/MonthSelector';
import { BudgetCard } from '@/components/budgets/BudgetCard';
import { AddBudgetSheet, type AddBudgetSheetHandle } from '@/components/budgets/AddBudgetSheet';
import { EmptyState } from '@/components/ui/EmptyState';
import { useBudgets } from '@/lib/hooks/useBudgets';
import { t } from '@/i18n';
import { fonts } from '@/constants/theme';
import { useColors } from '@/lib/theme/useColors';
import { Plus } from 'lucide-react-native';

export default function BudgetsScreen() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year,  setYear]  = useState(now.getFullYear());

  const sheetRef = useRef<AddBudgetSheetHandle>(null);
  const { budgets, isLoading, spendByCategory, monthSpent, monthBudget, remove, load } = useBudgets(month, year);
  const c = useColors();

  function openAdd() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    sheetRef.current?.present();
  }

  async function handleDelete(id: string) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try { await remove(id); } catch (err) { console.error(err); }
  }

  return (
    <ScreenWrapper>
      {/* Header */}
      <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 4 }}>
        <Text style={{ fontFamily: fonts.display, fontSize: 24, color: c.text }}>
          {t('budgets.title')}
        </Text>
      </View>

      <MonthSelector month={month} year={year} onChange={(m, y) => { setMonth(m); setYear(y); }} />

      {/* Summary bar */}
      {budgets.length > 0 && (
        <View style={{
          flexDirection:    'row',
          justifyContent:   'space-between',
          marginHorizontal: 20,
          marginBottom:     16,
          padding:          16,
          backgroundColor:  c.surface,
          borderRadius:     12,
          borderWidth:      1,
          borderColor:      c.border,
        }}>
          <View>
            <Text style={{ fontFamily: fonts.body, fontSize: 11, color: c.textMuted }}>Total Spent</Text>
            <Text style={{ fontFamily: fonts.mono, fontSize: 16, color: c.danger }}>
              {monthSpent.toFixed(3)} TND
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ fontFamily: fonts.body, fontSize: 11, color: c.textMuted }}>Total Budget</Text>
            <Text style={{ fontFamily: fonts.mono, fontSize: 16, color: c.text }}>
              {monthBudget.toFixed(3)} TND
            </Text>
          </View>
        </View>
      )}

      {isLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontFamily: fonts.body, color: c.textMuted }}>{t('common.loading')}</Text>
        </View>
      ) : budgets.length === 0 ? (
        <EmptyState
          icon="Target"
          title={t('budgets.noBudgets')}
          subtitle={t('budgets.noBudgetsSubtitle')}
        />
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={load}
              tintColor={c.accent}
            />
          }
        >
          {budgets.map((b) => (
            <BudgetCard
              key={b.id}
              budget={b}
              spent={spendByCategory[b.categoryId] ?? 0}
              onDelete={handleDelete}
            />
          ))}
        </ScrollView>
      )}

      {/* FAB */}
      <TouchableOpacity
        onPress={openAdd}
        style={{
          position:        'absolute',
          bottom:          32,
          right:           24,
          width:           56,
          height:          56,
          borderRadius:    28,
          backgroundColor: c.accent,
          justifyContent:  'center',
          alignItems:      'center',
          shadowColor:     c.accent,
          shadowOpacity:   0.4,
          shadowRadius:    12,
          shadowOffset:    { width: 0, height: 4 },
          elevation:       8,
        }}
      >
        <Plus size={28} color={c.accentFg} strokeWidth={1.5} />
      </TouchableOpacity>

      <AddBudgetSheet ref={sheetRef} month={month} year={year} />
    </ScreenWrapper>
  );
}
