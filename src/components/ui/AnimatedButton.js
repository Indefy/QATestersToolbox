import React from 'react';
import { StyleSheet, Pressable, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, borderRadius, shadows, typography } from '../../styles/theme';

export const AnimatedButton = ({ onPress, style, children, variant = 'primary' }) => {
  const scale = React.useRef(new Animated.Value(1)).current;

  const animateScale = (value) => {
    Animated.spring(scale, {
      toValue: value,
      useNativeDriver: true,
      tension: 300,
      friction: 20,
    }).start();
  };

  const getGradientColors = () => {
    switch (variant) {
      case 'primary':
        return colors.gradients.primary;
      case 'secondary':
        return colors.gradients.secondary;
      case 'accent':
        return colors.gradients.accent;
      default:
        return colors.gradients.primary;
    }
  };

  return (
    <Pressable
      onPressIn={() => animateScale(0.95)}
      onPressOut={() => animateScale(1)}
      onPress={onPress}
    >
      <Animated.View style={[{ transform: [{ scale }] }]}>
        <LinearGradient
          colors={getGradientColors()}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.button, style]}
        >
          {children}
        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: borderRadius.md,
    ...shadows.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
