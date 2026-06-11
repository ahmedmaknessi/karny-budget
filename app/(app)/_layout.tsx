import { Redirect } from 'expo-router';
import { Tabs } from 'expo-router';
import { useAuthStore } from '@/store/auth';
import { TabBar } from '@/components/layout/TabBar';
import { useSyncStatus } from '@/lib/sync/useSyncStatus';
import { useSettings } from '@/lib/hooks/useSettings';

export default function AppLayout() {
  const session = useAuthStore((s) => s.session);
  useSyncStatus();
  useSettings();

  if (!session) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{
        headerShown:     false,
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tabs.Screen name="index"        options={{ title: 'Dashboard'    }} />
      <Tabs.Screen name="transactions" options={{ title: 'Transactions' }} />
      <Tabs.Screen name="budgets"      options={{ title: 'Budgets'      }} />
      <Tabs.Screen name="goals"        options={{ title: 'Goals'        }} />
      <Tabs.Screen name="settings"     options={{ title: 'Settings'     }} />
    </Tabs>
  );
}
