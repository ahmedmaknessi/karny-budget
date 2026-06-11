import { View, Text, TouchableOpacity } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { DEFAULT_CATEGORIES } from '@/constants/categories';
import { fonts, radius } from '@/constants/theme';
import { useColors } from '@/lib/theme/useColors';
import { CategoryIcon } from '@/components/ui/CategoryIcon';

interface CategoryPickerProps {
  type:      'INCOME' | 'EXPENSE';
  selected?: string;
  onSelect:  (id: string) => void;
}

export function CategoryPicker({ type, selected, onSelect }: CategoryPickerProps) {
  const c = useColors();
  const cats = DEFAULT_CATEGORIES.filter((cat) => cat.type === type || cat.type === 'BOTH');

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 10, paddingVertical: 4 }}
    >
      {cats.map((cat) => {
        const active = cat.id === selected;
        return (
          <TouchableOpacity
            key={cat.id}
            onPress={() => onSelect(cat.id)}
            style={{
              alignItems:      'center',
              paddingHorizontal: 12,
              paddingVertical:  10,
              borderRadius:    radius.md,
              backgroundColor: active ? cat.color + '33' : c.surface2,
              borderWidth:     1,
              borderColor:     active ? cat.color : c.border,
              minWidth:        64,
            }}
          >
            <CategoryIcon name={cat.icon} color={active ? cat.color : c.textMuted} size={22} />
            <Text
              style={{
                fontFamily: fonts.body,
                fontSize:   11,
                color:      active ? c.text : c.textMuted,
                marginTop:  4,
                textAlign:  'center',
              }}
              numberOfLines={1}
            >
              {cat.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}
