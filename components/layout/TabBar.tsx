import { View, TouchableOpacity, Text } from 'react-native';
import type React from 'react';
import type { Tabs } from 'expo-router';
import { MotiView } from 'moti';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fonts } from '@/constants/theme';
import { useColors } from '@/lib/theme/useColors';
import { t } from '@/i18n';
import { LayoutDashboard, ArrowLeftRight, Target, TrendingUp, Settings2 } from 'lucide-react-native';

type TabBarProps = Parameters<NonNullable<React.ComponentProps<typeof Tabs>['tabBar']>>[0];

const TAB_CONFIG = [
  { name: 'index',        icon: LayoutDashboard,  labelKey: 'tabs.dashboard'     },
  { name: 'transactions', icon: ArrowLeftRight,   labelKey: 'tabs.transactions'  },
  { name: 'budgets',      icon: Target,           labelKey: 'tabs.budgets'       },
  { name: 'goals',        icon: TrendingUp,       labelKey: 'tabs.goals'         },
  { name: 'settings',     icon: Settings2,        labelKey: 'tabs.settings'      },
];

export function TabBar({ state, descriptors, navigation }: TabBarProps) {
  const insets = useSafeAreaInsets();
  const c = useColors();

  return (
    <View
      style={{
        flexDirection:   'row',
        backgroundColor: c.surface,
        borderTopWidth:  1,
        borderTopColor:  c.border,
        paddingBottom:   insets.bottom,
        paddingTop:      8,
      }}
    >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused   = state.index === index;
        const config      = TAB_CONFIG[index] ?? TAB_CONFIG[0];
        const IconComponent = config.icon;
        const label       = typeof options.tabBarLabel === 'string'
          ? options.tabBarLabel
          : t(config.labelKey);

        function onPress() {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, {});
          }
        }

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            onPress={onPress}
            style={{ flex: 1, alignItems: 'center', gap: 4 }}
          >
            {isFocused && (
              <MotiView
                from={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ type: 'spring', damping: 20 }}
                style={{
                  position:        'absolute',
                  top:             -8,
                  width:           32,
                  height:          3,
                  backgroundColor: c.accent,
                  borderRadius:    2,
                }}
              />
            )}
            <IconComponent size={20} color={isFocused ? c.accent : c.textMuted} strokeWidth={1.5} />
            <Text
              style={{
                fontFamily: isFocused ? fonts.bodyMd : fonts.body,
                fontSize:   10,
                color:      isFocused ? c.accent : c.textMuted,
              }}
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
