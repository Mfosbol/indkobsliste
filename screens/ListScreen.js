import React, { useState } from 'react';
import {
  Pressable,
  SectionList,
  Text,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import ButtonComponent from '../components/ButtonComponent';
import EditItemModal from '../components/EditItemModal';
import FloatingDelta from '../components/FloatingDelta';
import SwipeToDelete from '../components/SwipeToDelete';
import { useShopping } from '../context/ShoppingContext';
import { GlobalStyle } from '../styles/GlobalStyle';

function formatItemLabel(item) {
  return item.quantity > 1 ? `${item.quantity}x ${item.name}` : item.name;
}

function ListItem({
  item,
  onToggle,
  onChangeQuantity,
  onDelete,
  onLongPress,
}) {
  const [floats, setFloats] = useState([]);

  const handleQuantityChange = (delta) => {
    onChangeQuantity(item.id, delta);
    const animKey = Date.now() + Math.random();
    setFloats((prev) => [...prev, { key: animKey, delta }]);
  };

  const removeFloat = (animKey) => {
    setFloats((prev) => prev.filter((float) => float.key !== animKey));
  };

  return (
    <SwipeToDelete onDelete={() => onDelete(item.id)}>
      <View style={GlobalStyle.itemRow}>
        <Pressable
          style={GlobalStyle.itemMain}
          onPress={() => onToggle(item.id)}
          onLongPress={() => onLongPress(item)}
          delayLongPress={350}
        >
          <Text
            style={
              item.bought ? GlobalStyle.itemTextBought : GlobalStyle.itemText
            }
          >
            {formatItemLabel(item)}
          </Text>
          <Text
            style={
              item.bought
                ? GlobalStyle.statusBadgeBought
                : GlobalStyle.statusBadge
            }
          >
            {item.bought ? 'Købt' : 'Mangler'}
          </Text>
        </Pressable>

        <View style={GlobalStyle.qtyControls}>
          <View style={GlobalStyle.floatWrap}>
            {floats
              .filter((float) => float.delta < 0)
              .map((float) => (
                <FloatingDelta
                  key={float.key}
                  animKey={float.key}
                  text="-1"
                  color="#C62828"
                  onDone={removeFloat}
                />
              ))}
            <Pressable
              style={GlobalStyle.qtyBtn}
              onPress={() => handleQuantityChange(-1)}
            >
              <Text style={GlobalStyle.qtyBtnText}>−</Text>
            </Pressable>
          </View>
          <View style={GlobalStyle.floatWrap}>
            {floats
              .filter((float) => float.delta > 0)
              .map((float) => (
                <FloatingDelta
                  key={float.key}
                  animKey={float.key}
                  text="+1"
                  color="#2E7D4F"
                  onDone={removeFloat}
                />
              ))}
            <Pressable
              style={GlobalStyle.qtyBtn}
              onPress={() => handleQuantityChange(1)}
            >
              <Text style={GlobalStyle.qtyBtnText}>+</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </SwipeToDelete>
  );
}

export default function ListScreen({ navigation }) {
  const {
    items,
    sections,
    toggleItem,
    changeQuantity,
    updateItem,
    deleteItem,
    clearBought,
  } = useShopping();

  const [editingItem, setEditingItem] = useState(null);
  const boughtCount = items.filter((item) => item.bought).length;
  const totalPieces = items.reduce((sum, item) => sum + item.quantity, 0);

  const handleSaveEdit = ({ name, category }) => {
    if (!editingItem) return;
    const ok = updateItem(editingItem.id, { name, category });
    if (ok) setEditingItem(null);
  };

  return (
    <View style={GlobalStyle.screen}>
      <Text style={GlobalStyle.counter}>
        {items.length} vare{items.length === 1 ? '' : 'r'} · {totalPieces} stk.
        {boughtCount > 0 ? ` · ${boughtCount} købt` : ''}
      </Text>
      <Text style={GlobalStyle.hintText}>
        Tip: hold inde for at redigere · swipe til venstre for at slette
      </Text>

      {items.length === 0 ? (
        <Text style={GlobalStyle.emptyText}>
          Listen er tom. Tilføj en vare for at komme i gang.
        </Text>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          stickySectionHeadersEnabled={false}
          renderSectionHeader={({ section: { title } }) => (
            <Text style={GlobalStyle.sectionHeader}>{title}</Text>
          )}
          renderItem={({ item }) => (
            <ListItem
              item={item}
              onToggle={toggleItem}
              onChangeQuantity={changeQuantity}
              onDelete={deleteItem}
              onLongPress={setEditingItem}
            />
          )}
          contentContainerStyle={{ paddingBottom: 12 }}
        />
      )}

      <View style={{ marginTop: 8 }}>
        <ButtonComponent
          title="Tilføj vare"
          onPress={() => navigation.navigate('Tilføj')}
          type="primary"
        />
        <ButtonComponent
          title="Ryd købte varer"
          onPress={clearBought}
          type="danger"
        />
      </View>

      <EditItemModal
        visible={!!editingItem}
        item={editingItem}
        onSave={handleSaveEdit}
        onClose={() => setEditingItem(null)}
      />

      <StatusBar style="auto" />
    </View>
  );
}
