import { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Toast from 'react-native-toast-message';
import { init } from '@paralleldrive/cuid2';
import { db } from '@/lib/db/client';
import { accounts, budgets, syncQueue } from '@/drizzle/schema';
import { useAuthStore } from '@/store/auth';
import { CURRENCIES, DEFAULT_CURRENCY } from '@/constants/currencies';
import { DEFAULT_CATEGORIES } from '@/constants/categories';
import { t } from '@/i18n';
import { fonts } from '@/constants/theme';
import { useColors } from '@/lib/theme/useColors';
import { Wallet, Building2, Smartphone } from 'lucide-react-native';
import { CategoryIcon } from '@/components/ui/CategoryIcon';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const cuid = init({ length: 16 });

type AccountType = 'CASH' | 'BANK' | 'MOBILE_WALLET';

const ACCOUNT_TYPES = [
  { key: 'CASH' as const,          icon: Wallet },
  { key: 'BANK' as const,          icon: Building2 },
  { key: 'MOBILE_WALLET' as const, icon: Smartphone },
];

export default function OnboardingScreen() {
  const router  = useRouter();
  const user    = useAuthStore((s) => s.user);
  const scrollRef = useRef<ScrollView>(null);
  const c = useColors();

  const [step,         setStep]         = useState(0);
  const [currency,     setCurrency]     = useState(DEFAULT_CURRENCY);
  const [accountName,  setAccountName]  = useState('');
  const [accountType,  setAccountType]  = useState<AccountType>('CASH');
  const [balance,      setBalance]      = useState('0');
  const [budgetCatId,  setBudgetCatId]  = useState(DEFAULT_CATEGORIES[0].id);
  const [budgetAmount, setBudgetAmount] = useState('');
  const [saving,       setSaving]       = useState(false);

  function goToStep(next: number) {
    scrollRef.current?.scrollTo({ x: next * SCREEN_WIDTH, animated: true });
    setStep(next);
  }

  async function handleFinish() {
    if (!user) return;
    if (!accountName.trim()) {
      Toast.show({ type: 'error', text1: 'Enter an account name' });
      return;
    }
    if (!budgetAmount.trim() || isNaN(Number(budgetAmount))) {
      Toast.show({ type: 'error', text1: 'Enter a valid budget amount' });
      return;
    }

    setSaving(true);
    try {
      const now        = new Date().toISOString();
      const accountId  = cuid();
      const budgetId   = cuid();
      const today      = new Date();

      // Step 2: insert account
      await db.insert(accounts).values({
        id:         accountId,
        userId:     user.id,
        name:       accountName.trim(),
        type:       accountType,
        balance:    parseFloat(balance) || 0,
        currency,
        color:      '#C8F135',
        icon:       'wallet',
        isArchived: false,
        synced:     false,
        updatedAt:  now,
        createdAt:  now,
      });

      await db.insert(syncQueue).values({
        table:     'accounts',
        operation: 'INSERT',
        payload:   JSON.stringify({ id: accountId }),
        synced:    false,
        error:     false,
        createdAt: now,
      });

      // Step 3: insert budget
      await db.insert(budgets).values({
        id:           budgetId,
        userId:       user.id,
        categoryId:   budgetCatId,
        amount:       parseFloat(budgetAmount),
        currency,
        month:        today.getMonth() + 1,
        year:         today.getFullYear(),
        rollover:     false,
        alertSent80:  false,
        alertSent100: false,
        synced:       false,
        updatedAt:    now,
      });

      await db.insert(syncQueue).values({
        table:     'budgets',
        operation: 'INSERT',
        payload:   JSON.stringify({ id: budgetId }),
        synced:    false,
        error:     false,
        createdAt: now,
      });

      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      router.replace('/(app)/');
    } catch (err) {
      console.error(err);
      Toast.show({ type: 'error', text1: t('common.error') });
    } finally {
      setSaving(false);
    }
  }

  const steps = [
    t('onboarding.step1Title'),
    t('onboarding.step2Title'),
    t('onboarding.step3Title'),
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.primary }}>
      {/* Progress dots */}
      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 8, paddingTop: 24, paddingBottom: 8 }}>
        {steps.map((_, i) => (
          <MotiView
            key={i}
            animate={{ width: i === step ? 24 : 8, backgroundColor: i === step ? c.accent : c.border }}
            transition={{ type: 'spring' }}
            style={{ height: 8, borderRadius: 4 }}
          />
        ))}
      </View>

      <Text style={{ fontFamily: fonts.display, fontSize: 22, color: c.text, textAlign: 'center', paddingHorizontal: 24, marginTop: 8 }}>
        {steps[step]}
      </Text>
      <Text style={{ fontFamily: fonts.body, fontSize: 14, color: c.textMuted, textAlign: 'center', marginBottom: 24 }}>
        {[t('onboarding.step1Subtitle'), t('onboarding.step2Subtitle'), t('onboarding.step3Subtitle')][step]}
      </Text>

      {/* Horizontal scroll pages */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        style={{ flex: 1 }}
      >
        {/* ─── STEP 1: Currency ─── */}
        <View style={{ width: SCREEN_WIDTH, paddingHorizontal: 16 }}>
          <FlatList
            data={CURRENCIES}
            keyExtractor={(item) => item.code}
            numColumns={3}
            scrollEnabled={false}
            renderItem={({ item }) => {
              const selected = item.code === currency;
              return (
                <TouchableOpacity
                  onPress={() => setCurrency(item.code)}
                  style={{
                    flex: 1,
                    margin: 6,
                    backgroundColor: selected ? c.accent : c.surface,
                    borderRadius: 12,
                    padding: 12,
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: selected ? c.accent : c.border,
                  }}
                >
                  <Text style={{ fontSize: 28 }}>{item.flag}</Text>
                  <Text style={{ fontFamily: fonts.bodyMd, fontSize: 13, color: selected ? c.accentFg : c.text, marginTop: 4 }}>
                    {item.code}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
        </View>

        {/* ─── STEP 2: Account ─── */}
        <View style={{ width: SCREEN_WIDTH, paddingHorizontal: 24, gap: 16 }}>
          {/* Account type */}
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {ACCOUNT_TYPES.map((at) => {
              const selected = accountType === at.key;
              return (
                <TouchableOpacity
                  key={at.key}
                  onPress={() => setAccountType(at.key)}
                  style={{
                    flex:            1,
                    height:          80,
                    justifyContent:  'center',
                    alignItems:      'center',
                    backgroundColor: selected ? c.accent : c.surface,
                    borderRadius:    12,
                    borderWidth:     1,
                    borderColor:     selected ? c.accent : c.border,
                    gap:             6,
                    paddingHorizontal: 4,
                  }}
                >
                  {(() => {
                    const IconComponent = at.icon;
                    return <IconComponent size={22} color={selected ? c.accentFg : c.textMuted} strokeWidth={1.5} />;
                  })()}
                  <Text
                    style={{
                      fontFamily: fonts.bodyMd,
                      fontSize:   11,
                      color:      selected ? c.accentFg : c.text,
                      textAlign:  'center',
                    }}
                    numberOfLines={2}
                  >
                    {t(`onboarding.types.${at.key}`)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Account name */}
          <TextInput
            value={accountName}
            onChangeText={setAccountName}
            placeholder={t('onboarding.accountName')}
            placeholderTextColor={c.textMuted}
            style={{
              fontFamily: fonts.body,
              fontSize: 16,
              color: c.text,
              backgroundColor: c.surface,
              borderWidth: 1,
              borderColor: c.border,
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 14,
            }}
          />

          {/* Opening balance */}
          <TextInput
            value={balance}
            onChangeText={setBalance}
            placeholder={t('onboarding.openingBalance')}
            placeholderTextColor={c.textMuted}
            keyboardType="decimal-pad"
            style={{
              fontFamily: fonts.mono,
              fontSize: 20,
              color: c.text,
              backgroundColor: c.surface,
              borderWidth: 1,
              borderColor: c.border,
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 14,
            }}
          />
        </View>

        {/* ─── STEP 3: Budget ─── */}
        <View style={{ width: SCREEN_WIDTH, paddingHorizontal: 24, gap: 16 }}>
          {/* Category picker */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              {DEFAULT_CATEGORIES.filter((cat) => cat.type !== 'INCOME').map((cat) => {
                const selected = budgetCatId === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    onPress={() => setBudgetCatId(cat.id)}
                    style={{
                      backgroundColor: selected ? c.accent : c.surface,
                      borderRadius: 12,
                      paddingHorizontal: 14,
                      paddingVertical: 10,
                      alignItems: 'center',
                      borderWidth: 1,
                      borderColor: selected ? c.accent : c.border,
                      gap: 4,
                    }}
                  >
                    <CategoryIcon name={cat.icon} color={selected ? c.accentFg : cat.color} size={20} />
                    <Text style={{ fontFamily: fonts.bodyMd, fontSize: 11, color: selected ? c.accentFg : c.text }}>
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          {/* Budget amount */}
          <TextInput
            value={budgetAmount}
            onChangeText={setBudgetAmount}
            placeholder={t('budgets.monthlyLimit')}
            placeholderTextColor={c.textMuted}
            keyboardType="decimal-pad"
            style={{
              fontFamily: fonts.mono,
              fontSize: 24,
              color: c.text,
              backgroundColor: c.surface,
              borderWidth: 1,
              borderColor: c.border,
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 14,
            }}
          />
          <Text style={{ fontFamily: fonts.body, fontSize: 13, color: c.textMuted }}>
            {CURRENCIES.find((curr) => curr.code === currency)?.name ?? currency}
          </Text>
        </View>
      </ScrollView>

      {/* Navigation buttons */}
      <View style={{ flexDirection: 'row', paddingHorizontal: 24, paddingBottom: 24, gap: 12 }}>
        {step > 0 && (
          <TouchableOpacity
            onPress={() => goToStep(step - 1)}
            style={{
              flex: 1,
              borderWidth: 1,
              borderColor: c.border,
              borderRadius: 12,
              paddingVertical: 16,
              alignItems: 'center',
            }}
          >
            <Text style={{ fontFamily: fonts.bodyMd, fontSize: 16, color: c.text }}>
              {t('common.back')}
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          onPress={step < 2 ? () => goToStep(step + 1) : handleFinish}
          disabled={saving}
          style={{
            flex: 2,
            backgroundColor: c.accent,
            borderRadius: 12,
            paddingVertical: 16,
            alignItems: 'center',
            opacity: saving ? 0.7 : 1,
          }}
        >
          <Text style={{ fontFamily: fonts.bodyMd, fontSize: 16, color: c.accentFg }}>
            {step < 2 ? t('common.next') : saving ? t('common.loading') : t('onboarding.getStarted')}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
