import React, { useEffect, useState } from 'react';
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import ButtonComponent from './ButtonComponent';
import CategoryChips from './CategoryChips';
import KeyboardDoneAccessory, {
  KEYBOARD_DONE_ACCESSORY_ID,
} from './KeyboardDoneAccessory';
import { categorizeProduct } from '../data/categorize';
import { GlobalStyle } from '../styles/GlobalStyle';

export default function EditItemModal({ visible, item, onSave, onClose }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [categoryTouched, setCategoryTouched] = useState(false);

  useEffect(() => {
    if (item) {
      setName(item.name);
      setCategory(item.category);
      setCategoryTouched(false);
    }
  }, [item, visible]);

  const handleNameChange = (text) => {
    setName(text);
    if (!categoryTouched) {
      setCategory(categorizeProduct(text));
    }
  };

  const handleCategorySelect = (value) => {
    Keyboard.dismiss();
    setCategoryTouched(true);
    setCategory(value);
  };

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Tomt felt', 'Skriv venligst et varenavn.');
      return;
    }
    Keyboard.dismiss();
    onSave({ name, category });
  };

  const handleClose = () => {
    Keyboard.dismiss();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={GlobalStyle.modalBackdrop}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={GlobalStyle.modalCard}>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            bounces={false}
            showsVerticalScrollIndicator={false}
          >
            <Text style={GlobalStyle.title}>Rediger vare</Text>
            <Text style={GlobalStyle.subtitle}>
              Ændr navn eller kategori, og tryk Gem.
            </Text>

            <Text style={GlobalStyle.label}>Varenavn</Text>
            <TextInput
              style={GlobalStyle.textInput}
              value={name}
              onChangeText={handleNameChange}
              placeholder="Fx. Mælk øko"
              returnKeyType="done"
              blurOnSubmit
              onSubmitEditing={Keyboard.dismiss}
              inputAccessoryViewID={KEYBOARD_DONE_ACCESSORY_ID}
            />

            <Text style={GlobalStyle.label}>Kategori</Text>
            <CategoryChips
              selected={category}
              onSelect={handleCategorySelect}
            />

            <ButtonComponent title="Gem" onPress={handleSave} type="primary" />
            <ButtonComponent
              title="Annuller"
              onPress={handleClose}
              type="secondary"
            />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>

      <KeyboardDoneAccessory />
    </Modal>
  );
}
