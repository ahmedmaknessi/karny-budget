import type { ReactNode } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColors } from '@/lib/theme/useColors';

interface Props {
  children: ReactNode;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
}

export function ScreenWrapper({ children, edges = ['top', 'left', 'right'] }: Props) {
  const c = useColors();
  return (
    <SafeAreaView
      edges={edges}
      style={{ flex: 1, backgroundColor: c.primary }}
    >
      <View style={{ flex: 1 }}>
        {children}
      </View>
    </SafeAreaView>
  );
}
