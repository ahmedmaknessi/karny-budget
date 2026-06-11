import { View, Text } from 'react-native';
import { SyncDot } from './SyncDot';
import { useAuthStore } from '@/store/auth';
import { t } from '@/i18n';
import { fonts } from '@/constants/theme';
import { useColors } from '@/lib/theme/useColors';

interface Props {
  title?: string;
}

export function Header({ title }: Props) {
  const c = useColors();
  const user = useAuthStore((s) => s.user);

  const displayName = user?.user_metadata?.name as string | undefined
    ?? user?.email?.split('@')[0]
    ?? '';

  const greeting = title ?? `${t('dashboard.greeting')}, ${displayName}`;

  return (
    <View
      style={{
        flexDirection:  'row',
        alignItems:     'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical:   16,
      }}
    >
      <Text
        style={{
          fontFamily: fonts.display,
          fontSize:   22,
          color:      c.text,
          flex:       1,
        }}
        numberOfLines={1}
      >
        {greeting}
      </Text>
      <SyncDot />
    </View>
  );
}
