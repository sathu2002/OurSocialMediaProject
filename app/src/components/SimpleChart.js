import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { colors, typography, spacing, borderRadius } from '../styles/theme';

const SimpleChart = ({
  title,
  data,
  type = 'bar',
  color = colors.primary,
  height = 200,
}) => {
  if (!data || data.length === 0) {
    return (
      <View style={[styles.container, { height }]}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No data available</Text>
        </View>
      </View>
    );
  }

  const maxValue = Math.max(...data.map(item => item.value));
  const normalizedData = data.map(item => ({
    ...item,
    percentage: maxValue > 0 ? (item.value / maxValue) * 100 : 0,
  }));

  const renderBarChart = () => (
    <View style={styles.chartContainer}>
      {normalizedData.map((item, index) => (
        <View key={index} style={styles.barContainer}>
          <View style={styles.barInfo}>
            <Text style={styles.barLabel}>{item.label}</Text>
            <Text style={styles.barValue}>{item.value}</Text>
          </View>
          <View style={styles.barBackground}>
            <View
              style={[
                styles.barFill,
                {
                  width: `${item.percentage}%`,
                  backgroundColor: color,
                },
              ]}
            />
          </View>
        </View>
      ))}
    </View>
  );

  const renderLineChart = () => (
    <View style={styles.chartContainer}>
      <View style={styles.lineChartContainer}>
        {normalizedData.map((item, index) => (
          <View key={index} style={styles.linePointContainer}>
            <View
              style={[
                styles.linePoint,
                {
                  backgroundColor: color,
                  height: `${item.percentage}%`,
                },
              ]}
            />
            <Text style={styles.lineLabel}>{item.label}</Text>
            <Text style={styles.lineValue}>{item.value}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderPieChart = () => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    let accumulatedPercentage = 0;

    return (
      <View style={styles.chartContainer}>
        <View style={styles.pieChartContainer}>
          <View style={styles.pieChart}>
            {data.map((item, index) => {
              const percentage = total > 0 ? (item.value / total) * 100 : 0;
              const startAngle = accumulatedPercentage * 3.6; // Convert to degrees
              const endAngle = (accumulatedPercentage + percentage) * 3.6;
              accumulatedPercentage += percentage;

              // Simple pie representation using stacked bars
              return (
                <View key={index} style={styles.pieSegment}>
                  <View style={styles.pieSegmentInfo}>
                    <Text style={styles.pieLabel}>{item.label}</Text>
                    <Text style={styles.pieValue}>{item.value} ({percentage.toFixed(1)}%)</Text>
                  </View>
                  <View style={styles.pieBar}>
                    <View
                      style={[
                        styles.pieBarFill,
                        {
                          width: `${percentage}%`,
                          backgroundColor: color,
                        },
                      ]}
                    />
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { height }]}>
      <Text style={styles.title}>{title}</Text>
      {type === 'bar' && renderBarChart()}
      {type === 'line' && renderLineChart()}
      {type === 'pie' && renderPieChart()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.navy,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.navyLight,
  },
  title: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
    color: colors.white,
    marginBottom: spacing.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: typography.fontSizes.md,
    color: colors.gray400,
  },
  chartContainer: {
    flex: 1,
  },
  // Bar Chart Styles
  barContainer: {
    marginBottom: spacing.sm,
  },
  barInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  barLabel: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray300,
  },
  barValue: {
    fontSize: typography.fontSizes.sm,
    color: colors.white,
    fontWeight: typography.fontWeights.semibold,
  },
  barBackground: {
    height: 20,
    backgroundColor: colors.navyLight,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: borderRadius.sm,
  },
  // Line Chart Styles
  lineChartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
    paddingHorizontal: spacing.xs,
  },
  linePointContainer: {
    alignItems: 'center',
    flex: 1,
  },
  linePoint: {
    width: 20,
    borderRadius: 10,
    marginBottom: spacing.xs,
  },
  lineLabel: {
    fontSize: typography.fontSizes.xs,
    color: colors.gray300,
    textAlign: 'center',
  },
  lineValue: {
    fontSize: typography.fontSizes.xs,
    color: colors.white,
    textAlign: 'center',
  },
  // Pie Chart Styles
  pieChartContainer: {
    flex: 1,
  },
  pieChart: {
    flex: 1,
  },
  pieSegment: {
    marginBottom: spacing.sm,
  },
  pieSegmentInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  pieLabel: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray300,
  },
  pieValue: {
    fontSize: typography.fontSizes.sm,
    color: colors.white,
    fontWeight: typography.fontWeights.semibold,
  },
  pieBar: {
    height: 16,
    backgroundColor: colors.navyLight,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
  },
  pieBarFill: {
    height: '100%',
    borderRadius: borderRadius.sm,
  },
});

export default SimpleChart;
