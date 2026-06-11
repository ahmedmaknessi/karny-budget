import React from 'react';
import { View, Text } from 'react-native';
import { fonts } from '@/constants/theme';
import { useColors } from '@/lib/theme/useColors';
import * as icons from 'lucide-react-native';

interface Props {
  icon:     string;
  title:    string;
  subtitle?: string;
}

export function EmptyState({ icon, title, subtitle }: Props) {
  const c = useColors();
  const LucideIcon = (icons[icon as keyof typeof icons] || icons.HelpCircle) as any;
  return (
    <View
      style={{
        flex:           1,
        justifyContent: 'center',
        alignItems:     'center',
        gap:            12,
        paddingVertical: 48,
        paddingHorizontal: 32,
      }}
    >
      <View style={{ marginBottom: 4 }}>
        <LucideIcon size={48} color={c.textMuted} strokeWidth={1.5} />
      </View>
      <Text
        style={{
          fontFamily: fonts.display,
          fontSize:   20,
          color:      c.text,
          textAlign:  'center',
        }}
      >
        {title}
      </Text>
      {subtitle ? (
        <Text
          style={{
            fontFamily: fonts.body,
            fontSize:   14,
            color:      c.textMuted,
            textAlign:  'center',
            lineHeight: 20,
          }}
        >
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}
