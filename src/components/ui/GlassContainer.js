import React from 'react';
import { StyleSheet, View, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, shadows, borderRadius } from '../../styles/theme';

export const GlassContainer = ({ children, style, animated = false }) => {
  const Container = animated ? Animated.View : View;

  return (
    <Container style={[styles.container, style]}>
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {children}
      </LinearGradient>
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.glass,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  gradient: {
    padding: 16,
    borderRadius: borderRadius.lg,
  },
});
