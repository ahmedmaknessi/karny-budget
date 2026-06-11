import { useEffect } from 'react';
import { TouchableOpacity } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing, cancelAnimation } from 'react-native-reanimated';
import { RefreshCw } from 'lucide-react-native';
import { useUiStore } from '@/store/ui';
import { useColors } from '@/lib/theme/useColors';
import { triggerSync } from '@/lib/sync/engine';

export function SyncDot() {
  const syncStatus = useUiStore((s) => s.syncStatus);
  const c = useColors();
  const rotation = useSharedValue(0);

  const isSyncing = syncStatus === 'pending';

  useEffect(() => {
    if (isSyncing) {
      rotation.value = withRepeat(
        withTiming(360, { duration: 1200, easing: Easing.linear }),
        -1, // infinite
        false // do not reverse
      );
    } else {
      cancelAnimation(rotation);
      rotation.value = 0;
    }
  }, [isSyncing]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const ICON_COLOR: Record<string, string> = {
    synced:   c.textMuted,
    pending:  c.accent,
    retrying: '#F59E0B',
    error:    c.danger,
  };

  const color = ICON_COLOR[syncStatus] ?? c.textMuted;

  return (
    <TouchableOpacity 
      onPress={() => void triggerSync()}
      disabled={isSyncing}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <Animated.View style={animatedStyle}>
        <RefreshCw size={20} color={color} strokeWidth={1.5} />
      </Animated.View>
    </TouchableOpacity>
  );
}
