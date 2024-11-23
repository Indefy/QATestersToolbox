import React from 'react';
import { StyleSheet, TextInput, View, Animated, Text } from 'react-native';
import { colors, borderRadius, typography, shadows } from '../../styles/theme';

export const GlassInput = ({
  label,
  value,
  onChangeText,
  placeholder,
  style,
  ...props
}) => {
  const [isFocused, setIsFocused] = React.useState(false);
  const animatedValue = React.useRef(new Animated.Value(value ? 1 : 0)).current;

  React.useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: isFocused || value ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isFocused, value]);

  const labelStyle = {
    transform: [
      {
        translateY: animatedValue.interpolate({
          inputRange: [0, 1],
          outputRange: [20, 0],
        }),
      },
    ],
    fontSize: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [16, 12],
    }),
    color: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [colors.textSecondary, colors.primary],
    }),
  };

  return (
    <View style={[styles.container, style]}>
      <Animated.Text style={[styles.label, labelStyle]}>
        {label}
      </Animated.Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={isFocused || value ? '' : placeholder}
        placeholderTextColor={colors.textSecondary}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        {...props}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  input: {
    backgroundColor: colors.glass,
    borderRadius: borderRadius.md,
    padding: 16,
    color: colors.text,
    ...shadows.glass,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  label: {
    position: 'absolute',
    left: 16,
    top: 18,
    ...typography.body,
    zIndex: 1,
  },
});
