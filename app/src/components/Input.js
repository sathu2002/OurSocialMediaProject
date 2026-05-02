import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, typography, borderRadius, spacing } from '../styles/theme';

const Input = ({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  error,
  helper,
  multiline = false,
  numberOfLines = 1,
  editable = true,
  style,
  inputStyle,
  labelStyle,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const containerStyle = [
    styles.container,
    style,
  ];

  const inputContainerStyle = [
    styles.inputContainer,
    isFocused && styles.inputContainerFocused,
    error && styles.inputContainerError,
    multiline && styles.inputContainerMultiline,
    !editable && styles.inputContainerDisabled,
  ];

  const inputStyleCombined = [
    styles.input,
    multiline && styles.inputMultiline,
    inputStyle,
  ];

  return (
    <View style={containerStyle}>
      {label && <Text style={[styles.label, labelStyle]}>{label}</Text>}
      <View style={inputContainerStyle}>
        <TextInput
          style={inputStyleCombined}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          multiline={multiline}
          numberOfLines={multiline ? numberOfLines : 1}
          editable={editable}
          {...props}
        />
        {secureTextEntry && (
          <TouchableOpacity
            onPress={togglePasswordVisibility}
            style={styles.visibilityToggle}
          >
            <Text style={styles.visibilityText}>
              {isPasswordVisible ? 'Hide' : 'Show'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
      {helper && !error && <Text style={styles.helperText}>{helper}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.semibold,
    color: colors.textWhite,
    marginBottom: spacing.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingHorizontal: spacing.md,
    minHeight: 48,
  },
  inputContainerFocused: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  inputContainerError: {
    borderColor: colors.error,
    borderWidth: 2,
  },
  inputContainerMultiline: {
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    alignItems: 'flex-start',
  },
  inputContainerDisabled: {
    backgroundColor: colors.gray100,
    opacity: 0.6,
  },
  input: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: typography.fontSizes.md,
    minHeight: 22,
    paddingVertical: spacing.md,
  },
  inputMultiline: {
    height: 'auto',
    textAlignVertical: 'top',
    minHeight: 80,
  },
  visibilityToggle: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  visibilityText: {
    color: colors.primary,
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.semibold,
  },
  errorText: {
    fontSize: typography.fontSizes.sm,
    color: colors.error,
    marginTop: spacing.xs,
  },
  helperText: {
    fontSize: typography.fontSizes.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
});

export default Input;
