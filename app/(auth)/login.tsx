import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Toast from 'react-native-toast-message';
import * as Haptics from 'expo-haptics';
import { requestOtp } from '@/lib/auth/otp';
import { useGoogleAuth, signInWithGoogleToken } from '@/lib/auth/google';
import { t } from '@/i18n';
import { fonts, radius } from '@/constants/theme';
import { useColors } from '@/lib/theme/useColors';
import Svg, { Path } from 'react-native-svg';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const c = useColors();

  const { request, response, promptAsync } = useGoogleAuth();

  // Handle Google OAuth response
  useEffect(() => {
    if (response?.type === 'success') {
      const idToken = response.params?.id_token;
      if (idToken) {
        setGoogleLoading(true);
        signInWithGoogleToken(idToken)
          .then(() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          })
          .catch((err: unknown) => {
            const message = err instanceof Error ? err.message : 'Google sign-in failed';
            Toast.show({ type: 'error', text1: message });
          })
          .finally(() => setGoogleLoading(false));
      }
    }
  }, [response]);

  async function handleSendCode() {
    const trimmed = email.trim();
    if (!trimmed) {
      Toast.show({ type: 'error', text1: 'Enter your email first' });
      return;
    }
    setLoading(true);
    try {
      await requestOtp(trimmed);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      router.push({ pathname: '/(auth)/verify', params: { email: trimmed } });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to send code';
      Toast.show({ type: 'error', text1: message });
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    try {
      await promptAsync();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Google sign-in failed';
      Toast.show({ type: 'error', text1: message });
    }
  }

  const isAnyLoading = loading || googleLoading;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.primary }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo / Title */}
          <Text
            style={{
              fontFamily: fonts.display,
              fontSize: 36,
              color: c.accent,
              marginBottom: 8,
            }}
          >
            Karny
          </Text>
          <Text
            style={{
              fontFamily: fonts.body,
              fontSize: 16,
              color: c.textMuted,
              marginBottom: 48,
            }}
          >
            {t('auth.welcomeBack')}
          </Text>

          <View style={{ gap: 16 }}>
            {/* Email */}
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder={t('auth.email')}
              placeholderTextColor={c.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              editable={!isAnyLoading}
              style={{
                fontFamily: fonts.body,
                fontSize: 16,
                color: c.text,
                backgroundColor: c.surface,
                borderWidth: 1,
                borderColor: c.border,
                borderRadius: radius.md,
                paddingHorizontal: 16,
                paddingVertical: 14,
              }}
            />

            {/* Send Code button */}
            <TouchableOpacity
              onPress={handleSendCode}
              disabled={isAnyLoading}
              style={{
                backgroundColor: c.accent,
                borderRadius: radius.md,
                paddingVertical: 16,
                alignItems: 'center',
                opacity: isAnyLoading ? 0.7 : 1,
              }}
            >
              {loading ? (
                <ActivityIndicator color={c.accentFg} />
              ) : (
                <Text style={{ fontFamily: fonts.bodyMd, fontSize: 16, color: c.accentFg }}>
                  Send Code
                </Text>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 4 }}>
              <View style={{ flex: 1, height: 1, backgroundColor: c.border }} />
              <Text style={{ fontFamily: fonts.body, color: c.textMuted, fontSize: 13 }}>or</Text>
              <View style={{ flex: 1, height: 1, backgroundColor: c.border }} />
            </View>

            {/* Continue with Google */}
            <TouchableOpacity
              onPress={handleGoogleSignIn}
              disabled={!request || isAnyLoading}
              style={{
                backgroundColor: c.surface2,
                borderWidth: 1,
                borderColor: c.border,
                borderRadius: radius.md,
                paddingVertical: 16,
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'center',
                gap: 10,
                opacity: !request || isAnyLoading ? 0.5 : 1,
              }}
            >
              {googleLoading ? (
                <ActivityIndicator color={c.text} />
              ) : (
                <>
                  <Svg width={18} height={18} viewBox="0 0 24 24">
                    <Path
                      fill="#EA4335"
                      d="M12 5.04c1.67 0 3.2.58 4.38 1.71l3.27-3.27C17.68 1.54 14.98 1 12 1 7.35 1 3.37 3.67 1.39 7.56l3.85 2.99C6.16 7.45 8.87 5.04 12 5.04z"
                    />
                    <Path
                      fill="#4285F4"
                      d="M23.49 12.27c0-.81-.07-1.59-.2-2.34H12v4.44h6.44c-.28 1.48-1.12 2.73-2.37 3.58v2.98h3.83c2.24-2.06 3.59-5.1 3.59-8.66z"
                    />
                    <Path
                      fill="#FBBC05"
                      d="M5.24 14.75c-.23-.69-.36-1.42-.36-2.19s.13-1.5.36-2.19L1.39 7.37C.5 9.17 0 11.23 0 13.4s.5 4.23 1.39 6.03l3.85-2.68z"
                    />
                    <Path
                      fill="#34A853"
                      d="M12 23c3.24 0 5.97-1.08 7.96-2.92l-3.83-2.98c-1.06.71-2.42 1.14-4.13 1.14-3.13 0-5.84-2.41-6.76-5.51l-3.85 2.99C3.37 20.33 7.35 23 12 23z"
                    />
                  </Svg>
                  <Text style={{ fontFamily: fonts.bodyMd, fontSize: 16, color: c.text }}>
                    Continue with Google
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
