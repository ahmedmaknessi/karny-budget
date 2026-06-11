import { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import Toast from 'react-native-toast-message';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { verifyOtp } from '@/lib/auth/otp';
import { fonts, radius } from '@/constants/theme';
import { useColors } from '@/lib/theme/useColors';
import { ChevronLeft } from 'lucide-react-native';

const CODE_LENGTH = 6;
const RESEND_DELAY_SECONDS = 30;

export default function VerifyScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(RESEND_DELAY_SECONDS);
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const c = useColors();

  // Shake animation
  const shakeX = useSharedValue(0);
  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  function triggerShake() {
    shakeX.value = withSequence(
      withTiming(-10, { duration: 50 }),
      withTiming(10, { duration: 50 }),
      withTiming(-10, { duration: 50 }),
      withTiming(10, { duration: 50 }),
      withTiming(0, { duration: 50 }),
    );
  }

  // Countdown timer for resend
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleSubmit = useCallback(
    async (fullCode: string) => {
      if (!email) return;
      setLoading(true);
      try {
        await verifyOtp(email, fullCode);
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        // Session is set automatically via onAuthStateChange in _layout
      } catch (err: unknown) {
        triggerShake();
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        const message = err instanceof Error ? err.message : 'Invalid code';
        Toast.show({ type: 'error', text1: message });
        // Clear code and re-focus first box
        setCode(Array(CODE_LENGTH).fill(''));
        inputRefs.current[0]?.focus();
      } finally {
        setLoading(false);
      }
    },
    [email],
  );

  function handleChange(text: string, index: number) {
    // Only allow digits
    const digit = text.replace(/[^0-9]/g, '').slice(-1);
    const newCode = [...code];
    newCode[index] = digit;
    setCode(newCode);

    if (digit && index < CODE_LENGTH - 1) {
      // Auto-advance to next box
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits entered
    if (digit && index === CODE_LENGTH - 1) {
      const fullCode = newCode.join('');
      if (fullCode.length === CODE_LENGTH) {
        handleSubmit(fullCode);
      }
    }
  }

  function handleKeyPress(key: string, index: number) {
    if (key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      const newCode = [...code];
      newCode[index - 1] = '';
      setCode(newCode);
    }
  }

  async function handleResend() {
    if (!email) return;
    try {
      const { requestOtp } = await import('@/lib/auth/otp');
      await requestOtp(email);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setCountdown(RESEND_DELAY_SECONDS);
      Toast.show({ type: 'success', text1: 'Code resent' });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to resend';
      Toast.show({ type: 'error', text1: message });
    }
  }

  function handleManualVerify() {
    const fullCode = code.join('');
    if (fullCode.length === CODE_LENGTH) {
      handleSubmit(fullCode);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.primary }}>
      <KeyboardAvoidingView
        style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 24 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Back button */}
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ position: 'absolute', top: 16, left: 16, flexDirection: 'row', alignItems: 'center', gap: 4 }}
        >
          <ChevronLeft size={20} color={c.accent} strokeWidth={1.5} />
          <Text style={{ fontFamily: fonts.bodyMd, color: c.accent, fontSize: 15 }}>
            Back
          </Text>
        </TouchableOpacity>

        {/* Header */}
        <Text
          style={{
            fontFamily: fonts.display,
            fontSize: 28,
            color: c.text,
            marginBottom: 8,
          }}
        >
          Enter your code
        </Text>
        <Text
          style={{
            fontFamily: fonts.body,
            fontSize: 15,
            color: c.textMuted,
            marginBottom: 40,
          }}
        >
          We sent a 6-digit code to{' '}
          <Text style={{ color: c.text, fontFamily: fonts.bodyMd }}>{email}</Text>
        </Text>

        {/* OTP Boxes */}
        <Animated.View
          style={[
            { flexDirection: 'row', justifyContent: 'center', gap: 12, marginBottom: 32 },
            shakeStyle,
          ]}
        >
          {Array.from({ length: CODE_LENGTH }).map((_, i) => {
            return (
              <TextInput
                key={i}
                ref={(ref) => { inputRefs.current[i] = ref; }}
                value={code[i]}
                onChangeText={(text) => handleChange(text, i)}
                onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, i)}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
                style={{
                  width: 52,
                  height: 56,
                  borderRadius: radius.lg,
                  borderWidth: 1.5,
                  borderColor: code[i]
                    ? c.success
                    : c.border,
                  backgroundColor: c.surface2,
                  fontFamily: fonts.mono,
                  fontSize: 24,
                  color: c.text,
                  textAlign: 'center',
                }}
              />
            );
          })}
        </Animated.View>

        {/* Verify button */}
        <TouchableOpacity
          onPress={handleManualVerify}
          disabled={loading || code.join('').length < CODE_LENGTH}
          style={{
            backgroundColor: c.accent,
            borderRadius: radius.md,
            paddingVertical: 16,
            alignItems: 'center',
            opacity: loading || code.join('').length < CODE_LENGTH ? 0.5 : 1,
            marginBottom: 24,
          }}
        >
          <Text style={{ fontFamily: fonts.bodyMd, fontSize: 16, color: c.accentFg }}>
            {loading ? 'Verifying...' : 'Verify'}
          </Text>
        </TouchableOpacity>

        {/* Resend */}
        <View style={{ alignItems: 'center' }}>
          {countdown > 0 ? (
            <Text style={{ fontFamily: fonts.body, fontSize: 14, color: c.textMuted }}>
              Resend code in {countdown}s
            </Text>
          ) : (
            <TouchableOpacity onPress={handleResend}>
              <Text style={{ fontFamily: fonts.bodyMd, fontSize: 14, color: c.accent }}>
                Resend code
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
