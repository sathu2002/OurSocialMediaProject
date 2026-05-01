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
import { analyticsApi, taskApi } from '../../api';
import { Card, Button, Loading, EmptyState } from '../../components';
import { colors, typography, spacing, commonStyles } from '../../styles/theme';

const HomeScreen = () => {
  const { user, hasRole } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalClients: 0,
    totalTasks: 0,
    pendingTasks: 0,
    totalPayments: 0,
    pendingPayments: 0,
  });
  const [recentTasks, setRecentTasks] = useState([]);
  const [error, setError] = useState('');

  const fetchDashboardData = async () => {
    try {
      setError('');
      const newStats = { ...stats };
      const tasks = [];

      // Fetch data based on role
      if (hasRole(['Admin', 'Manager'])) {
        // Analytics summary
        try {
          const analyticsRes = await analyticsApi.getAnalyticsSummary();
          if (analyticsRes.data) {
            newStats.totalClients = analyticsRes.data.totalClients || 0;
            newStats.totalTasks = analyticsRes.data.totalTasks || 0;
            newStats.pendingTasks = analyticsRes.data.pendingTasks || 0;
            newStats.totalPayments = analyticsRes.data.totalPayments || 0;
            newStats.pendingPayments = analyticsRes.data.pendingPayments || 0;
          }
        } catch (e) {
          console.log('Analytics error:', e);
        }

        // Recent tasks
        try {
          const tasksRes = await taskApi.getTasks();
          if (tasksRes.data) {
            tasks.push(...tasksRes.data.slice(0, 5));
          }
        } catch (e) {
          console.log('Tasks error:', e);
        }
      } else if (hasRole(['Staff'])) {
        // Staff sees their own tasks
        try {
          const tasksRes = await taskApi.getMyTasks();
          if (tasksRes.data) {
            tasks.push(...tasksRes.data.slice(0, 5));
            newStats.totalTasks = tasksRes.data.length;
            newStats.pendingTasks = tasksRes.data.filter(t => t.status !== 'Completed').length;
          }
        } catch (e) {
          console.log('Tasks error:', e);
        }
      }

      setStats(newStats);
      setRecentTasks(tasks);
    } catch (error) {
      console.log('Dashboard error:', error);
      setError('Failed to load dashboard data');
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

  if (loading) {
    return <Loading fullScreen message="Loading dashboard..." />;
  }

  const getRoleWelcome = () => {
    switch (user?.role) {
      case 'Admin':
        return 'Admin Dashboard';
      case 'Manager':
        return 'Manager Dashboard';
      case 'Staff':
        return 'Staff Dashboard';
      case 'Client':
        return 'Welcome to Your Dashboard';
      default:
        return 'Dashboard';
    }
  };

  const renderStatsCards = () => {
    if (hasRole(['Admin', 'Manager'])) {
      return (
        <View style={styles.statsGrid}>
          <Card style={styles.statCard} padding>
            <Text style={styles.statValue}>{stats.totalClients}</Text>
            <Text style={styles.statLabel}>Total Clients</Text>
          </Card>
          <Card style={styles.statCard} padding>
            <Text style={styles.statValue}>{stats.totalTasks}</Text>
            <Text style={styles.statLabel}>Total Tasks</Text>
          </Card>
          <Card style={styles.statCard} padding>
            <Text style={styles.statValue}>{stats.pendingTasks}</Text>
            <Text style={styles.statLabel}>Pending Tasks</Text>
          </Card>
          <Card style={styles.statCard} padding>
            <Text style={styles.statValue}>{stats.pendingPayments}</Text>
            <Text style={styles.statLabel}>Pending Payments</Text>
          </Card>
        </View>
      );
    } else if (hasRole(['Staff'])) {
      return (
        <View style={styles.statsGrid}>
          <Card style={styles.statCard} padding>
            <Text style={styles.statValue}>{stats.totalTasks}</Text>
            <Text style={styles.statLabel}>My Tasks</Text>
          </Card>
          <Card style={styles.statCard} padding>
            <Text style={styles.statValue}>{stats.pendingTasks}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </Card>
        </View>
      );
    }
    return null;
  };

  return (
    <SafeAreaView style={commonStyles.safeArea}>
      <ScrollView
        style={commonStyles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.greeting}>Hello, {user?.name || 'User'}</Text>
          <Text style={styles.welcome}>{getRoleWelcome()}</Text>
          <Text style={styles.role}>Role: {user?.role}</Text>
        </View>

        {renderStatsCards()}

        {recentTasks.length > 0 && (
          <Card title="Recent Tasks">
            {recentTasks.map((task, index) => (
              <View key={task._id || index} style={styles.taskItem}>
                <View style={styles.taskHeader}>
                  <Text style={styles.taskTitle} numberOfLines={1}>
                    {task.title}
                  </Text>
                  <View style={[styles.statusBadge, { 
                    backgroundColor: task.status === 'Completed' ? colors.success + '30' : 
                                     task.status === 'In Progress' ? colors.warning + '30' : 
                                     colors.info + '30'
                  }]}>
                    <Text style={[styles.statusText, {
                      color: task.status === 'Completed' ? colors.success : 
                             task.status === 'In Progress' ? colors.warning : 
                             colors.info
                    }]}>
                      {task.status}
                    </Text>
                  </View>
                </View>
                {task.description && (
                  <Text style={styles.taskDescription} numberOfLines={2}>
                    {task.description}
                  </Text>
                )}
              </View>
            ))}
          </Card>
        )}

        {hasRole(['Client']) && (
          <Card title="Quick Actions">
            <View style={styles.quickActions}>
              <Button
                title="Submit Feedback"
                onPress={() => {}}
                variant="outline"
                style={styles.actionButton}
              />
              <Button
                title="View My Tasks"
                onPress={() => {}}
                variant="outline"
                style={styles.actionButton}
              />
            </View>
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    marginBottom: spacing.lg,
  },
  greeting: {
    fontSize: typography.fontSizes.xl,
    color: colors.gray400,
    marginBottom: spacing.xs,
  },
  welcome: {
    fontSize: typography.fontSizes['2xl'],
    fontWeight: typography.fontWeights.bold,
    color: colors.white,
    marginBottom: spacing.xs,
  },
  role: {
    fontSize: typography.fontSizes.sm,
    color: colors.primary,
    fontWeight: typography.fontWeights.medium,
  },
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
    fontSize: typography.fontSizes['3xl'],
    fontWeight: typography.fontWeights.bold,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray400,
  },
  taskItem: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray700,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  taskTitle: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.medium,
    color: colors.white,
    flex: 1,
    marginRight: spacing.sm,
  },
  taskDescription: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray400,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.medium,
  },
  quickActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  actionButton: {
    flex: 1,
  },
});

export default HomeScreen;
