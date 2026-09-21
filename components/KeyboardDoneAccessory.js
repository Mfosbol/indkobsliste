import React from 'react';
import {
  InputAccessoryView,
  Keyboard,
  Platform,
  Pressable,
  Text,
  View,
} from 'react-native';
import { GlobalStyle } from '../styles/GlobalStyle';

export const KEYBOARD_DONE_ACCESSORY_ID = 'keyboardDoneAccessory';

export default function KeyboardDoneAccessory() {
  if (Platform.OS !== 'ios') return null;

  return (
    <InputAccessoryView nativeID={KEYBOARD_DONE_ACCESSORY_ID}>
      <View style={GlobalStyle.keyboardAccessory}>
        <Pressable onPress={Keyboard.dismiss} hitSlop={12}>
          <Text style={GlobalStyle.keyboardAccessoryButton}>Færdig</Text>
        </Pressable>
      </View>
    </InputAccessoryView>
  );
}
