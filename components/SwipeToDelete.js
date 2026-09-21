import React from 'react';
import { Text, View } from 'react-native';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import { GlobalStyle } from '../styles/GlobalStyle';

function DeleteAction() {
  return (
    <View style={GlobalStyle.swipeDelete}>
      <Text style={GlobalStyle.swipeDeleteText}>Slet</Text>
    </View>
  );
}

export default function SwipeToDelete({ onDelete, enabled = true, children }) {
  if (!enabled) return children;

  return (
    <Swipeable
      friction={1}
      overshootRight={false}
      // Kræver ~hele slettefeltet synligt (~100px) før den snapper og sletter
      rightThreshold={100}
      dragOffsetFromRightEdge={25}
      onSwipeableOpen={onDelete}
      renderRightActions={() => <DeleteAction />}
    >
      {children}
    </Swipeable>
  );
}
