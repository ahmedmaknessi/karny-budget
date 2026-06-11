import { forwardRef, useCallback, useImperativeHandle, useRef, useState } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import BottomSheet, { BottomSheetScrollView, BottomSheetTextInput, BottomSheetBackdrop, type BottomSheetBackdropProps } from '@gorhom/bottom-sheet';
import * as Haptics from 'expo-haptics';
import Toast from 'react-native-toast-message';
import { useGoals } from '@/lib/hooks/useGoals';
import { t } from '@/i18n';
import { fonts, radius } from '@/constants/theme';
import { useColors } from '@/lib/theme/useColors';

import * as icons from 'lucide-react-native';

const SNAP_POINTS = ['70%', '90%'];

const GOAL_ICONS = [
  'Home', 'Car', 'Plane', 'Heart', 'GraduationCap', 'Laptop', 'Smartphone', 'Music',
  'Sun', 'Dumbbell', 'Activity', 'Baby', 'Sprout', 'Target', 'Coins', 'ShoppingBag',
  'Palette', 'BookOpen', 'Pizza', 'Trophy', 'Gamepad2', 'Rocket', 'Gem', 'Globe'
];

export interface AddGoalSheetHandle {
  present: () => void;
}

interface AddGoalSheetProps {
  onSaved?: () => void;
}

export const AddGoalSheet = forwardRef<AddGoalSheetHandle, AddGoalSheetProps>(
  ({ onSaved }, ref) => {
    const innerRef = useRef<BottomSheet>(null);
    const { add }  = useGoals();
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

    const [emoji,    setEmoji]    = useState('Target');
    const [name,     setName]     = useState('');
    const [amount,   setAmount]   = useState('');
    const [deadline, setDeadline] = useState('');
    const [saving,   setSaving]   = useState(false);

    useImperativeHandle(ref, () => ({
      present() {
        setEmoji('Target');
        setName('');
        setAmount('');
        setDeadline('');
        innerRef.current?.snapToIndex(0);
      },
    }), []);

    const save = useCallback(async () => {
      const parsed = parseFloat(amount.replace(',', '.'));
      if (!name.trim()) {
        Toast.show({ type: 'error', text1: 'Enter a goal name' });
        return;
      }
      if (!parsed || parsed <= 0) {
        Toast.show({ type: 'error', text1: 'Enter a valid target amount' });
        return;
      }
      setSaving(true);
      try {
        await add({
          name:         name.trim(),
          emoji,
          targetAmount: parsed,
          currency:     'TND',
          deadline:     deadline.trim() || null,
        });
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        innerRef.current?.close();
        onSaved?.();
      } catch (err) {
        console.error(err);
        Toast.show({ type: 'error', text1: t('common.error') });
      } finally {
        setSaving(false);
      }
    }, [emoji, name, amount, deadline, add, onSaved]);

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
            {t('goals.add')}
          </Text>

          {/* Emoji picker */}
          <View style={{ gap: 10 }}>
            <Text style={{ fontFamily: fonts.bodyMd, fontSize: 13, color: c.textMuted }}>
              Icon
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {GOAL_ICONS.map((iconName) => {
                const IconComponent = (icons[iconName as keyof typeof icons] || icons.Target) as any;
                const active = emoji === iconName;
                return (
                  <TouchableOpacity
                    key={iconName}
                    onPress={() => setEmoji(iconName)}
                    style={{
                      width:           44,
                      height:          44,
                      borderRadius:    radius.md,
                      backgroundColor: active ? c.accent + '33' : c.surface2,
                      borderWidth:     1,
                      borderColor:     active ? c.accent : c.border,
                      justifyContent:  'center',
                      alignItems:      'center',
                    }}
                  >
                    <IconComponent size={22} color={active ? c.accent : c.textMuted} strokeWidth={1.5} />
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Name */}
          <View style={{ gap: 8 }}>
            <Text style={{ fontFamily: fonts.bodyMd, fontSize: 13, color: c.textMuted }}>
              Goal name
            </Text>
            <BottomSheetTextInput
              value={name}
              onChangeText={setName}
              placeholder="e.g. New laptop, Vacation..."
              placeholderTextColor={c.textMuted}
              style={{
                backgroundColor:   c.surface2,
                borderRadius:      radius.md,
                paddingHorizontal: 16,
                paddingVertical:   12,
                fontFamily:        fonts.bodyMd,
                fontSize:          16,
                color:             c.text,
                borderWidth:       1,
                borderColor:       c.border,
              }}
            />
          </View>

          {/* Target amount */}
          <View style={{ gap: 8 }}>
            <Text style={{ fontFamily: fonts.bodyMd, fontSize: 13, color: c.textMuted }}>
              {t('goals.target')} (TND)
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

          {/* Deadline */}
          <View style={{ gap: 8 }}>
            <Text style={{ fontFamily: fonts.bodyMd, fontSize: 13, color: c.textMuted }}>
              {t('goals.deadline')}
            </Text>
            <BottomSheetTextInput
              value={deadline}
              onChangeText={setDeadline}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={c.textMuted}
              style={{
                backgroundColor:   c.surface2,
                borderRadius:      radius.md,
                paddingHorizontal: 16,
                paddingVertical:   12,
                fontFamily:        fonts.mono,
                fontSize:          16,
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
                  {t('common.save')}
                </Text>
            }
          </TouchableOpacity>
        </BottomSheetScrollView>
      </BottomSheet>
    );
  }
);

AddGoalSheet.displayName = 'AddGoalSheet';
