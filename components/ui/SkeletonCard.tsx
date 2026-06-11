import { View } from 'react-native';
import { MotiView } from 'moti';
import { radius } from '@/constants/theme';
import { useColors } from '@/lib/theme/useColors';

interface Props {
  height?: number;
  width?:  number | string;
}

function Shimmer({ height = 16, width = '100%' }: Props) {
  const c = useColors();
  return (
    <MotiView
      from={{ opacity: 0.3 }}
      animate={{ opacity: 1 }}
      transition={{ type: 'timing', duration: 800, loop: true }}
      style={{
        height,
        width:           width as number,
        backgroundColor: c.surface2,
        borderRadius:    radius.sm,
      }}
    />
  );
}

export function SkeletonCard() {
  const c = useColors();
  return (
    <View
      style={{
        backgroundColor: c.surface,
        borderRadius:    radius.lg,
        borderWidth:     1,
        borderColor:     c.border,
        padding:         16,
        gap:             12,
      }}
    >
      <Shimmer height={14} width="40%" />
      <Shimmer height={32} width="70%" />
      <Shimmer height={12} width="55%" />
    </View>
  );
}

export function SkeletonRow() {
  const c = useColors();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 }}>
      <MotiView
        from={{ opacity: 0.3 }}
        animate={{ opacity: 1 }}
        transition={{ type: 'timing', duration: 800, loop: true }}
        style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: c.surface2 }}
      />
      <View style={{ flex: 1, gap: 8 }}>
        <Shimmer height={12} width="60%" />
        <Shimmer height={10} width="40%" />
      </View>
      <Shimmer height={14} width={60} />
    </View>
  );
}
