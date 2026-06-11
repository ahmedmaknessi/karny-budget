import { useEffect } from 'react';
import { View, Text } from 'react-native';
import Animated, { useSharedValue, withSpring, useAnimatedStyle } from 'react-native-reanimated';
import { fonts, radius } from '@/constants/theme';
import { useColors } from '@/lib/theme/useColors';
import { CategoryIcon } from '@/components/ui/CategoryIcon';

export interface CategoryBarItem {
  id:     string;
  icon:   string;
  name:   string;
  amount: number;
  color:  string;
  pct:    number; // 0–1, relative to the largest bar
}

function Bar({ pct, color }: { pct: number; color: string }) {
  const c = useColors();
  const width = useSharedValue(0);

  useEffect(() => {
    width.value = withSpring(pct, { damping: 20, stiffness: 80 });
  }, [pct]);

  const style = useAnimatedStyle(() => ({
    width: `${width.value * 100}%` as `${number}%`,
  }));

  return (
    <View style={{
      height:          6,
      backgroundColor: c.surface2,
      borderRadius:    radius.full,
      overflow:        'hidden',
    }}>
      <Animated.View style={[{
        height:          '100%',
        borderRadius:    radius.full,
        backgroundColor: color,
      }, style]} />
    </View>
  );
}

interface CategoryBarProps {
  data:     CategoryBarItem[];
  currency: string;
}

export function CategoryBar({ data, currency }: CategoryBarProps) {
  const c = useColors();
  if (data.length === 0) return null;

  return (
    <View style={{ gap: 14 }}>
      {data.map((item) => (
        <View key={item.id} style={{ gap: 6 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <CategoryIcon name={item.icon} color={item.color} size={16} />
              <Text style={{ fontFamily: fonts.body, fontSize: 13, color: c.text }}>
                {item.name}
              </Text>
            </View>
            <Text style={{ fontFamily: fonts.mono, fontSize: 13, color: c.textMuted }}>
              {item.amount.toFixed(3)} {currency}
            </Text>
          </View>
          <Bar pct={item.pct} color={item.color} />
        </View>
      ))}
    </View>
  );
}
