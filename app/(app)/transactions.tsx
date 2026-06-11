import { useMemo, useRef, useCallback, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import * as Haptics from 'expo-haptics';
import Toast from 'react-native-toast-message';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { FilterBar, type FilterState } from '@/components/transactions/FilterBar';
import { TransactionCard } from '@/components/transactions/TransactionCard';
import { AddTransactionSheet, type AddTransactionSheetHandle } from '@/components/transactions/AddTransactionSheet';
import { EmptyState } from '@/components/ui/EmptyState';
import { useTransactions } from '@/lib/hooks/useTransactions';
import { useAccounts } from '@/lib/hooks/useAccounts';
import { exportTransactionsCSV } from '@/lib/export/exportCSV';
import { t } from '@/i18n';
import { fonts } from '@/constants/theme';
import { useColors } from '@/lib/theme/useColors';
import type { Transaction } from '@/drizzle/schema';
import { Plus, Download } from 'lucide-react-native';

export default function TransactionsScreen() {
  const sheetRef                  = useRef<AddTransactionSheetHandle>(null);
  useAccounts(); // ensure accounts are in store for the sheet
  const { transactions, isLoading, remove } = useTransactions();
  const [exporting, setExporting] = useState(false);
  const [filters, setFilters]     = useState<FilterState>(() => {
    const now   = new Date();
    const mm    = String(now.getMonth() + 1).padStart(2, '0');
    return {
      dateFrom: `${now.getFullYear()}-${mm}-01`,
      dateTo:   now.toISOString().split('T')[0],
    };
  });
  const c = useColors();

  const filtered = useMemo(() => {
    let result = transactions;
    if (filters.dateFrom) result = result.filter((tx) => tx.date >= filters.dateFrom!);
    if (filters.dateTo)   result = result.filter((tx) => tx.date <= filters.dateTo!);
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter((tx) => (tx.note ?? '').toLowerCase().includes(q));
    }
    return result;
  }, [transactions, filters]);

  async function handleExport() {
    if (filtered.length === 0) {
      Toast.show({ type: 'error', text1: 'No transactions to export' });
      return;
    }
    setExporting(true);
    try {
      await exportTransactionsCSV(filtered);
    } catch (err) {
      console.error(err);
      Toast.show({ type: 'error', text1: t('common.error') });
    } finally {
      setExporting(false);
    }
  }

  function openNew() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    sheetRef.current?.present();
  }

  function openEdit(tx: Transaction) {
    sheetRef.current?.present(tx);
  }

  const handleDelete = useCallback(async (id: string) => {
    try {
      await remove(id);
    } catch (err) {
      console.error(err);
    }
  }, [remove]);

  return (
    <ScreenWrapper>
      {/* Header */}
      <View style={{
        flexDirection:     'row',
        alignItems:        'center',
        paddingHorizontal: 20,
        paddingTop:        16,
        paddingBottom:     4,
      }}>
        <Text style={{ fontFamily: fonts.display, fontSize: 24, color: c.text, flex: 1 }}>
          {t('transactions.title')}
        </Text>
        <TouchableOpacity
          onPress={() => void handleExport()}
          disabled={exporting}
          hitSlop={8}
          style={{ padding: 4 }}
        >
          <Download size={20} color={c.text} strokeWidth={1.5} style={{ opacity: exporting ? 0.4 : 1 }} />
        </TouchableOpacity>
      </View>

      <FilterBar onChange={setFilters} />

      {/* List */}
      {isLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontFamily: fonts.body, color: c.textMuted }}>{t('common.loading')}</Text>
        </View>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="ArrowLeftRight"
          title={t('transactions.noTransactions')}
          subtitle={t('transactions.noTransactionsSubtitle')}
        />
      ) : (
        <FlashList
          data={filtered}
          keyExtractor={(tx) => tx.id}
          renderItem={({ item }) => (
            <TransactionCard
              transaction={item}
              onEdit={openEdit}
              onDelete={handleDelete}
            />
          )}
          contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          onRefresh={() => { /* transactions auto-load from store */ }}
          refreshing={isLoading}
        />
      )}

      {/* FAB */}
      <TouchableOpacity
        onPress={openNew}
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
    </ScreenWrapper>
  );
}
