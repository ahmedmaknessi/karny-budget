import { Redirect } from 'expo-router';
import { useAuthStore } from '@/store/auth';
import { View, ActivityIndicator } from 'react-native';
import { useColors } from '@/lib/theme/useColors';

export default function Index() {
  const session   = useAuthStore((s) => s.session);
  const isLoading = useAuthStore((s) => s.isLoading);
  const c = useColors();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: c.primary }}>
        <ActivityIndicator color={c.accent} />
      </View>
    );
  }

  if (session) {
    return <Redirect href="/(app)/" />;
  }

  return <Redirect href="/(auth)/login" />;
}
