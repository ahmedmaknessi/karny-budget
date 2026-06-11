import React from 'react';
import { View } from 'react-native';
import * as icons from 'lucide-react-native';

type Props = {
  name: string;      // Lucide icon name string
  size?: number;
  color?: string;
  bgColor?: string;  // optional circle bg
};

export const CategoryIcon = ({ name, size = 24, color, bgColor }: Props) => {
  const LucideIcon = icons[name as keyof typeof icons] as any;
  if (!LucideIcon) return null;

  if (bgColor) {
    return (
      <View style={{ backgroundColor: bgColor, borderRadius: 999, padding: 8, justifyContent: 'center', alignItems: 'center' }}>
        <LucideIcon size={size} color={color} strokeWidth={1.5} />
      </View>
    );
  }
  return <LucideIcon size={size} color={color} strokeWidth={1.5} />;
};
