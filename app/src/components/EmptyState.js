import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Button from './Button';
import { colors, typography, spacing } from '../styles/theme';

const EmptyState = ({ 
  title = 'No Data', 
  message = 'There is nothing to show here yet.',
  actionLabel,
  onAction,
  icon: Icon,
}) => {
  return (
    <View style={styles.container}>
      {Icon && <View style={styles.iconContainer}><Icon /></View>}
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {actionLabel && onAction && (
        <Button
          title={actionLabel}
          onPress={onAction}
          variant="outline"
          style={styles.button}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    minHeight: 200,
  },
  iconContainer: {
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.semibold,
    color: colors.white,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  message: {
    fontSize: typography.fontSizes.md,
    color: colors.gray400,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  button: {
    minWidth: 150,
  },
});

export default EmptyState;
