import React from 'react';
import { Pressable, Text } from 'react-native';
import { GlobalStyle } from '../styles/GlobalStyle';

export default function ButtonComponent({ title, onPress, type = 'primary' }) {
  const buttonStyle =
    type === 'secondary'
      ? GlobalStyle.secondaryBtn
      : type === 'danger'
        ? GlobalStyle.dangerBtn
        : GlobalStyle.primaryBtn;

  const textStyle =
    type === 'secondary'
      ? GlobalStyle.secondaryBtnText
      : type === 'danger'
        ? GlobalStyle.dangerBtnText
        : GlobalStyle.primaryBtnText;

  return (
    <Pressable
      style={({ pressed }) => [buttonStyle, pressed && { opacity: 0.8 }]}
      onPress={onPress}
    >
      <Text style={textStyle}>{title}</Text>
    </Pressable>
  );
}
