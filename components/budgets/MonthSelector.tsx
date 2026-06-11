import { View, Text, TouchableOpacity } from 'react-native';
import { fonts, radius } from '@/constants/theme';
import { useColors } from '@/lib/theme/useColors';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

interface MonthSelectorProps {
  month:    number; // 1–12
  year:     number;
  onChange: (month: number, year: number) => void;
}

export function MonthSelector({ month, year, onChange }: MonthSelectorProps) {
  const c = useColors();

  function prev() {
    if (month === 1) onChange(12, year - 1);
    else             onChange(month - 1, year);
  }

  function next() {
    if (month === 12) onChange(1, year + 1);
    else              onChange(month + 1, year);
  }

  return (
    <View style={{
      flexDirection:  'row',
      alignItems:     'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical:   12,
    }}>
      <TouchableOpacity
        onPress={prev}
        style={{
          width:           40,
          height:          40,
          borderRadius:    20,
          backgroundColor: c.surface2,
          justifyContent:  'center',
          alignItems:      'center',
          borderWidth:     1,
          borderColor:     c.border,
        }}
      >
        <Text style={{ color: c.text, fontSize: 20 }}>‹</Text>
      </TouchableOpacity>

      <Text style={{ fontFamily: fonts.bodyMd, fontSize: 16, color: c.text }}>
        {MONTHS[month - 1]} {year}
      </Text>

      <TouchableOpacity
        onPress={next}
        style={{
          width:           40,
          height:          40,
          borderRadius:    20,
          backgroundColor: c.surface2,
          justifyContent:  'center',
          alignItems:      'center',
          borderWidth:     1,
          borderColor:     c.border,
        }}
      >
        <Text style={{ color: c.text, fontSize: 20 }}>›</Text>
      </TouchableOpacity>
    </View>
  );
}
