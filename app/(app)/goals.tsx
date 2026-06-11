import { useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { GoalCard } from '@/components/goals/GoalCard';
import { AddGoalSheet, type AddGoalSheetHandle } from '@/components/goals/AddGoalSheet';
import { EmptyState } from '@/components/ui/EmptyState';
import { useGoals } from '@/lib/hooks/useGoals';
import { t } from '@/i18n';
import { fonts } from '@/constants/theme';
import { useColors } from '@/lib/theme/useColors';
import { Plus } from 'lucide-react-native';

export default function GoalsScreen() {
  const sheetRef = useRef<AddGoalSheetHandle>(null);
  const { goals, isLoading, addSavings, remove, reload } = useGoals();
  const c = useColors();

  function openAdd() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    sheetRef.current?.present();
  }

  async function handleDelete(id: string) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try { await remove(id); } catch (err) { console.error(err); }
  }

  const totalSaved  = goals.reduce((s, g) => s + g.savedAmount, 0);
  const totalTarget = goals.reduce((s, g) => s + g.targetAmount, 0);
  const reached     = goals.filter((g) => g.savedAmount >= g.targetAmount).length;

  return (
    <ScreenWrapper>
      {/* Header */}
      <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 4 }}>
        <Text style={{ fontFamily: fonts.display, fontSize: 24, color: c.text }}>
          {t('goals.title')}
        </Text>
      </View>

      {/* Summary bar */}
      {goals.length > 0 && (
        <View style={{
          flexDirection:    'row',
          justifyContent:   'space-between',
          marginHorizontal: 20,
          marginVertical:   12,
          padding:          16,
          backgroundColor:  c.surface,
          borderRadius:     12,
          borderWidth:      1,
          borderColor:      c.border,
        }}>
          <View>
            <Text style={{ fontFamily: fonts.body, fontSize: 11, color: c.textMuted }}>Total Saved</Text>
            <Text style={{ fontFamily: fonts.mono, fontSize: 16, color: c.accent }}>
              {totalSaved.toFixed(3)} TND
            </Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontFamily: fonts.body, fontSize: 11, color: c.textMuted }}>Reached</Text>
            <Text style={{ fontFamily: fonts.mono, fontSize: 16, color: c.success }}>
              {reached}/{goals.length}
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ fontFamily: fonts.body, fontSize: 11, color: c.textMuted }}>Total Target</Text>
            <Text style={{ fontFamily: fonts.mono, fontSize: 16, color: c.text }}>
              {totalTarget.toFixed(3)} TND
            </Text>
          </View>
        </View>
      )}

      {isLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontFamily: fonts.body, color: c.textMuted }}>{t('common.loading')}</Text>
        </View>
      ) : goals.length === 0 ? (
        <EmptyState
          icon="TrendingUp"
          title={t('goals.noGoals')}
          subtitle={t('goals.noGoalsSubtitle')}
        />
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={reload}
              tintColor={c.accent}
            />
          }
        >
          {goals.map((g) => (
            <GoalCard
              key={g.id}
              goal={g}
              onAddSavings={addSavings}
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

      <AddGoalSheet ref={sheetRef} />
    </ScreenWrapper>
  );
}
