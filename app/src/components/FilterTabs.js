import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { colors, typography, spacing, borderRadius } from '../styles/theme';

const FilterTabs = ({
  options,
  selectedOption,
  onSelect,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      {options.map((option) => (
        <TouchableOpacity
          key={option.value}
          style={[
            styles.tab,
            selectedOption === option.value && styles.selectedTab,
          ]}
          onPress={() => onSelect(option.value)}
        >
          <Text style={[
            styles.tabText,
            selectedOption === option.value && styles.selectedTabText,
          ]}>
            {option.label}
          </Text>
          {option.count !== undefined && (
            <Text style={[
              styles.countText,
              selectedOption === option.value && styles.selectedCountText,
            ]}>
              ({option.count})
            </Text>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.navyLight,
    borderRadius: borderRadius.md,
    padding: spacing.xs,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 40,
  },
  selectedTab: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.semibold,
    color: colors.gray300,
    textAlign: 'center',
  },
  selectedTabText: {
    color: colors.white,
  },
  countText: {
    fontSize: typography.fontSizes.xs,
    color: colors.gray400,
    marginLeft: spacing.xs,
  },
  selectedCountText: {
    color: colors.white,
  },
});

export default FilterTabs;
