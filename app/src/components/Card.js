import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, typography, borderRadius, spacing, shadows } from '../styles/theme';

const Card = ({ 
  title, 
  subtitle, 
  children, 
  onPress, 
  style,
  headerRight,
  footer,
  padding = true,
}) => {
  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container 
      onPress={onPress} 
      activeOpacity={0.8}
      style={[
        styles.card, 
        padding && styles.cardPadding,
        style
      ]}
    >
      {(title || subtitle || headerRight) && (
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {title && <Text style={styles.title}>{title}</Text>}
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          </View>
          {headerRight && (
            <View style={styles.headerRight}>
              {headerRight}
            </View>
          )}
        </View>
      )}
      <View style={styles.content}>
        {children}
      </View>
      {footer && (
        <View style={styles.footer}>
          {footer}
        </View>
      )}
    </Container>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    ...shadows.md,
  },
  cardPadding: {
    padding: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    marginLeft: spacing.sm,
  },
  title: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    color: colors.white,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray400,
  },
  content: {
    // Content styles
  },
  footer: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.gray700,
  },
});

export default Card;
