import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { userApi, clientApi, paymentApi, feedbackApi, taskApi } from '../../api';
import { Card, Loading, EmptyState } from '../../components';
import { colors, typography, spacing, borderRadius, commonStyles } from '../../styles/theme';

const DashboardScreen = () => {
  const { user, hasRole } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    totalUsers: 0,
    totalClients: 0,
    totalRevenue: 0,
    pendingPayments: 0,
    recentFeedback: [],
    recentTasks: [],
  });
  const [error, setError] = useState('');

  const fetchDashboardData = async () => {
    try {
      setError('');
      const promises = [];

      // Get total users (Admin only)
      if (hasRole(['Admin'])) {
        promises.push(userApi.getUsers().catch(() => []));
      }

      // Get total clients (Admin, Manager)
      if (hasRole(['Admin', 'Manager'])) {
        promises.push(clientApi.getClients().catch(() => []));
      }

      // Get payment stats for revenue and pending payments (Admin, Manager)
      if (hasRole(['Admin', 'Manager'])) {
        promises.push(
          paymentApi.getPaymentStats().catch(() => ({
            totalRevenue: 0,
            pendingCount: 0,
            paidCount: 0,
            overdueCount: 0,
          }))
        );
      }

      // Get recent feedback (Admin, Manager, Client)
      if (hasRole(['Admin', 'Manager', 'Client'])) {
        if (hasRole(['Client'])) {
          promises.push(feedbackApi.getMyFeedback().catch(() => []));
        } else {
          promises.push(feedbackApi.getFeedback().catch(() => []));
        }
      }

      // Get recent tasks (All roles)
      if (hasRole(['Admin', 'Manager'])) {
        promises.push(taskApi.getTasks().catch(() => []));
      } else {
        promises.push(taskApi.getMyTasks().catch(() => []));
      }

      const results = await Promise.allSettled(promises);
      
      const newDashboardData = {
        totalUsers: 0,
        totalClients: 0,
        totalRevenue: 0,
        pendingPayments: 0,
        recentFeedback: [],
        recentTasks: [],
      };

      let resultIndex = 0;
      
      // Process users (Admin only)
      if (hasRole(['Admin'])) {
        const usersResult = results[resultIndex++];
        if (usersResult.status === 'fulfilled') {
          newDashboardData.totalUsers = (usersResult.value || []).length;
        }
      }

      // Process clients (Admin, Manager)
      if (hasRole(['Admin', 'Manager'])) {
        const clientsResult = results[resultIndex++];
        if (clientsResult.status === 'fulfilled') {
          newDashboardData.totalClients = (clientsResult.value || []).length;
        }

        const paymentResult = results[resultIndex++];
        if (paymentResult.status === 'fulfilled') {
          const paymentData = paymentResult.value || {};
          newDashboardData.totalRevenue = paymentData.totalRevenue || 0;
          newDashboardData.pendingPayments = paymentData.pendingCount || 0;
        }
      }

      // Process feedback (Admin, Manager, Client)
      if (hasRole(['Admin', 'Manager', 'Client'])) {
        const feedbackResult = results[resultIndex++];
        if (feedbackResult.status === 'fulfilled') {
          newDashboardData.recentFeedback = [...(feedbackResult.value || [])]
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5);
        }
      }

      // Process tasks (All roles)
      const taskResult = results[resultIndex++];
      if (taskResult.status === 'fulfilled') {
        newDashboardData.recentTasks = [...(taskResult.value || [])]
          .sort((a, b) => new Date(b.createdAt || b.dueDate) - new Date(a.createdAt || a.dueDate))
          .slice(0, 5);
      }

      setDashboardData(newDashboardData);
    } catch (error) {
      console.log('Dashboard error:', error);
      setError(error.message || 'Failed to load dashboard data');
    }
  };

  const loadData = async () => {
    setLoading(true);
    await fetchDashboardData();
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'Admin': return colors.primary;
      case 'Manager': return colors.warning;
      case 'Staff': return colors.info;
      case 'Client': return colors.success;
      default: return colors.gray400;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return colors.success;
      case 'In Progress': return colors.info;
      case 'Pending': return colors.warning;
      case 'Active': return colors.success;
      case 'Inactive': return colors.gray400;
      default: return colors.gray400;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount || 0);
  };

  if (loading) {
    return <Loading fullScreen message="Loading dashboard..." />;
  }

  return (
    <SafeAreaView style={commonStyles.safeArea}>
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Welcome Header */}
        <Card style={styles.welcomeCard}>
          <Text style={styles.greeting}>{getGreeting()},</Text>
          <Text style={styles.userName}>{user?.name}!</Text>
          <View style={styles.roleContainer}>
            <Text style={styles.roleLabel}>Role:</Text>
            <View style={[styles.roleBadge, { backgroundColor: getRoleColor(user?.role) }]}>
              <Text style={styles.roleText}>{user?.role}</Text>
            </View>
          </View>
        </Card>

        {error && (
          <Card style={styles.errorCard}>
            <Text style={styles.errorText}>{error}</Text>
          </Card>
        )}

        {/* Key Metrics */}
        <View style={styles.metricsGrid}>
          {/* Total Users - Admin only */}
          {hasRole(['Admin']) && (
            <Card style={styles.metricCard}>
              <View style={styles.metricHeader}>
                <Text style={styles.metricNumber}>{dashboardData.totalUsers}</Text>
                <Text style={styles.metricLabel}>Total Users</Text>
              </View>
              <View style={styles.metricIcon}>
                <Text style={styles.metricIconText}>U</Text>
              </View>
            </Card>
          )}

          {/* Total Clients - Admin, Manager */}
          {hasRole(['Admin', 'Manager']) && (
            <Card style={styles.metricCard}>
              <View style={styles.metricHeader}>
                <Text style={styles.metricNumber}>{dashboardData.totalClients}</Text>
                <Text style={styles.metricLabel}>Total Clients</Text>
              </View>
              <View style={styles.metricIcon}>
                <Text style={styles.metricIconText}>C</Text>
              </View>
            </Card>
          )}

          {/* Total Revenue - Admin, Manager */}
          {hasRole(['Admin', 'Manager']) && (
            <Card style={styles.metricCard}>
              <View style={styles.metricHeader}>
                <Text style={styles.metricNumber}>{formatCurrency(dashboardData.totalRevenue)}</Text>
                <Text style={styles.metricLabel}>Total Revenue</Text>
              </View>
              <View style={styles.metricIcon}>
                <Text style={styles.metricIconText}>$</Text>
              </View>
            </Card>
          )}

          {/* Pending Payments - Admin, Manager */}
          {hasRole(['Admin', 'Manager']) && (
            <Card style={styles.metricCard}>
              <View style={styles.metricHeader}>
                <Text style={styles.metricNumber}>{dashboardData.pendingPayments}</Text>
                <Text style={styles.metricLabel}>Pending</Text>
              </View>
              <View style={styles.metricIcon}>
                <Text style={styles.metricIconText}>P</Text>
              </View>
            </Card>
          )}
        </View>

        {/* Recent Tasks */}
        <Card style={styles.recentCard}>
          <Text style={styles.cardTitle}>
            {hasRole(['Admin', 'Manager']) ? 'Recent Tasks' : 'My Tasks'}
          </Text>
          {dashboardData.recentTasks.length === 0 ? (
            <EmptyState
              title="No tasks found"
              message="No tasks have been created yet."
              compact
            />
          ) : (
            dashboardData.recentTasks.map((task) => (
              <View key={task._id} style={styles.recentItem}>
                <View style={styles.recentItemHeader}>
                  <Text style={styles.recentItemTitle}>{task.title}</Text>
                  <Text style={[
                    styles.recentItemStatus,
                    { color: getStatusColor(task.status) }
                  ]}>
                    {task.status}
                  </Text>
                </View>
                {task.dueDate && (
                  <Text style={styles.recentItemDate}>
                    Due: {new Date(task.dueDate).toLocaleDateString()}
                  </Text>
                )}
                {task.priority && (
                  <Text style={styles.recentItemPriority}>
                    Priority: {task.priority}
                  </Text>
                )}
              </View>
            ))
          )}
        </Card>

        {/* Recent Feedback - Admin, Manager, Client */}
        {hasRole(['Admin', 'Manager', 'Client']) && (
          <Card style={styles.recentCard}>
            <Text style={styles.cardTitle}>
              {hasRole(['Client']) ? 'My Feedback' : 'Recent Feedback'}
            </Text>
            {dashboardData.recentFeedback.length === 0 ? (
              <EmptyState
                title="No feedback found"
                message="No feedback has been submitted yet."
                compact
              />
            ) : (
              dashboardData.recentFeedback.map((feedback) => (
                <View key={feedback._id} style={styles.recentItem}>
                  <View style={styles.recentItemHeader}>
                    <Text style={styles.recentItemTitle}>{feedback.campaignName}</Text>
                    <Text style={styles.recentItemRating}>
                      {'⭐'.repeat(feedback.rating || 0)}
                    </Text>
                  </View>
                  {feedback.comment && (
                    <Text style={styles.recentItemComment} numberOfLines={2}>
                      {feedback.comment}
                    </Text>
                  )}
                  <Text style={styles.recentItemDate}>
                    {new Date(feedback.createdAt).toLocaleDateString()}
                  </Text>
                </View>
              ))
            )}
          </Card>
        )}

        {/* Empty State */}
        {!loading && !error && 
         dashboardData.recentTasks.length === 0 && 
         (!hasRole(['Admin', 'Manager', 'Client']) || dashboardData.recentFeedback.length === 0) && (
          <EmptyState
            title="Welcome to SpotOn!"
            message="Your dashboard will show relevant information once you have data."
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.md,
    backgroundColor: colors.background,
  },
  welcomeCard: {
    marginBottom: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.navy,
    borderRadius: borderRadius.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  greeting: {
    fontSize: typography.fontSizes.lg,
    color: colors.gray300,
    marginBottom: spacing.xs,
  },
  userName: {
    fontSize: typography.fontSizes['2xl'],
    fontWeight: typography.fontWeights.bold,
    color: colors.textWhite,
    marginBottom: spacing.sm,
  },
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roleLabel: {
    fontSize: typography.fontSizes.md,
    color: colors.textSecondary,
    marginRight: spacing.sm,
  },
  roleBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  roleText: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.bold,
    color: colors.textWhite,
  },
  errorCard: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: colors.error,
    borderWidth: 1,
    marginBottom: spacing.md,
    borderRadius: borderRadius.lg,
  },
  errorText: {
    color: colors.error,
    fontSize: typography.fontSizes.md,
    textAlign: 'center',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  metricCard: {
    width: '48%',
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    position: 'relative',
    overflow: 'hidden',
  },
  metricHeader: {
    alignItems: 'flex-start',
  },
  metricNumber: {
    fontSize: typography.fontSizes['2xl'],
    fontWeight: typography.fontWeights.bold,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  metricLabel: {
    fontSize: typography.fontSizes.sm,
    color: colors.textSecondary,
    fontWeight: typography.fontWeights.medium,
    paddingRight: 40,
  },
  metricIcon: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  metricIconText: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.bold,
    color: colors.textWhite,
  },
  recentCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  cardTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  recentItem: {
    padding: spacing.md,
    backgroundColor: colors.gray50,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  recentItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  recentItemTitle: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.semibold,
    color: colors.textPrimary,
    flex: 1,
    marginRight: spacing.sm,
  },
  recentItemStatus: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.semibold,
  },
  recentItemDate: {
    fontSize: typography.fontSizes.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  recentItemPriority: {
    fontSize: typography.fontSizes.sm,
    color: colors.warning,
    marginTop: spacing.xs,
  },
  recentItemRating: {
    fontSize: typography.fontSizes.sm,
    color: colors.warning,
  },
  recentItemComment: {
    fontSize: typography.fontSizes.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
});

export default DashboardScreen;
