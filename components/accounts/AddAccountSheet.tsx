import { forwardRef, useCallback, useImperativeHandle, useRef, useState } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import BottomSheet, { BottomSheetScrollView, BottomSheetTextInput, BottomSheetBackdrop, type BottomSheetBackdropProps } from '@gorhom/bottom-sheet';
import * as Haptics from 'expo-haptics';
import Toast from 'react-native-toast-message';
import { createId } from '@paralleldrive/cuid2';
import { db } from '@/lib/db/client';
import { accounts, syncQueue } from '@/drizzle/schema';
import { useAccountsStore } from '@/store/accounts';
import { useAuthStore } from '@/store/auth';
import { t } from '@/i18n';
import { fonts, radius } from '@/constants/theme';
import { useColors } from '@/lib/theme/useColors';
import { Wallet, Building2, Smartphone } from 'lucide-react-native';

const SNAP_POINTS = ['60%', '85%'];

type AccountType = 'CASH' | 'BANK' | 'MOBILE_WALLET';

const ACCOUNT_TYPES = [
  { key: 'CASH' as const,          label: 'Cash',          icon: Wallet },
  { key: 'BANK' as const,          label: 'Bank',          icon: Building2 },
  { key: 'MOBILE_WALLET' as const, label: 'Mobile Wallet', icon: Smartphone },
];

const COLORS = ['#C8F135', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#10B981'];

export interface AddAccountSheetHandle {
  present: () => void;
}

export const AddAccountSheet = forwardRef<AddAccountSheetHandle, { onSaved?: () => void }>(
  ({ onSaved }, ref) => {
    const innerRef = useRef<BottomSheet>(null);
    const userId   = useAuthStore((s) => s.user?.id);
    const { addAccount } = useAccountsStore();
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

    const [name,    setName]    = useState('');
    const [type,    setType]    = useState<AccountType>('CASH');
    const [balance, setBalance] = useState('');
    const [color,   setColor]   = useState(COLORS[0]);
    const [saving,  setSaving]  = useState(false);

    useImperativeHandle(ref, () => ({
      present() {
        setName('');
        setType('CASH');
        setBalance('');
        setColor(COLORS[0]);
        innerRef.current?.snapToIndex(1);
      },
    }), []);

    const save = useCallback(async () => {
      if (!name.trim()) {
        Toast.show({ type: 'error', text1: 'Enter an account name' });
        return;
      }
      if (!userId) return;

      setSaving(true);
      try {
        const now     = new Date().toISOString();
        const opening = parseFloat(balance.replace(',', '.')) || 0;
        const account = {
          id:         createId(),
          userId,
          name:       name.trim(),
          type,
          balance:    opening,
          currency:   'TND' as const,
          color,
          icon:       'wallet',
          isArchived: false,
          synced:     false,
          updatedAt:  now,
          createdAt:  now,
        };

        await db.insert(accounts).values(account);
        await db.insert(syncQueue).values({
          table:     'accounts',
          operation: 'INSERT',
          payload:   JSON.stringify(account),
          retries:   0,
          synced:    false,
          error:     false,
          createdAt: now,
        });

        addAccount(account);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        innerRef.current?.close();
        onSaved?.();
      } catch (err) {
        console.error(err);
        Toast.show({ type: 'error', text1: t('common.error') });
      } finally {
        setSaving(false);
      }
    }, [name, type, balance, color, userId, addAccount, onSaved]);

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
            New Account
          </Text>

          {/* Name */}
          <View style={{ gap: 8 }}>
            <Text style={{ fontFamily: fonts.bodyMd, fontSize: 13, color: c.textMuted }}>Name</Text>
            <BottomSheetTextInput
              value={name}
              onChangeText={setName}
              placeholder="e.g. Wallet, BNA..."
              placeholderTextColor={c.textMuted}
              style={{
                backgroundColor:   c.surface2,
                borderRadius:      radius.md,
                paddingHorizontal: 16,
                paddingVertical:   12,
                fontFamily:        fonts.body,
                fontSize:          15,
                color:             c.text,
                borderWidth:       1,
                borderColor:       c.border,
              }}
            />
          </View>

          {/* Type */}
          <View style={{ gap: 8 }}>
            <Text style={{ fontFamily: fonts.bodyMd, fontSize: 13, color: c.textMuted }}>Type</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {ACCOUNT_TYPES.map((at) => {
                const active = at.key === type;
                const IconComponent = at.icon;
                return (
                  <TouchableOpacity
                    key={at.key}
                    onPress={() => setType(at.key)}
                    style={{
                      flex:            1,
                      height:          80,
                      justifyContent:  'center',
                      alignItems:      'center',
                      borderRadius:    radius.md,
                      backgroundColor: active ? c.accent + '22' : c.surface2,
                      borderWidth:     1,
                      borderColor:     active ? c.accent : c.border,
                      gap:             6,
                      paddingHorizontal: 4,
                    }}
                  >
                    <IconComponent size={22} color={active ? c.accent : c.textMuted} strokeWidth={1.5} />
                    <Text
                      style={{
                        fontFamily: fonts.body,
                        fontSize:   11,
                        color:      active ? c.accent : c.textMuted,
                        textAlign:  'center',
                      }}
                      numberOfLines={2}
                    >
                      {at.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Opening balance */}
          <View style={{ gap: 8 }}>
            <Text style={{ fontFamily: fonts.bodyMd, fontSize: 13, color: c.textMuted }}>Opening Balance (TND)</Text>
            <BottomSheetTextInput
              value={balance}
              onChangeText={setBalance}
              keyboardType="decimal-pad"
              placeholder="0.000"
              placeholderTextColor={c.textMuted}
              style={{
                backgroundColor:   c.surface2,
                borderRadius:      radius.md,
                paddingHorizontal: 16,
                paddingVertical:   12,
                fontFamily:        fonts.mono,
                fontSize:          18,
                color:             c.text,
                borderWidth:       1,
                borderColor:       c.border,
              }}
            />
          </View>

          {/* Color */}
          <View style={{ gap: 8 }}>
            <Text style={{ fontFamily: fonts.bodyMd, fontSize: 13, color: c.textMuted }}>Color</Text>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              {COLORS.map((col) => (
                <TouchableOpacity
                  key={col}
                  onPress={() => setColor(col)}
                  style={{
                    width:       36,
                    height:      36,
                    borderRadius: 18,
                    backgroundColor: col,
                    borderWidth:  3,
                    borderColor:  color === col ? c.text : 'transparent',
                  }}
                />
              ))}
            </View>
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

AddAccountSheet.displayName = 'AddAccountSheet';
