import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '../styles/theme';

const Loading = ({ message = 'Loading...', fullScreen = false }) => {
  const containerStyle = fullScreen ? styles.fullScreenContainer : styles.container;

  return (
    <View style={containerStyle}>
      <ActivityIndicator size="large" color={colors.primary} />
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  container: {
    padding: spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  message: {
    marginTop: spacing.md,
    fontSize: typography.fontSizes.md,
    color: colors.textWhite,
    fontWeight: typography.fontWeights.medium,
  },
});

export default Loading;
