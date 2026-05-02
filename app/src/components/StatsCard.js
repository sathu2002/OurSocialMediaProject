import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import Card from './Card';
import { colors, typography, spacing } from '../styles/theme';

const StatsCard = ({
  title,
  value,
  subtitle,
  color = colors.primary,
  icon,
  onPress,
  style,
}) => {
  return (
    <Card onPress={onPress} style={[styles.container, style]}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {icon && <Text style={styles.icon}>{icon}</Text>}
      </View>
      <Text style={[styles.value, { color }]}>
        {value}
      </Text>
      {subtitle && (
        <Text style={styles.subtitle}>{subtitle}</Text>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    backgroundColor: colors.navy,
    borderWidth: 1,
    borderColor: colors.navyLight,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray300,
    fontWeight: typography.fontWeights.medium,
  },
  icon: {
    fontSize: typography.fontSizes.lg,
  },
  value: {
    fontSize: typography.fontSizes['2xl'],
    fontWeight: typography.fontWeights.bold,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.fontSizes.xs,
    color: colors.gray400,
  },
});

export default StatsCard;
