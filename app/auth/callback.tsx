import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { useColors } from '@/lib/theme/useColors';

export default function AuthCallback() {
  const c = useColors();

  useEffect(() => {
    WebBrowser.maybeCompleteAuthSession();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: c.primary }}>
      <ActivityIndicator color={c.accent} size="large" />
    </View>
  );
}
