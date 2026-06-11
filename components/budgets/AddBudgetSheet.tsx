import { forwardRef, useCallback, useImperativeHandle, useRef, useState } from 'react';
import { View, Text, Switch, ActivityIndicator, TouchableOpacity } from 'react-native';
import BottomSheet, { BottomSheetScrollView, BottomSheetTextInput, BottomSheetBackdrop, type BottomSheetBackdropProps } from '@gorhom/bottom-sheet';
import * as Haptics from 'expo-haptics';
import Toast from 'react-native-toast-message';
import { CategoryPicker } from '@/components/transactions/CategoryPicker';
import { useBudgets } from '@/lib/hooks/useBudgets';
import { t } from '@/i18n';
import { fonts, radius } from '@/constants/theme';
import { useColors } from '@/lib/theme/useColors';

const SNAP_POINTS = ['60%', '85%'];

interface AddBudgetSheetProps {
  month:    number;
  year:     number;
  onSaved?: () => void;
}

export interface AddBudgetSheetHandle {
  present: () => void;
}

export const AddBudgetSheet = forwardRef<AddBudgetSheetHandle, AddBudgetSheetProps>(
  ({ month, year, onSaved }, ref) => {
    const innerRef = useRef<BottomSheet>(null);
    const { add }  = useBudgets(month, year);
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

    const [categoryId, setCategoryId] = useState('');
    const [amount,     setAmount]     = useState('');
    const [rollover,   setRollover]   = useState(false);
    const [saving,     setSaving]     = useState(false);

    useImperativeHandle(ref, () => ({
      present() {
        setCategoryId('');
        setAmount('');
        setRollover(false);
        innerRef.current?.snapToIndex(1);
      },
    }), []);

    const save = useCallback(async () => {
      const parsed = parseFloat(amount.replace(',', '.'));
      if (!categoryId) {
        Toast.show({ type: 'error', text1: 'Select a category' });
        return;
      }
      if (!parsed || parsed <= 0) {
        Toast.show({ type: 'error', text1: 'Enter a valid amount' });
        return;
      }
      setSaving(true);
      try {
        await add({ categoryId, amount: parsed, currency: 'TND', month, year, rollover });
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        innerRef.current?.close();
        onSaved?.();
      } catch (err) {
        console.error(err);
        Toast.show({ type: 'error', text1: t('common.error') });
      } finally {
        setSaving(false);
      }
    }, [categoryId, amount, rollover, month, year, add, onSaved]);

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
          <Text style={{ fontFamily: fonts.display, fontSize: 20, color: c.text }}>
            {t('budgets.add')}
          </Text>

          {/* Category */}
          <View style={{ gap: 10 }}>
            <Text style={{ fontFamily: fonts.bodyMd, fontSize: 13, color: c.textMuted }}>
              {t('transactions.category')}
            </Text>
            <CategoryPicker
              type="EXPENSE"
              selected={categoryId}
              onSelect={setCategoryId}
            />
          </View>

          {/* Amount */}
          <View style={{ gap: 8 }}>
            <Text style={{ fontFamily: fonts.bodyMd, fontSize: 13, color: c.textMuted }}>
              {t('budgets.monthlyLimit')} (TND)
            </Text>
            <BottomSheetTextInput
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              placeholder="0.000"
              placeholderTextColor={c.textMuted}
              style={{
                backgroundColor:   c.surface2,
                borderRadius:      radius.md,
                paddingHorizontal: 16,
                paddingVertical:   12,
                fontFamily:        fonts.mono,
                fontSize:          24,
                color:             c.text,
                borderWidth:       1,
                borderColor:       c.border,
              }}
            />
          </View>

          {/* Rollover */}
          <View style={{
            flexDirection:   'row',
            alignItems:      'center',
            justifyContent:  'space-between',
            backgroundColor: c.surface2,
            borderRadius:    radius.md,
            padding:         16,
            borderWidth:     1,
            borderColor:     c.border,
          }}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text style={{ fontFamily: fonts.bodyMd, fontSize: 14, color: c.text }}>
                {t('budgets.rollover')}
              </Text>
            </View>
            <Switch
              value={rollover}
              onValueChange={setRollover}
              trackColor={{ false: c.border, true: c.accent }}
              thumbColor={rollover ? c.accentFg : c.textMuted}
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
                  {t('common.save')}
                </Text>
            }
          </TouchableOpacity>
        </BottomSheetScrollView>
      </BottomSheet>
    );
  }
);

AddBudgetSheet.displayName = 'AddBudgetSheet';
