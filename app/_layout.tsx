import '../global.css';
import { useEffect } from 'react';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import Toast from 'react-native-toast-message';
import {
  useFonts,
  Syne_700Bold,
} from '@expo-google-fonts/syne';
import {
  DMSans_400Regular,
  DMSans_500Medium,
} from '@expo-google-fonts/dm-sans';
import {
  DMMono_400Regular,
} from '@expo-google-fonts/dm-mono';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { runMigrations } from '@/lib/db/client';
import { seedCategories } from '@/lib/db/seed';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/auth';
import { ThemeProvider, useTheme } from '@/lib/theme/context';
import { useColors } from '@/lib/theme/useColors';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60,
    },
  },
});

function AppInner() {
  const setSession = useAuthStore((s) => s.setSession);
  const setLoading = useAuthStore((s) => s.setLoading);
  const c = useColors();
  const { resolvedTheme } = useTheme();

  const [fontsLoaded] = useFonts({
    Syne_700Bold,
    DMSans_400Regular,
    DMSans_500Medium,
    DMMono_400Regular,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  useEffect(() => {
    runMigrations().then(() => seedCategories()).catch(console.error);

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => listener.subscription.unsubscribe();
  }, [setSession, setLoading]);

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: c.primary }} />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: c.primary }}>
      <BottomSheetModalProvider>
        <QueryClientProvider client={queryClient}>
          <StatusBar style={resolvedTheme === 'dark' ? 'light' : 'dark'} />
          <Stack screenOptions={{ headerShown: false }} />
          <Toast />
        </QueryClientProvider>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AppInner />
    </ThemeProvider>
  );
}
