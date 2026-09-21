import React, { useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import { GlobalStyle } from '../styles/GlobalStyle';

export default function FloatingDelta({ animKey, text, color, onDone }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    opacity.setValue(1);
    translateY.setValue(0);

    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -28,
        duration: 650,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 650,
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) onDoneRef.current(animKey);
    });
    // Kun animKey skal genstarte animationen. onDone/opacity/translateY skifter
    // reference ved forældre-rerenders, hvilket ellers afbryder animationen
    // undervejs, så den aldrig når finished:true og "+1"/"-1" hænger fast.
  }, [animKey]);

  return (
    <Animated.Text
      style={[
        GlobalStyle.floatingDelta,
        { color, opacity, transform: [{ translateY }] },
      ]}
    >
      {text}
    </Animated.Text>
  );
}
