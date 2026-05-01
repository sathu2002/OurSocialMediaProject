import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { taskApi } from '../../api';
import { Card, Button, Loading, EmptyState } from '../../components';
import { colors, typography, spacing, commonStyles } from '../../styles/theme';

const TasksScreen = () => {
  const { hasRole } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  const fetchTasks = async () => {
    try {
      setError('');
      let response;
      
      if (hasRole(['Staff'])) {
        response = await taskApi.getMyTasks();
      } else {
        response = await taskApi.getTasks();
      }
      
      setTasks(response.data || []);
    } catch (error) {
      console.log('Fetch tasks error:', error);
      setError(error.response?.data?.message || 'Failed to load tasks');
    }
  };

  const loadData = async () => {
    setLoading(true);
    await fetchTasks();
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTasks();
    setRefreshing(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const getFilteredTasks = () => {
    if (filter === 'all') return tasks;
    return tasks.filter(task => task.status.toLowerCase() === filter.toLowerCase());
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High':
        return colors.error;
      case 'Medium':
        return colors.warning;
      case 'Low':
        return colors.success;
      default:
        return colors.gray400;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return colors.success;
      case 'In Progress':
        return colors.info;
      case 'Pending':
      default:
        return colors.warning;
    }
  };

  const renderTask = ({ item }) => (
    <Card style={styles.taskCard}>
      <View style={styles.taskHeader}>
        <Text style={styles.taskTitle}>{item.title}</Text>
        <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(item.priority) + '30' }]}>
          <Text style={[styles.priorityText, { color: getPriorityColor(item.priority) }]}>
            {item.priority}
          </Text>
        </View>
      </View>

      {item.description && (
        <Text style={styles.taskDescription} numberOfLines={2}>
          {item.description}
        </Text>
      )}

      <View style={styles.taskFooter}>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '30' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {item.status}
          </Text>
        </View>
        
        {item.dueDate && (
          <Text style={styles.dueDate}>
            Due: {new Date(item.dueDate).toLocaleDateString()}
          </Text>
        )}
      </View>
    </Card>
  );

  const filters = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'in progress', label: 'In Progress' },
    { key: 'completed', label: 'Completed' },
  ];

  const filteredTasks = getFilteredTasks();

  if (loading) {
    return <Loading fullScreen message="Loading tasks..." />;
  }

  return (
    <SafeAreaView style={commonStyles.safeArea}>
      <View style={commonStyles.content}>
        <Text style={commonStyles.title}>Tasks</Text>

        {/* Filter Buttons */}
        <View style={styles.filterContainer}>
          {filters.map((f) => (
            <Button
              key={f.key}
              title={f.label}
              onPress={() => setFilter(f.key)}
              variant={filter === f.key ? 'primary' : 'outline'}
              size="sm"
              style={styles.filterButton}
            />
          ))}
        </View>

        {error && tasks.length === 0 ? (
          <EmptyState
            title="Error Loading Tasks"
            message={error}
            actionLabel="Retry"
            onAction={loadData}
          />
        ) : filteredTasks.length === 0 ? (
          <EmptyState
            title="No Tasks"
            message={filter === 'all' ? "No tasks found." : `No ${filter} tasks found.`}
          />
        ) : (
          <FlatList
            data={filteredTasks}
            renderItem={renderTask}
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
  filterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  filterButton: {
    minWidth: 80,
  },
  taskCard: {
    marginBottom: spacing.md,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  taskTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    color: colors.white,
    flex: 1,
    marginRight: spacing.sm,
  },
  priorityBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.semibold,
  },
  taskDescription: {
    fontSize: typography.fontSizes.md,
    color: colors.gray400,
    marginBottom: spacing.md,
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  dueDate: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray400,
  },
  listContent: {
    paddingBottom: spacing.lg,
  },
});

export default TasksScreen;
