import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, Platform } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useTheme } from '@/lib/theme/context';
import BottomSheet, { BottomSheetScrollView, BottomSheetTextInput, BottomSheetBackdrop, type BottomSheetBackdropProps } from '@gorhom/bottom-sheet';
import * as Haptics from 'expo-haptics';
import Toast from 'react-native-toast-message';
import { CategoryPicker } from '@/components/transactions/CategoryPicker';
import { useTransactions } from '@/lib/hooks/useTransactions';
import { useAccountsStore } from '@/store/accounts';
import { formatCurrency } from '@/lib/currency/format';
import { t } from '@/i18n';
import { fonts, radius } from '@/constants/theme';
import { useColors } from '@/lib/theme/useColors';
import type { Transaction } from '@/drizzle/schema';

const SNAP_POINTS = ['55%', '80%', '95%'];

type TxType = 'INCOME' | 'EXPENSE';

interface FormState {
  type:       TxType;
  amount:     string;
  categoryId: string;
  accountId:  string;
  date:       string;
  note:       string;
  editId:     string | null;
}

export interface AddTransactionSheetHandle {
  present: (editTx?: Transaction) => void;
}

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

function makeDefault(accountId: string): FormState {
  return { type: 'EXPENSE', amount: '', categoryId: '', accountId, date: todayStr(), note: '', editId: null };
}

function formatDateDisplay(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('fr-TN', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
  });
}

export const AddTransactionSheet = forwardRef<AddTransactionSheetHandle, { onSaved?: () => void }>(
  ({ onSaved }, ref) => {
    const innerRef   = useRef<BottomSheet>(null);
    const { accounts }     = useAccountsStore();
    const { add, update }  = useTransactions();
    const c = useColors();

    const renderBackdrop = useCallback(
      (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.4}
        />
      ),
      []
    );

    const [form,   setForm]   = useState<FormState>(() => makeDefault(accounts[0]?.id ?? ''));
    const [saving, setSaving] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const { resolvedTheme } = useTheme();

    const onDateChange = useCallback((event: DateTimePickerEvent, selectedDate?: Date) => {
      if (Platform.OS === 'android') {
        setShowDatePicker(false);
        if (event.type === 'set' && selectedDate) {
          setForm((f) => ({ ...f, date: selectedDate.toISOString().split('T')[0] }));
        }
      } else if (selectedDate) {
        setForm((f) => ({ ...f, date: selectedDate.toISOString().split('T')[0] }));
      }
    }, []);

    // Auto-select first account when accounts load (handles async store population)
    useEffect(() => {
      if (accounts.length > 0) {
        setForm((f) => f.accountId ? f : { ...f, accountId: accounts[0].id });
      }
    }, [accounts]);

    useImperativeHandle(ref, () => ({
      present(editTx?: Transaction) {
        // Read latest store state directly to avoid stale closure
        const latestAccounts = useAccountsStore.getState().accounts;
        if (editTx) {
          setForm({
            type:       editTx.type as TxType,
            amount:     String(editTx.amount),
            categoryId: editTx.categoryId,
            accountId:  editTx.accountId,
            date:       editTx.date,
            note:       editTx.note ?? '',
            editId:     editTx.id,
          });
        } else {
          setForm(makeDefault(latestAccounts[0]?.id ?? ''));
        }
        innerRef.current?.snapToIndex(1);
      },
    }), []);

    function adjustDate(days: number) {
      const d = new Date(form.date + 'T00:00:00');
      d.setDate(d.getDate() + days);
      setForm((f) => ({ ...f, date: d.toISOString().split('T')[0] }));
    }

    const save = useCallback(async () => {
      const amount = parseFloat(form.amount.replace(',', '.'));
      if (!amount || amount <= 0) {
        Toast.show({ type: 'error', text1: 'Enter a valid amount' });
        return;
      }
      if (!form.categoryId) {
        Toast.show({ type: 'error', text1: 'Select a category' });
        return;
      }
      if (!form.accountId) {
        Toast.show({ type: 'error', text1: 'Select an account' });
        return;
      }
      setSaving(true);
      try {
        const payload = {
          type:        form.type,
          amount,
          categoryId:  form.categoryId,
          accountId:   form.accountId,
          date:        form.date,
          note:        form.note || null,
          currency:    'TND' as const,
          isRecurring: false as boolean,
          receiptUri:  null,
        };
        if (form.editId) {
          await update(form.editId, payload);
        } else {
          await add(payload);
        }
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        innerRef.current?.close();
        setForm(makeDefault(accounts[0]?.id ?? ''));
        onSaved?.();
      } catch (err) {
        console.error(err);
        Toast.show({ type: 'error', text1: t('common.error') });
      } finally {
        setSaving(false);
      }
    }, [form, add, update, accounts, onSaved]);

    const isEdit = !!form.editId;

    return (
      <BottomSheet
        ref={innerRef}
        index={-1}
        snapPoints={SNAP_POINTS}
        enablePanDownToClose
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        backgroundStyle={{ backgroundColor: c.surface }}
        handleIndicatorStyle={{ backgroundColor: c.border }}
        backdropComponent={renderBackdrop}
      >
        <BottomSheetScrollView
          contentContainerStyle={{ padding: 24, gap: 20, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Title */}
          <Text style={{ fontFamily: fonts.display, fontSize: 20, color: c.text }}>
            {isEdit ? t('common.edit') : t('transactions.add')}
          </Text>

          {/* Type toggle */}
          <View style={{ flexDirection: 'row', backgroundColor: c.surface2, borderRadius: radius.md, padding: 4 }}>
            {(['EXPENSE', 'INCOME'] as TxType[]).map((tp) => (
              <View key={tp} style={{ flex: 1 }}>
                <TouchableOpacity
                  onPress={() => setForm((f) => ({ ...f, type: tp, categoryId: '' }))}
                  style={{
                    paddingVertical: 10,
                    borderRadius:    radius.sm,
                    alignItems:      'center',
                    backgroundColor: form.type === tp
                      ? (tp === 'EXPENSE' ? c.danger : c.success)
                      : 'transparent',
                  }}
                >
                  <Text style={{
                    fontFamily: fonts.bodyMd,
                    fontSize:   14,
                    color:      form.type === tp ? '#fff' : c.textMuted,
                  }}>
                    {tp === 'EXPENSE' ? t('transactions.expense') : t('transactions.income')}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>

          {/* Amount */}
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontFamily: fonts.body, fontSize: 12, color: c.textMuted, marginBottom: 8 }}>
              {t('common.amount')}
            </Text>
            <BottomSheetTextInput
              value={form.amount}
              onChangeText={(v) => setForm((f) => ({ ...f, amount: v }))}
              keyboardType="decimal-pad"
              placeholder="0.000"
              placeholderTextColor={c.textMuted}
              style={{
                fontFamily:   fonts.mono,
                fontSize:     40,
                color:        form.type === 'EXPENSE' ? c.danger : c.success,
                textAlign:    'center',
                minWidth:     120,
              }}
            />
            <Text style={{ fontFamily: fonts.mono, fontSize: 14, color: c.textMuted, marginTop: 4 }}>TND</Text>
          </View>

          {/* Category */}
          <View style={{ gap: 10 }}>
            <Text style={{ fontFamily: fonts.bodyMd, fontSize: 13, color: c.textMuted }}>
              {t('transactions.category')}
            </Text>
            <CategoryPicker
              type={form.type}
              selected={form.categoryId}
              onSelect={(id) => setForm((f) => ({ ...f, categoryId: id }))}
            />
          </View>

          {/* Account */}
          <View style={{ gap: 10 }}>
            <Text style={{ fontFamily: fonts.bodyMd, fontSize: 13, color: c.textMuted }}>
              {t('transactions.account')}
            </Text>
            <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
              {accounts.map((acc) => {
                const active = acc.id === form.accountId;
                return (
                  <TouchableOpacity
                    key={acc.id}
                    onPress={() => setForm((f) => ({ ...f, accountId: acc.id }))}
                    style={{
                      paddingHorizontal: 14,
                      paddingVertical:   8,
                      borderRadius:      radius.md,
                      backgroundColor:   active ? acc.color + '33' : c.surface2,
                      borderWidth:       1,
                      borderColor:       active ? acc.color : c.border,
                    }}
                  >
                    <Text style={{ fontFamily: fonts.bodyMd, fontSize: 13, color: active ? c.text : c.textMuted }}>
                      {acc.name}
                    </Text>
                    <Text style={{ fontFamily: fonts.mono, fontSize: 11, color: c.textMuted, marginTop: 2 }}>
                      {formatCurrency(acc.balance, acc.currency)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Date */}
          <View style={{ gap: 10 }}>
            <Text style={{ fontFamily: fonts.bodyMd, fontSize: 13, color: c.textMuted }}>
              {t('common.date')}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
              <TouchableOpacity
                onPress={() => adjustDate(-1)}
                style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: c.surface2, justifyContent: 'center', alignItems: 'center' }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={{ color: c.text, fontSize: 20 }}>‹</Text>
              </TouchableOpacity>
              
              {Platform.OS === 'ios' ? (
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                  <DateTimePicker
                    value={new Date(form.date + 'T00:00:00')}
                    mode="date"
                    display="default"
                    onChange={onDateChange}
                    themeVariant={resolvedTheme}
                  />
                </View>
              ) : (
                <TouchableOpacity
                  onPress={() => setShowDatePicker(true)}
                  style={{
                    flex: 1,
                    paddingVertical: 12,
                    backgroundColor: c.surface2,
                    borderRadius: radius.md,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: 1,
                    borderColor: c.border,
                  }}
                >
                  <Text style={{ fontFamily: fonts.body, fontSize: 14, color: c.text }}>
                    {formatDateDisplay(form.date)}
                  </Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                onPress={() => adjustDate(1)}
                style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: c.surface2, justifyContent: 'center', alignItems: 'center' }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={{ color: c.text, fontSize: 20 }}>›</Text>
              </TouchableOpacity>
            </View>

            {Platform.OS === 'android' && showDatePicker && (
              <DateTimePicker
                value={new Date(form.date + 'T00:00:00')}
                mode="date"
                display="default"
                onChange={onDateChange}
              />
            )}
          </View>

          {/* Note */}
          <View style={{ gap: 10 }}>
            <Text style={{ fontFamily: fonts.bodyMd, fontSize: 13, color: c.textMuted }}>
              {t('common.note')}
            </Text>
            <BottomSheetTextInput
              value={form.note}
              onChangeText={(v) => setForm((f) => ({ ...f, note: v }))}
              placeholder="Optional note..."
              placeholderTextColor={c.textMuted}
              style={{
                backgroundColor:   c.surface2,
                borderRadius:      radius.md,
                paddingHorizontal: 16,
                paddingVertical:   12,
                fontFamily:        fonts.body,
                fontSize:          14,
                color:             c.text,
                borderWidth:       1,
                borderColor:       c.border,
              }}
            />
          </View>

          {/* Save */}
          <TouchableOpacity
            onPress={save}
            disabled={saving}
            style={{
              backgroundColor: c.accent,
              borderRadius:    radius.md,
              paddingVertical: 16,
              alignItems:      'center',
            }}
          >
            {saving
              ? <ActivityIndicator color={c.accentFg} />
              : <Text style={{ fontFamily: fonts.bodyMd, fontSize: 16, color: c.accentFg }}>
                  {isEdit ? t('common.save') : t('transactions.add')}
                </Text>
            }
          </TouchableOpacity>
        </BottomSheetScrollView>
      </BottomSheet>
    );
  }
);

AddTransactionSheet.displayName = 'AddTransactionSheet';
