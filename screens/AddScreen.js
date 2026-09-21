import React, { useEffect, useState } from 'react';
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import ButtonComponent from '../components/ButtonComponent';
import CategoryChips from '../components/CategoryChips';
import KeyboardDoneAccessory, {
  KEYBOARD_DONE_ACCESSORY_ID,
} from '../components/KeyboardDoneAccessory';
import { categorizeProduct } from '../data/categorize';
import { useShopping } from '../context/ShoppingContext';
import { GlobalStyle } from '../styles/GlobalStyle';

export default function AddScreen({ navigation }) {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [category, setCategory] = useState(categorizeProduct(''));
  const [categoryTouched, setCategoryTouched] = useState(false);
  const { addItem } = useShopping();

  useEffect(() => {
    if (!categoryTouched) {
      setCategory(categorizeProduct(name));
    }
  }, [name, categoryTouched]);

  const handleCategorySelect = (value) => {
    Keyboard.dismiss();
    setCategoryTouched(true);
    setCategory(value);
  };

  const handleAdd = () => {
    Keyboard.dismiss();
    const success = addItem(name, quantity, category);
    if (!success) {
      Alert.alert('Tomt felt', 'Skriv venligst navnet på varen.');
      return;
    }
    setName('');
    setQuantity('1');
    setCategoryTouched(false);
    setCategory(categorizeProduct(''));
    navigation.navigate('Liste');
  };

  const handleCancel = () => {
    Keyboard.dismiss();
    navigation.navigate('Liste');
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#F5F7FA' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[GlobalStyle.container, { flexGrow: 1 }]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        onScrollBeginDrag={Keyboard.dismiss}
      >
        <View style={GlobalStyle.card}>
          <Text style={GlobalStyle.title}>Tilføj vare</Text>
          <Text style={GlobalStyle.subtitle}>
            Kategori vælges automatisk ud fra navnet — ret den med knapperne
            hvis det ikke passer.
          </Text>

          <Text style={GlobalStyle.label}>Varenavn</Text>
          <TextInput
            style={GlobalStyle.textInput}
            placeholder="Fx. Mælk"
            value={name}
            onChangeText={setName}
            returnKeyType="done"
            blurOnSubmit
            onSubmitEditing={Keyboard.dismiss}
            inputAccessoryViewID={KEYBOARD_DONE_ACCESSORY_ID}
          />

          <Text style={GlobalStyle.label}>Antal</Text>
          <TextInput
            style={GlobalStyle.textInput}
            placeholder="1"
            value={quantity}
            onChangeText={setQuantity}
            keyboardType="number-pad"
            returnKeyType="done"
            inputAccessoryViewID={KEYBOARD_DONE_ACCESSORY_ID}
          />

          <Text style={GlobalStyle.label}>Kategori</Text>
          <CategoryChips selected={category} onSelect={handleCategorySelect} />

          <ButtonComponent title="Gem vare" onPress={handleAdd} type="primary" />
          <ButtonComponent
            title="Annuller"
            onPress={handleCancel}
            type="secondary"
          />
        </View>

        <StatusBar style="auto" />
      </ScrollView>

      <KeyboardDoneAccessory />
    </KeyboardAvoidingView>
  );
}
