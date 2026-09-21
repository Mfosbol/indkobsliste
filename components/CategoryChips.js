import React, { useMemo, useRef, useEffect } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { CATEGORIES } from '../data/categories';
import { GlobalStyle } from '../styles/GlobalStyle';

export default function CategoryChips({ selected, onSelect }) {
  const scrollRef = useRef(null);

  const orderedCategories = useMemo(() => {
    if (!selected || !CATEGORIES.includes(selected)) {
      return CATEGORIES;
    }
    return [selected, ...CATEGORIES.filter((category) => category !== selected)];
  }, [selected]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ x: 0, animated: true });
  }, [selected]);

  return (
    <View style={GlobalStyle.chipsWrap}>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={GlobalStyle.chipsRow}
      >
        {orderedCategories.map((category) => {
          const active = selected === category;
          return (
            <Pressable
              key={category}
              onPress={() => onSelect(category)}
              style={[GlobalStyle.chip, active && GlobalStyle.chipActive]}
            >
              <Text
                style={[
                  GlobalStyle.chipText,
                  active && GlobalStyle.chipTextActive,
                ]}
              >
                {category}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
