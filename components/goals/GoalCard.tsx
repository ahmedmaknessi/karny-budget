import { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import Animated, { useSharedValue, withSpring, useAnimatedStyle } from 'react-native-reanimated';
import { fonts, radius } from '@/constants/theme';
import { useColors } from '@/lib/theme/useColors';
import { t } from '@/i18n';
import * as icons from 'lucide-react-native';
import { Trash2 } from 'lucide-react-native';
import type { Goal } from '@/drizzle/schema';

interface GoalCardProps {
  goal:         Goal;
  onAddSavings: (id: string, amount: number) => Promise<void>;
  onDelete:     (id: string) => void;
}

const EMOJI_TO_LUCIDE: Record<string, string> = {
  '🏠': 'Home',
  '🚗': 'Car',
  '✈️': 'Plane',
  '💍': 'Heart',
  '🎓': 'GraduationCap',
  '💻': 'Laptop',
  '📱': 'Smartphone',
  '🎸': 'Music',
  '🏖️': 'Sun',
  '🏋️': 'Dumbbell',
  '🐕': 'Activity',
  '👶': 'Baby',
  '🌱': 'Sprout',
  '🎯': 'Target',
  '💰': 'Coins',
  '🛍️': 'ShoppingBag',
  '🎨': 'Palette',
  '📚': 'BookOpen',
  '🍕': 'Pizza',
  '⚽': 'Trophy',
  '🎮': 'Gamepad2',
  '🚀': 'Rocket',
  '💎': 'Gem',
  '🌍': 'Globe',
};

function daysLeft(deadline: string | null): number | null {
  if (!deadline) return null;
  const diff = new Date(deadline).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function GoalCard({ goal, onAddSavings, onDelete }: GoalCardProps) {
  const c = useColors();

  function deadlineColor(days: number | null, reached: boolean): string {
    if (reached) return c.success;
    if (days === null) return c.textMuted;
    if (days < 0) return c.danger;
    if (days <= 7) return '#F59E0B';
    return c.textMuted;
  }

  function deadlineLabel(days: number | null, reached: boolean): string {
    if (reached) return t('goals.reached');
    if (days === null) return '';
    if (days < 0) return t('goals.overdue');
    return t('goals.daysLeft').replace('{{count}}', String(days));
  }

  const pct      = goal.targetAmount > 0 ? Math.min(goal.savedAmount / goal.targetAmount, 1) : 0;
  const reached  = pct >= 1;
  const days     = daysLeft(goal.deadline);
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withSpring(pct, { damping: 20, stiffness: 90 });
  }, [pct]);

  const barStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%` as `${number}%`,
  }));

  const barColor = reached ? c.success : pct >= 0.7 ? '#F59E0B' : c.accent;

  const [inputVal, setInputVal] = useState('');
  const [saving,   setSaving]   = useState(false);
  const inputRef = useRef<TextInput>(null);

  async function handleSave() {
    const amount = parseFloat(inputVal.replace(',', '.'));
    if (!amount || amount <= 0) return;
    setSaving(true);
    try {
      await onAddSavings(goal.id, amount);
      setInputVal('');
    } catch {
      // no-op
    } finally {
      setSaving(false);
    }
  }

  const mappedIconName = EMOJI_TO_LUCIDE[goal.emoji] ?? goal.emoji;
  const GoalIcon = (icons[mappedIconName as keyof typeof icons] ?? icons.Target) as any;

  return (
    <View style={{
      backgroundColor: c.surface,
      borderRadius:    radius.lg,
      padding:         16,
      marginBottom:    12,
      borderWidth:     1,
      borderColor:     c.border,
    }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
        <View style={{ marginRight: 10 }}>
          <GoalIcon size={24} color={reached ? c.success : c.accent} strokeWidth={1.5} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: fonts.bodyMd, fontSize: 16, color: c.text }} numberOfLines={1}>
            {goal.name}
          </Text>
          {goal.deadline ? (
            <Text style={{ fontFamily: fonts.body, fontSize: 12, color: deadlineColor(days, reached) }}>
              {deadlineLabel(days, reached)}
            </Text>
          ) : null}
        </View>
        <TouchableOpacity onPress={() => onDelete(goal.id)} hitSlop={8}>
          <Trash2 size={18} color={c.textMuted} strokeWidth={1.5} />
        </TouchableOpacity>
      </View>

      {/* Amounts */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
        <View>
          <Text style={{ fontFamily: fonts.body, fontSize: 11, color: c.textMuted }}>{t('goals.saved')}</Text>
          <Text style={{ fontFamily: fonts.mono, fontSize: 15, color: reached ? c.success : c.accent }}>
            {goal.savedAmount.toFixed(3)} TND
          </Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={{ fontFamily: fonts.body, fontSize: 11, color: c.textMuted }}>{t('goals.target')}</Text>
          <Text style={{ fontFamily: fonts.mono, fontSize: 15, color: c.text }}>
            {goal.targetAmount.toFixed(3)} TND
          </Text>
        </View>
      </View>

      {/* Progress bar */}
      <View style={{
        height:          8,
        backgroundColor: c.surface2,
        borderRadius:    radius.full,
        overflow:        'hidden',
        marginBottom:    14,
      }}>
        <Animated.View style={[{ height: '100%', borderRadius: radius.full, backgroundColor: barColor }, barStyle]} />
      </View>

      {/* Quick-add savings */}
      {!reached && (
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TextInput
            ref={inputRef}
            value={inputVal}
            onChangeText={setInputVal}
            keyboardType="decimal-pad"
            placeholder="0.000"
            placeholderTextColor={c.textMuted}
            style={{
              flex:              1,
              backgroundColor:   c.surface2,
              borderRadius:      radius.md,
              paddingHorizontal: 12,
              paddingVertical:   8,
              fontFamily:        fonts.mono,
              fontSize:          14,
              color:             c.text,
              borderWidth:       1,
              borderColor:       c.border,
            }}
          />
          <TouchableOpacity
            onPress={handleSave}
            disabled={saving}
            style={{
              backgroundColor: c.accent,
              borderRadius:    radius.md,
              paddingHorizontal: 16,
              justifyContent:  'center',
            }}
          >
            <Text style={{ fontFamily: fonts.bodyMd, fontSize: 13, color: c.accentFg }}>
              {t('goals.quickAdd')}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
