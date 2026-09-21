import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Keyboard,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import ButtonComponent from '../components/ButtonComponent';
import FloatingDelta from '../components/FloatingDelta';
import KeyboardDoneAccessory, {
  KEYBOARD_DONE_ACCESSORY_ID,
} from '../components/KeyboardDoneAccessory';
import SwipeToDelete from '../components/SwipeToDelete';
import { useShopping } from '../context/ShoppingContext';
import { GlobalStyle } from '../styles/GlobalStyle';

function FrequentRow({
  item,
  onList,
  onAdd,
  onDelete,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}) {
  const [floats, setFloats] = useState([]);

  const handlePress = () => {
    onAdd(item);
    const animKey = Date.now() + Math.random();
    setFloats((prev) => [...prev, animKey]);
  };

  const removeFloat = (animKey) => {
    setFloats((prev) => prev.filter((key) => key !== animKey));
  };

  return (
    <SwipeToDelete onDelete={() => onDelete(item.name)}>
      <View style={GlobalStyle.frequentRow}>
        <View style={GlobalStyle.reorderControls}>
          <Pressable
            style={[GlobalStyle.reorderBtn, isFirst && GlobalStyle.reorderBtnDisabled]}
            onPress={onMoveUp}
            disabled={isFirst}
          >
            <Ionicons
              name="chevron-up"
              size={16}
              color={isFirst ? '#C7CDC9' : '#2E7D4F'}
            />
          </Pressable>
          <Pressable
            style={[GlobalStyle.reorderBtn, isLast && GlobalStyle.reorderBtnDisabled]}
            onPress={onMoveDown}
            disabled={isLast}
          >
            <Ionicons
              name="chevron-down"
              size={16}
              color={isLast ? '#C7CDC9' : '#2E7D4F'}
            />
          </Pressable>
        </View>

        <Pressable
          style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}
          onPress={handlePress}
        >
          <View style={{ flex: 1, marginRight: 10 }}>
            <Text style={GlobalStyle.frequentName}>{item.name}</Text>
            <Text style={GlobalStyle.frequentMeta}>
              {item.category} · købt {item.count} gang
              {item.count === 1 ? '' : 'e'}
              {onList ? ' · allerede på listen' : ''}
            </Text>
          </View>

          <View style={GlobalStyle.floatWrap}>
            {floats.map((animKey) => (
              <FloatingDelta
                key={animKey}
                animKey={animKey}
                text="+1"
                color="#2E7D4F"
                onDone={removeFloat}
              />
            ))}
            <View style={GlobalStyle.frequentAddBadge}>
              <Text style={GlobalStyle.frequentAddBadgeText}>
                {onList ? '+1' : 'Tilføj'}
              </Text>
            </View>
          </View>
        </Pressable>
      </View>
    </SwipeToDelete>
  );
}

export default function FrequentScreen({ navigation }) {
  const {
    frequentItems,
    addFromFrequent,
    addManualFrequent,
    removeFrequent,
    reorderFrequent,
    items,
  } = useShopping();

  const [newName, setNewName] = useState('');
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const scrollRef = useRef(null);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, (e) => {
      setKeyboardHeight(e.endCoordinates?.height || 0);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const handleInputFocus = () => {
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const alreadyOnList = (name) =>
    items.some(
      (item) => item.name.trim().toLowerCase() === name.trim().toLowerCase()
    );

  const handleAddManual = () => {
    const ok = addManualFrequent(newName);
    if (!ok) {
      Alert.alert(
        'Kan ikke tilføjes',
        newName.trim()
          ? 'Varen findes allerede på listen.'
          : 'Skriv venligst et varenavn.'
      );
      return;
    }
    setNewName('');
    Keyboard.dismiss();
  };

  return (
    <View style={GlobalStyle.screen}>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={{ paddingBottom: 12 }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        {frequentItems.length === 0 ? (
          <Text style={GlobalStyle.emptyText}>
            Ingen ofte købte varer endnu. Markér varer som købt på listen,
            eller tilføj en herunder.
          </Text>
        ) : (
          <View>
            {frequentItems.map((item, index) => (
              <FrequentRow
                key={item.name}
                item={item}
                onList={alreadyOnList(item.name)}
                onAdd={addFromFrequent}
                onDelete={removeFrequent}
                onMoveUp={() => reorderFrequent(index, index - 1)}
                onMoveDown={() => reorderFrequent(index, index + 1)}
                isFirst={index === 0}
                isLast={index === frequentItems.length - 1}
              />
            ))}
          </View>
        )}

        <ButtonComponent
          title="Gå til listen"
          onPress={() => navigation.navigate('Liste')}
          type="secondary"
        />

        <Text style={[GlobalStyle.title, { fontSize: 22, marginTop: 20 }]}>
          Ofte købt
        </Text>
        <Text style={[GlobalStyle.subtitle, { marginBottom: 12 }]}>
          Varer du ofte markerer som købt. Tryk for at lægge dem på listen
          igen, eller brug pilene til at ændre rækkefølgen.
        </Text>

        <View style={GlobalStyle.frequentAddCard}>
          <View style={GlobalStyle.frequentAddRow}>
            <TextInput
              style={GlobalStyle.frequentAddInput}
              placeholder="Tilføj vare til ofte købt"
              value={newName}
              onChangeText={setNewName}
              returnKeyType="done"
              onSubmitEditing={handleAddManual}
              onFocus={handleInputFocus}
              inputAccessoryViewID={KEYBOARD_DONE_ACCESSORY_ID}
            />
            <Pressable
              style={GlobalStyle.frequentAddButton}
              onPress={handleAddManual}
            >
              <Text style={GlobalStyle.frequentAddButtonText}>Tilføj</Text>
            </Pressable>
          </View>
        </View>

        <View style={{ height: keyboardHeight }} />

        <StatusBar style="auto" />
      </ScrollView>

      <KeyboardDoneAccessory />
    </View>
  );
}
