import { useState, type ReactNode } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import Constants from 'expo-constants';
import Toast from 'react-native-toast-message';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { useSettings } from '@/lib/hooks/useSettings';
import { supabase } from '@/lib/supabase';
import { CURRENCIES } from '@/constants/currencies';
import { t } from '@/i18n';
import { fonts, radius } from '@/constants/theme';
import { useColors } from '@/lib/theme/useColors';
import { useTheme } from '@/lib/theme/context';
import type { Language } from '@/store/settings';
import { Globe, Palette, Coins, Bell, Info, Monitor, Sun, Moon, LogOut } from 'lucide-react-native';

const LANGUAGES: { code: Language; label: string; native: string }[] = [
  { code: 'fr', label: 'Français',  native: 'fr' },
  { code: 'en', label: 'English',   native: 'en' },
  { code: 'ar', label: 'العربية',   native: 'ar' },
];

function SectionTitle({ icon, children }: { icon: string; children: string }) {
  const c = useColors();
  const Icon = icon === 'Globe' ? Globe :
               icon === 'Palette' ? Palette :
               icon === 'Coins' ? Coins :
               icon === 'Bell' ? Bell :
               icon === 'Info' ? Info : null;

  return (
    <View style={{
      flexDirection:    'row',
      alignItems:       'center',
      gap:              6,
      marginHorizontal: 20,
      marginTop:        20,
      marginBottom:     8,
    }}>
      {Icon && <Icon size={14} color={c.textMuted} strokeWidth={1.5} />}
      <Text style={{
        fontFamily:       fonts.bodyMd,
        fontSize:         12,
        color:            c.textMuted,
        textTransform:    'uppercase',
        letterSpacing:    0.8,
      }}>
        {children}
      </Text>
    </View>
  );
}

function Card({ children }: { children: ReactNode }) {
  const c = useColors();
  return (
    <View style={{
      marginHorizontal: 20,
      backgroundColor:  c.surface,
      borderRadius:     radius.lg,
      borderWidth:      1,
      borderColor:      c.border,
      overflow:         'hidden',
    }}>
      {children}
    </View>
  );
}

function Row({
  label, value, onPress, last = false, danger = false, icon,
}: {
  label: string; value?: string; onPress?: () => void; last?: boolean; danger?: boolean; icon?: string;
}) {
  const c = useColors();
  const Icon = icon === 'Bell' ? Bell : icon === 'Info' ? Info : null;
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      style={{
        flexDirection:     'row',
        alignItems:        'center',
        justifyContent:    'space-between',
        paddingHorizontal: 16,
        paddingVertical:   14,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: c.border,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        {Icon && <Icon size={18} color={danger ? c.danger : c.textMuted} strokeWidth={1.5} />}
        <Text style={{ fontFamily: fonts.bodyMd, fontSize: 15, color: danger ? c.danger : c.text }}>
          {label}
        </Text>
      </View>
      {value !== undefined && (
        <Text style={{ fontFamily: fonts.body, fontSize: 14, color: c.textMuted }}>
          {value}
        </Text>
      )}
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const { language, baseCurrency, changeLanguage, changeCurrency } = useSettings();
  const { theme, setTheme } = useTheme();
  const [signingOut, setSigningOut] = useState(false);
  const c = useColors();

  async function handleLogout() {
    Alert.alert(
      t('settings.logout'),
      t('settings.logoutConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text:  t('settings.logout'),
          style: 'destructive',
          onPress: async () => {
            setSigningOut(true);
            try {
              await supabase.auth.signOut();
            } catch {
              Toast.show({ type: 'error', text1: t('common.error') });
            } finally {
              setSigningOut(false);
            }
          },
        },
      ],
    );
  }

  async function handleNotifications() {
    try {
      const Notifications = await import('expo-notifications');
      const { status } = await Notifications.requestPermissionsAsync();
      if (status === 'granted') {
        Toast.show({ type: 'success', text1: 'Notifications enabled' });
      } else {
        Toast.show({ type: 'error', text1: 'Notifications denied' });
      }
    } catch {
      Toast.show({ type: 'error', text1: t('common.error') });
    }
  }

  async function handleLanguageChange(lang: Language) {
    await changeLanguage(lang);
    if (lang === 'ar') {
      Toast.show({ type: 'info', text1: 'Restart the app for full RTL support' });
    }
  }

  return (
    <ScreenWrapper>
      <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 4 }}>
        <Text style={{ fontFamily: fonts.display, fontSize: 24, color: c.text }}>
          {t('settings.title')}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Language ── */}
        <SectionTitle icon="Globe">{t('settings.language')}</SectionTitle>
        <Card>
          <View style={{ flexDirection: 'row', padding: 12, gap: 8 }}>
            {LANGUAGES.map((lng) => {
              const active = language === lng.code;
              return (
                <TouchableOpacity
                  key={lng.code}
                  onPress={() => void handleLanguageChange(lng.code)}
                  style={{
                    flex:            1,
                    paddingVertical: 10,
                    borderRadius:    radius.md,
                    backgroundColor: active ? c.accent : c.surface2,
                    borderWidth:     1,
                    borderColor:     active ? c.accent : c.border,
                    alignItems:      'center',
                  }}
                >
                  <Text style={{
                    fontFamily: fonts.bodyMd,
                    fontSize:   14,
                    color:      active ? c.accentFg : c.text,
                  }}>
                    {lng.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Card>

        {/* ── Appearance ── */}
        <SectionTitle icon="Palette">Appearance</SectionTitle>
        <Card>
          <View style={{ flexDirection: 'row', padding: 12, gap: 8 }}>
            {(['system', 'light', 'dark'] as const).map((mode) => {
              const active = theme === mode;
              const ModeIcon = mode === 'system' ? Monitor : mode === 'light' ? Sun : Moon;
              return (
                <TouchableOpacity
                  key={mode}
                  onPress={() => setTheme(mode)}
                  style={{
                    flex:            1,
                    paddingVertical: 10,
                    borderRadius:    radius.md,
                    backgroundColor: active ? c.accent : c.surface2,
                    borderWidth:     1,
                    borderColor:     active ? c.accent : c.border,
                    alignItems:      'center',
                    flexDirection:   'row',
                    justifyContent:  'center',
                    gap:             6,
                  }}
                >
                  <ModeIcon size={16} color={active ? c.accentFg : c.textMuted} strokeWidth={1.5} />
                  <Text style={{
                    fontFamily: fonts.bodyMd,
                    fontSize:   14,
                    color:      active ? c.accentFg : c.text,
                    textTransform: 'capitalize',
                  }}>
                    {mode}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Card>

        {/* ── Currency ── */}
        <SectionTitle icon="Coins">{t('settings.currency')}</SectionTitle>
        <Card>
          {CURRENCIES.map((cur, i) => {
            const active = baseCurrency === cur.code;
            return (
              <TouchableOpacity
                key={cur.code}
                onPress={() => void changeCurrency(cur.code)}
                style={{
                  flexDirection:     'row',
                  alignItems:        'center',
                  paddingHorizontal: 16,
                  paddingVertical:   12,
                  borderBottomWidth: i === CURRENCIES.length - 1 ? 0 : 1,
                  borderBottomColor: c.border,
                  backgroundColor:   active ? c.accent + '18' : 'transparent',
                }}
              >
                <Text style={{ fontSize: 20, marginRight: 12 }}>{cur.flag}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: fonts.bodyMd, fontSize: 14, color: c.text }}>
                    {cur.code}
                  </Text>
                  <Text style={{ fontFamily: fonts.body, fontSize: 12, color: c.textMuted }}>
                    {cur.name}
                  </Text>
                </View>
                <Text style={{ fontFamily: fonts.mono, fontSize: 14, color: c.textMuted }}>
                  {cur.symbol}
                </Text>
                {active && (
                  <View style={{
                    marginLeft:      10,
                    width:           8,
                    height:          8,
                    borderRadius:    4,
                    backgroundColor: c.accent,
                  }} />
                )}
              </TouchableOpacity>
            );
          })}
        </Card>

        {/* ── Notifications ── */}
        <SectionTitle icon="Bell">{t('settings.notifications')}</SectionTitle>
        <Card>
          <Row
            label={t('settings.notifications')}
            value="Enable"
            onPress={() => void handleNotifications()}
            icon="Bell"
            last
          />
        </Card>

        {/* ── About ── */}
        <SectionTitle icon="Info">{t('settings.about')}</SectionTitle>
        <Card>
          <Row
            label={t('settings.version')}
            value={Constants.expoConfig?.version ?? '1.0.0'}
            icon="Info"
            last
          />
        </Card>

        {/* ── Logout ── */}
        <View style={{ marginHorizontal: 20, marginTop: 24 }}>
          <TouchableOpacity
            onPress={handleLogout}
            disabled={signingOut}
            style={{
              backgroundColor: c.surface,
              borderRadius:    radius.lg,
              borderWidth:     1,
              borderColor:     c.danger + '66',
              paddingVertical: 16,
              alignItems:      'center',
              justifyContent:  'center',
            }}
          >
            {signingOut ? (
              <ActivityIndicator color={c.danger} />
            ) : (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <LogOut size={18} color={c.danger} strokeWidth={1.5} />
                <Text style={{ fontFamily: fonts.bodyMd, fontSize: 16, color: c.danger }}>
                  {t('settings.logout')}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}
