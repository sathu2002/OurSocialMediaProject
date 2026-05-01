import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { analyticsApi } from '../../api';
import { Card, Button, Loading, EmptyState } from '../../components';
import { colors, typography, spacing, commonStyles } from '../../styles/theme';

const AnalyticsScreen = () => {
  const [analytics, setAnalytics] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const fetchAnalytics = async () => {
    try {
      setError('');
      
      // Fetch summary
      try {
        const summaryRes = await analyticsApi.getAnalyticsSummary();
        setSummary(summaryRes.data);
      } catch (e) {
        console.log('Summary error:', e);
      }

      // Fetch all analytics
      try {
        const analyticsRes = await analyticsApi.getAnalytics();
        setAnalytics(analyticsRes.data || []);
      } catch (e) {
        console.log('Analytics error:', e);
      }
    } catch (error) {
      console.log('Fetch analytics error:', error);
      setError(error.response?.data?.message || 'Failed to load analytics');
    }
  };

  const loadData = async () => {
    setLoading(true);
    await fetchAnalytics();
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAnalytics();
    setRefreshing(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const formatCurrency = (amount) => {
    return `$${(amount || 0).toLocaleString()}`;
  };

  if (loading) {
    return <Loading fullScreen message="Loading analytics..." />;
  }

  return (
    <SafeAreaView style={commonStyles.safeArea}>
      <ScrollView
        style={commonStyles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Text style={commonStyles.title}>Analytics</Text>

        {error && (
          <EmptyState
            title="Error"
            message={error}
            actionLabel="Retry"
            onAction={loadData}
          />
        )}

        {/* Summary Cards */}
        {summary && (
          <View style={styles.summaryGrid}>
            <Card style={styles.summaryCard} padding>
              <Text style={styles.summaryValue}>{summary.totalClients || 0}</Text>
              <Text style={styles.summaryLabel}>Total Clients</Text>
            </Card>
            <Card style={styles.summaryCard} padding>
              <Text style={styles.summaryValue}>{summary.totalTasks || 0}</Text>
              <Text style={styles.summaryLabel}>Total Tasks</Text>
            </Card>
            <Card style={styles.summaryCard} padding>
              <Text style={styles.summaryValue}>{summary.totalPayments || 0}</Text>
              <Text style={styles.summaryLabel}>Total Payments</Text>
            </Card>
            <Card style={styles.summaryCard} padding>
              <Text style={styles.summaryValue}>{formatCurrency(summary.totalRevenue)}</Text>
              <Text style={styles.summaryLabel}>Total Revenue</Text>
            </Card>
          </View>
        )}

        {/* Analytics List */}
        {analytics.length > 0 && (
          <Card title="Performance Metrics">
            {analytics.map((item, index) => (
              <View key={item._id || index} style={styles.analyticsItem}>
                <View style={styles.analyticsRow}>
                  <Text style={styles.analyticsLabel}>{item.metric || 'Metric'}</Text>
                  <Text style={styles.analyticsValue}>{item.value || 0}</Text>
                </View>
                {item.clientId?.name && (
                  <Text style={styles.analyticsClient}>
                    Client: {item.clientId.name}
                  </Text>
                )}
              </View>
            ))}
          </Card>
        )}

        {analytics.length === 0 && !summary && !error && (
          <EmptyState
            title="No Analytics Data"
            message="No analytics data available yet."
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.xs,
    marginBottom: spacing.md,
  },
  summaryCard: {
    width: '50%',
    padding: spacing.xs,
    backgroundColor: 'transparent',
    shadowColor: 'transparent',
    elevation: 0,
  },
  summaryValue: {
    fontSize: typography.fontSizes['2xl'],
    fontWeight: typography.fontWeights.bold,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  summaryLabel: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray400,
  },
  analyticsItem: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray700,
  },
  analyticsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  analyticsLabel: {
    fontSize: typography.fontSizes.md,
    color: colors.gray300,
  },
  analyticsValue: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.bold,
    color: colors.white,
  },
  analyticsClient: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray500,
    marginTop: spacing.xs,
  },
});

export default AnalyticsScreen;
