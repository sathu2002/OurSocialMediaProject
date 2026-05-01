import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing, borderRadius } from '../styles/theme';

const ErrorMessage = ({ message, onRetry }) => {
  if (!message) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.error + '20', // 20% opacity
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  text: {
    color: colors.error,
    fontSize: typography.fontSizes.md,
    textAlign: 'center',
  },
});

export default ErrorMessage;
