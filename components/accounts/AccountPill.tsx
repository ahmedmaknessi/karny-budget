import { View, Text, TouchableOpacity } from 'react-native';
import type { Account } from '@/drizzle/schema';
import { formatCurrency } from '@/lib/currency/format';
import { fonts, radius } from '@/constants/theme';
import { useColors } from '@/lib/theme/useColors';
import { Wallet, Building2, Smartphone } from 'lucide-react-native';

interface Props {
  account:  Account;
  onPress?: () => void;
}

export function AccountPill({ account, onPress }: Props) {
  const c = useColors();
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={{
        backgroundColor: c.surface,
        borderRadius:    radius.lg,
        borderWidth:     1,
        borderColor:     c.border,
        padding:         16,
        marginRight:     12,
        minWidth:        140,
        gap:             8,
      }}
    >
      {/* Icon dot + name */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <View
          style={{
            width:           32,
            height:          32,
            borderRadius:    16,
            backgroundColor: account.color + '33',
            justifyContent:  'center',
            alignItems:      'center',
          }}
        >
          {account.type === 'CASH' ? (
            <Wallet size={16} color={account.color} strokeWidth={1.5} />
          ) : account.type === 'BANK' ? (
            <Building2 size={16} color={account.color} strokeWidth={1.5} />
          ) : (
            <Smartphone size={16} color={account.color} strokeWidth={1.5} />
          )}
        </View>
        <Text
          style={{
            fontFamily: fonts.bodyMd,
            fontSize:   13,
            color:      c.textMuted,
          }}
          numberOfLines={1}
        >
          {account.name}
        </Text>
      </View>

      {/* Balance */}
      <Text
        style={{
          fontFamily: fonts.mono,
          fontSize:   18,
          color:      c.text,
        }}
        numberOfLines={1}
      >
        {formatCurrency(account.balance, account.currency)}
      </Text>
    </TouchableOpacity>
  );
}
