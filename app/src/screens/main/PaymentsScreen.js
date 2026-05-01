import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { paymentApi } from '../../api';
import { Card, Button, Loading, EmptyState } from '../../components';
import { colors, typography, spacing, commonStyles } from '../../styles/theme';

const PaymentsScreen = () => {
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const fetchPayments = async () => {
    try {
      setError('');

      // Fetch payments
      try {
        const paymentsRes = await paymentApi.getPayments();
        setPayments(paymentsRes.data || []);
      } catch (e) {
        console.log('Payments error:', e);
      }

      // Fetch stats
      try {
        const statsRes = await paymentApi.getPaymentStats();
        setStats(statsRes.data);
      } catch (e) {
        console.log('Stats error:', e);
      }
    } catch (error) {
      console.log('Fetch payments error:', error);
      setError(error.response?.data?.message || 'Failed to load payments');
    }
  };

  const loadData = async () => {
    setLoading(true);
    await fetchPayments();
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPayments();
    setRefreshing(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Paid':
        return colors.success;
      case 'Pending':
        return colors.warning;
      case 'Overdue':
        return colors.error;
      default:
        return colors.gray400;
    }
  };

  const formatCurrency = (amount, currency = 'USD') => {
    return `${currency} ${(amount || 0).toLocaleString()}`;
  };

  const renderPayment = ({ item }) => (
    <Card style={styles.paymentCard}>
      <View style={styles.paymentHeader}>
        <View>
          <Text style={styles.paymentAmount}>
            {formatCurrency(item.amount, item.currency)}
          </Text>
          {item.invoiceNumber && (
            <Text style={styles.invoiceNumber}>Invoice: {item.invoiceNumber}</Text>
          )}
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '30' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {item.status}
          </Text>
        </View>
      </View>

      {item.package && (
        <Text style={styles.packageText}>Package: {item.package}</Text>
      )}

      {item.method && (
        <Text style={styles.methodText}>Method: {item.method}</Text>
      )}

      {item.clientId?.name && (
        <Text style={styles.clientText}>Client: {item.clientId.name}</Text>
      )}

      {item.note && (
        <Text style={styles.noteText} numberOfLines={2}>{item.note}</Text>
      )}

      {item.paidAt && (
        <Text style={styles.paidDate}>
          Paid on: {new Date(item.paidAt).toLocaleDateString()}
        </Text>
      )}
    </Card>
  );

  if (loading) {
    return <Loading fullScreen message="Loading payments..." />;
  }

  return (
    <SafeAreaView style={commonStyles.safeArea}>
      <View style={commonStyles.content}>
        <Text style={commonStyles.title}>Payments</Text>

        {/* Stats */}
        {stats && (
          <View style={styles.statsGrid}>
            <Card style={styles.statCard} padding>
              <Text style={styles.statValue}>{formatCurrency(stats.totalRevenue)}</Text>
              <Text style={styles.statLabel}>Total Revenue</Text>
            </Card>
            <Card style={styles.statCard} padding>
              <Text style={styles.statValue}>{stats.totalPayments || 0}</Text>
              <Text style={styles.statLabel}>Total Payments</Text>
            </Card>
            <Card style={styles.statCard} padding>
              <Text style={styles.statValue}>{stats.pendingPayments || 0}</Text>
              <Text style={styles.statLabel}>Pending</Text>
            </Card>
            <Card style={styles.statCard} padding>
              <Text style={styles.statValue}>{formatCurrency(stats.pendingAmount)}</Text>
              <Text style={styles.statLabel}>Pending Amount</Text>
            </Card>
          </View>
        )}

        {error && payments.length === 0 ? (
          <EmptyState
            title="Error Loading Payments"
            message={error}
            actionLabel="Retry"
            onAction={loadData}
          />
        ) : payments.length === 0 ? (
          <EmptyState
            title="No Payments"
            message="No payment records found."
          />
        ) : (
          <FlatList
            data={payments}
            renderItem={renderPayment}
            keyExtractor={(item) => item._id}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            contentContainerStyle={styles.listContent}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.xs,
    marginBottom: spacing.md,
  },
  statCard: {
    width: '50%',
    padding: spacing.xs,
    backgroundColor: 'transparent',
    shadowColor: 'transparent',
    elevation: 0,
  },
  statValue: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray400,
  },
  paymentCard: {
    marginBottom: spacing.md,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  paymentAmount: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.bold,
    color: colors.white,
  },
  invoiceNumber: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray400,
    marginTop: spacing.xs,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.semibold,
  },
  packageText: {
    fontSize: typography.fontSizes.md,
    color: colors.gray300,
    marginBottom: spacing.xs,
  },
  methodText: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray400,
    marginBottom: spacing.xs,
  },
  clientText: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray400,
    marginBottom: spacing.xs,
  },
  noteText: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray500,
    fontStyle: 'italic',
    marginBottom: spacing.xs,
  },
  paidDate: {
    fontSize: typography.fontSizes.sm,
    color: colors.success,
  },
  listContent: {
    paddingBottom: spacing.lg,
  },
});

export default PaymentsScreen;
