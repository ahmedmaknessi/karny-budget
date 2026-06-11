import { useRef, useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import * as Haptics from 'expo-haptics';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { Header } from '@/components/layout/Header';
import { AccountPill } from '@/components/accounts/AccountPill';
import { SpendingDonut } from '@/components/charts/SpendingDonut';
import { CategoryBar, type CategoryBarItem } from '@/components/charts/CategoryBar';
import { SkeletonCard, SkeletonRow } from '@/components/ui/SkeletonCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { AddTransactionSheet, type AddTransactionSheetHandle } from '@/components/transactions/AddTransactionSheet';
import { AddAccountSheet, type AddAccountSheetHandle } from '@/components/accounts/AddAccountSheet';
import { useAccounts } from '@/lib/hooks/useAccounts';
import { useBudgets } from '@/lib/hooks/useBudgets';
import { useTransactionsStore } from '@/store/transactions';
import { useAuthStore } from '@/store/auth';
import { useSettingsStore } from '@/store/settings';
import { DEFAULT_CATEGORIES } from '@/constants/categories';
import { triggerSync } from '@/lib/sync/engine';
import { useUiStore } from '@/store/ui';
import { formatCurrency } from '@/lib/currency/format';
import { t } from '@/i18n';
import { fonts, radius } from '@/constants/theme';
import { useColors } from '@/lib/theme/useColors';
import { Plus, TrendingUp, TrendingDown, ArrowLeftRight } from 'lucide-react-native';

function useCountUp(target: number, duration = 900): number {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (target === 0) { setValue(0); return; }
    const start = Date.now();
    let raf: ReturnType<typeof requestAnimationFrame>;

    const tick = () => {
      const elapsed  = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased    = 1 - Math.pow(1 - progress, 3);
      setValue(target * eased);
      if (progress < 1) raf = requestAnimationFrame(tick);
      else setValue(target);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);

  return value;
}

export default function DashboardScreen() {
  const sheetRef        = useRef<AddTransactionSheetHandle>(null);
  const accountSheetRef = useRef<AddAccountSheetHandle>(null);
  const user         = useAuthStore((s) => s.user);
  const baseCurrency = useSettingsStore((s) => s.baseCurrency);
  const c = useColors();

  const { accounts, isLoading: accountsLoading }                             = useAccounts();
  const { isLoading: budgetsLoading, monthSpent, monthBudget, spendByCategory } = useBudgets();
  const { transactions }                                                     = useTransactionsStore();
  const syncStatus                                                           = useUiStore((s) => s.syncStatus);

  const totalBalance    = accounts.reduce((sum, a) => sum + a.balance, 0);
  const animatedBalance = useCountUp(totalBalance);

  // Monthly income / expense from the full transaction list
  const now        = new Date();
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
  const monthIncome = transactions
    .filter((tx) => tx.date >= monthStart && tx.type === 'INCOME')
    .reduce((s, tx) => s + tx.amount, 0);
  const monthExpense = transactions
    .filter((tx) => tx.date >= monthStart && tx.type === 'EXPENSE')
    .reduce((s, tx) => s + tx.amount, 0);

  // Top-5 category bars derived from budget spend data
  const categoryBars: CategoryBarItem[] = (() => {
    const entries = Object.entries(spendByCategory)
      .map(([id, amount]) => {
        const cat = DEFAULT_CATEGORIES.find((c) => c.id === id);
        return { id, icon: cat?.icon ?? 'LayoutGrid', name: cat?.name ?? id, amount, color: cat?.color ?? c.accent };
      })
      .filter((e) => e.amount > 0)
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
    const max = entries[0]?.amount ?? 1;
    return entries.map((e) => ({ ...e, pct: e.amount / max }));
  })();

  const recentTransactions = transactions.slice(0, 5);
  const isLoading          = accountsLoading || budgetsLoading;

  const onRefresh = useCallback(() => {
    void triggerSync();
  }, []);

  function openSheet() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    sheetRef.current?.present();
  }

  if (isLoading) {
    return (
      <ScreenWrapper>
        <Header />
        <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
          <SkeletonCard />
          <SkeletonCard />
          {[0, 1, 2].map((i) => <SkeletonRow key={i} />)}
        </ScrollView>
      </ScreenWrapper>
    );
  }

  if (accounts.length === 0) {
    return (
      <ScreenWrapper>
        <Header />
        <EmptyState
          icon="Building2"
          title={t('dashboard.noAccounts')}
          subtitle={t('dashboard.noAccountsSubtitle')}
        />
        <TouchableOpacity
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); accountSheetRef.current?.present(); }}
          style={{
            marginHorizontal: 40,
            marginBottom:     40,
            backgroundColor:  c.accent,
            borderRadius:     radius.md,
            paddingVertical:  16,
            alignItems:       'center',
          }}
        >
          <Text style={{ fontFamily: fonts.bodyMd, fontSize: 16, color: c.accentFg }}>Add Account</Text>
        </TouchableOpacity>
        <AddAccountSheet ref={accountSheetRef} />
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <Header />

      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={syncStatus === 'pending'}
            onRefresh={onRefresh}
            tintColor={c.accent}
          />
        }
      >
        {/* ── Total Balance Card ── */}
        <View
          style={{
            marginHorizontal: 20,
            backgroundColor:  c.surface,
            borderRadius:     radius.xl,
            borderWidth:      1,
            borderColor:      c.border,
            padding:          24,
            marginBottom:     20,
          }}
        >
          <Text style={{ fontFamily: fonts.body, fontSize: 13, color: c.textMuted, marginBottom: 6 }}>
            {t('dashboard.totalBalance')}
          </Text>
          <Text style={{ fontFamily: fonts.mono, fontSize: 36, color: c.text, letterSpacing: -1 }}>
            {formatCurrency(animatedBalance, baseCurrency)}
          </Text>
          <Text style={{ fontFamily: fonts.body, fontSize: 12, color: c.textMuted, marginTop: 6 }}>
            {accounts.length} {accounts.length === 1 ? 'account' : 'accounts'}
          </Text>
        </View>

        {/* ── Account Pills ── */}
        <FlashList
          data={[...accounts, { id: '__add__' } as (typeof accounts[0] & { id: '__add__' })]}
          keyExtractor={(a) => a.id}
          renderItem={({ item }) =>
            item.id === '__add__' ? (
              <TouchableOpacity
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); accountSheetRef.current?.present(); }}
                style={{
                  backgroundColor: c.surface2,
                  borderRadius:    radius.lg,
                  borderWidth:     1,
                  borderColor:     c.border,
                  borderStyle:     'dashed',
                  padding:         16,
                  marginRight:     12,
                  minWidth:        100,
                  justifyContent:  'center',
                  alignItems:      'center',
                  gap:             6,
                }}
              >
                <Plus size={20} color={c.textMuted} strokeWidth={1.5} />
                <Text style={{ fontFamily: fonts.body, fontSize: 12, color: c.textMuted }}>Add</Text>
              </TouchableOpacity>
            ) : (
              <AccountPill account={item as typeof accounts[0]} />
            )
          }
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
        />

        {/* ── Monthly Summary ── */}
        {(monthIncome > 0 || monthExpense > 0) && (
          <View style={{
            flexDirection:    'row',
            marginHorizontal: 20,
            marginBottom:     20,
            gap:              12,
          }}>
            <View style={{
              flex:            1,
              backgroundColor: c.surface,
              borderRadius:    radius.lg,
              borderWidth:     1,
              borderColor:     c.border,
              padding:         16,
            }}>
              <Text style={{ fontFamily: fonts.body, fontSize: 11, color: c.textMuted, marginBottom: 4 }}>
                Income
              </Text>
              <Text style={{ fontFamily: fonts.mono, fontSize: 15, color: c.success }}>
                +{formatCurrency(monthIncome, baseCurrency)}
              </Text>
            </View>
            <View style={{
              flex:            1,
              backgroundColor: c.surface,
              borderRadius:    radius.lg,
              borderWidth:     1,
              borderColor:     c.border,
              padding:         16,
            }}>
              <Text style={{ fontFamily: fonts.body, fontSize: 11, color: c.textMuted, marginBottom: 4 }}>
                Expenses
              </Text>
              <Text style={{ fontFamily: fonts.mono, fontSize: 15, color: c.danger }}>
                -{formatCurrency(monthExpense, baseCurrency)}
              </Text>
            </View>
          </View>
        )}

        {/* ── Budget Ring ── */}
        {monthBudget > 0 && (
          <View
            style={{
              marginHorizontal: 20,
              backgroundColor:  c.surface,
              borderRadius:     radius.xl,
              borderWidth:      1,
              borderColor:      c.border,
              padding:          24,
              alignItems:       'center',
              marginBottom:     20,
            }}
          >
            <Text style={{ fontFamily: fonts.bodyMd, fontSize: 15, color: c.text, marginBottom: 20 }}>
              {t('tabs.budgets')}
            </Text>
            <SpendingDonut
              spent={monthSpent}
              total={monthBudget}
              currency={baseCurrency}
            />
          </View>
        )}

        {/* ── Top Categories ── */}
        {categoryBars.length > 0 && (
          <View style={{
            marginHorizontal: 20,
            marginBottom:     20,
            backgroundColor:  c.surface,
            borderRadius:     radius.xl,
            borderWidth:      1,
            borderColor:      c.border,
            padding:          20,
          }}>
            <Text style={{ fontFamily: fonts.bodyMd, fontSize: 15, color: c.text, marginBottom: 16 }}>
              Top Spending
            </Text>
            <CategoryBar data={categoryBars} currency={baseCurrency} />
          </View>
        )}

        {/* ── Recent Transactions ── */}
        <View style={{ marginHorizontal: 20 }}>
          <Text style={{ fontFamily: fonts.bodyMd, fontSize: 15, color: c.text, marginBottom: 12 }}>
            {t('dashboard.recentTransactions')}
          </Text>

          {recentTransactions.length === 0 ? (
            <View style={{ paddingVertical: 24, alignItems: 'center' }}>
              <Text style={{ fontFamily: fonts.body, fontSize: 14, color: c.textMuted }}>
                {t('transactions.noTransactions')}
              </Text>
            </View>
          ) : (
            recentTransactions.map((tx) => (
              <View
                key={tx.id}
                style={{
                  flexDirection:  'row',
                  alignItems:     'center',
                  paddingVertical: 12,
                  borderBottomWidth: 1,
                  borderBottomColor: c.border,
                  gap: 12,
                }}
              >
                <View
                  style={{
                    width:           40,
                    height:          40,
                    borderRadius:    20,
                    backgroundColor: c.surface2,
                    justifyContent:  'center',
                    alignItems:      'center',
                  }}
                >
                  {tx.type === 'INCOME' ? (
                    <TrendingUp size={20} color={c.success} strokeWidth={1.5} />
                  ) : tx.type === 'TRANSFER' ? (
                    <ArrowLeftRight size={20} color={c.textMuted} strokeWidth={1.5} />
                  ) : (
                    <TrendingDown size={20} color={c.danger} strokeWidth={1.5} />
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: fonts.bodyMd, fontSize: 14, color: c.text }}>
                    {tx.note ?? tx.type}
                  </Text>
                  <Text style={{ fontFamily: fonts.body, fontSize: 12, color: c.textMuted }}>
                    {tx.date}
                  </Text>
                </View>
                <Text
                  style={{
                    fontFamily: fonts.mono,
                    fontSize:   15,
                    color:      tx.type === 'INCOME' ? c.success : c.danger,
                  }}
                >
                  {tx.type === 'INCOME' ? '+' : '-'}{formatCurrency(tx.amount, tx.currency)}
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* ── FAB ── */}
      <TouchableOpacity
        onPress={openSheet}
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

      <AddTransactionSheet ref={sheetRef} />
      <AddAccountSheet ref={accountSheetRef} />
    </ScreenWrapper>
  );
}
