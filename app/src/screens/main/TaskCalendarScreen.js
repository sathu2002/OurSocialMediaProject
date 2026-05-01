import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { taskApi } from '../../api';
import { Card, Loading, EmptyState, Button } from '../../components';
import { colors, typography, spacing, commonStyles } from '../../styles/theme';

const TaskCalendarScreen = () => {
  const { user, hasRole } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [dayTasks, setDayTasks] = useState([]);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [error, setError] = useState('');

  const getCurrentMonth = () => {
    return selectedMonth.toISOString().slice(0, 7); // YYYY-MM format
  };

  const fetchTasks = async () => {
    try {
      setError('');
      
      let response;
      if (hasRole(['Admin', 'Manager'])) {
        response = await taskApi.getTasks();
      } else {
        response = await taskApi.getMyTasks();
      }

      // Filter tasks by selected month
      const month = getCurrentMonth();
      const filteredTasks = (response || []).filter(task => {
        if (!task.dueDate) return false;
        const taskMonth = new Date(task.dueDate).toISOString().slice(0, 7);
        return taskMonth === month;
      });

      setTasks(filteredTasks);
    } catch (error) {
      console.log('Task Calendar error:', error);
      setError(error.message || 'Failed to load tasks');
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

  const changeMonth = (direction) => {
    const newMonth = new Date(selectedMonth);
    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setSelectedMonth(newMonth);
  };

  useEffect(() => {
    fetchTasks();
  }, [selectedMonth]);

  const getMonthName = (date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return colors.success;
      case 'In Progress': return colors.info;
      case 'Pending': return colors.warning;
      case 'Cancelled': return colors.error;
      default: return colors.gray400;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Urgent': return colors.error;
      case 'High': return colors.warning;
      case 'Medium': return colors.info;
      case 'Low': return colors.gray400;
      default: return colors.gray400;
    }
  };

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getTasksForDay = (day) => {
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate);
      return (
        taskDate.getDate() === day &&
        taskDate.getMonth() === selectedMonth.getMonth() &&
        taskDate.getFullYear() === selectedMonth.getFullYear()
      );
    });
  };

  const handleDatePress = (day) => {
    const tasksForDay = getTasksForDay(day);
    if (tasksForDay.length > 0) {
      setSelectedDate(day);
      setDayTasks(tasksForDay);
      setDetailsModalVisible(true);
    }
  };

  const closeDetailsModal = () => {
    setDetailsModalVisible(false);
    setSelectedDate(null);
    setDayTasks([]);
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      const result = await taskApi.updateTask(taskId, { status: newStatus });
      if (result.success || result.data) {
        await fetchTasks();
        // Update dayTasks if modal is open
        if (detailsModalVisible && selectedDate) {
          const updatedTasks = getTasksForDay(selectedDate);
          setDayTasks(updatedTasks);
        }
      } else {
        Alert.alert('Error', result.error || 'Failed to update task status');
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to update task status');
    }
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(selectedMonth);
    const firstDay = getFirstDayOfMonth(selectedMonth);
    const days = [];

    // Day headers
    const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const headerRow = (
      <View style={styles.calendarHeader}>
        {dayHeaders.map((day, index) => (
          <Text key={index} style={styles.dayHeaderText}>
            {day}
          </Text>
        ))}
      </View>
    );

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(<View key={`empty-${i}`} style={styles.emptyDay} />);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayTasks = getTasksForDay(day);
      const hasTask = dayTasks.length > 0;
      const hasUrgentTask = dayTasks.some(task => task.priority === 'Urgent');

      days.push(
        <TouchableOpacity
          key={day}
          style={[
            styles.dayCell,
            hasTask && styles.dayWithTask,
            hasUrgentTask && styles.dayWithUrgentTask
          ]}
          onPress={() => handleDatePress(day)}
        >
          <Text style={styles.dayText}>{day}</Text>
          {hasTask && (
            <View style={styles.taskIndicator} />
          )}
        </TouchableOpacity>
      );
    }

    return (
      <View style={styles.calendar}>
        {headerRow}
        <View style={styles.calendarGrid}>
          {days}
        </View>
      </View>
    );
  };

  const renderTaskList = () => {
    const sortedTasks = [...tasks].sort((a, b) => {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate) - new Date(b.dueDate);
    });

    return (
      <Card style={styles.taskListCard}>
        <Text style={styles.cardTitle}>Tasks this Month</Text>
        {sortedTasks.length === 0 ? (
          <EmptyState
            title="No tasks this month"
            message="No tasks scheduled for this month."
          />
        ) : (
          sortedTasks.map((task) => (
            <View key={task._id} style={styles.taskItem}>
              <View style={styles.taskHeader}>
                <Text style={styles.taskTitle}>{task.title}</Text>
                <View style={styles.taskBadges}>
                  <Text style={[
                    styles.statusText,
                    { color: getStatusColor(task.status) }
                  ]}>
                    {task.status}
                  </Text>
                  <Text style={[
                    styles.priorityText,
                    { color: getPriorityColor(task.priority) }
                  ]}>
                    {task.priority}
                  </Text>
                </View>
              </View>
              {task.description && (
                <Text style={styles.taskDescription} numberOfLines={2}>
                  {task.description}
                </Text>
              )}
              {task.dueDate && (
                <Text style={styles.taskDate}>
                  Due: {new Date(task.dueDate).toLocaleDateString()}
                </Text>
              )}
              {task.assignedTo && (
                <Text style={styles.taskAssignee}>
                  Assigned to: {typeof task.assignedTo === 'object' 
                    ? task.assignedTo.name 
                    : task.assignedTo}
                </Text>
              )}
            </View>
          ))
        )}
      </Card>
    );
  };

  if (loading) {
    return <Loading fullScreen message="Loading calendar..." />;
  }

  return (
    <SafeAreaView style={commonStyles.safeArea}>
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Month Navigation */}
        <Card style={styles.monthNavigation}>
          <TouchableOpacity
            style={styles.monthButton}
            onPress={() => changeMonth('prev')}
          >
            <Text style={styles.monthButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.monthText}>
            {getMonthName(selectedMonth)}
          </Text>
          <TouchableOpacity
            style={styles.monthButton}
            onPress={() => changeMonth('next')}
          >
            <Text style={styles.monthButtonText}>→</Text>
          </TouchableOpacity>
        </Card>

        {error && (
          <Card style={styles.errorCard}>
            <Text style={styles.errorText}>{error}</Text>
          </Card>
        )}

        {/* Calendar View */}
        <Card style={styles.calendarCard}>
          <Text style={styles.cardTitle}>Task Calendar</Text>
          {renderCalendar()}
        </Card>

        {/* Task List */}
        {renderTaskList()}

        {/* Legend */}
        <Card style={styles.legendCard}>
          <Text style={styles.cardTitle}>Legend</Text>
          <View style={styles.legendGrid}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.success }]} />
              <Text style={styles.legendText}>Completed</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.warning }]} />
              <Text style={styles.legendText}>Pending</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.info }]} />
              <Text style={styles.legendText}>In Progress</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.error }]} />
              <Text style={styles.legendText}>Urgent</Text>
            </View>
          </View>
        </Card>

        {/* Task Details Modal */}
        <Modal
          visible={detailsModalVisible}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={closeDetailsModal}
        >
          <SafeAreaView style={commonStyles.safeArea}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  Tasks for {selectedMonth.getMonth() + 1}/{selectedDate}
                </Text>
                <TouchableOpacity onPress={closeDetailsModal}>
                  <Text style={styles.modalClose}>×</Text>
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalContent}>
                {dayTasks.length === 0 ? (
                  <View style={styles.noTasksContainer}>
                    <Text style={styles.noTasksText}>No tasks for this day</Text>
                  </View>
                ) : (
                  dayTasks.map((task) => (
                    <Card key={task._id} style={styles.taskDetailCard}>
                      <View style={styles.taskDetailHeader}>
                        <Text style={styles.taskDetailTitle}>{task.title}</Text>
                        <View style={styles.taskDetailBadges}>
                          <Text style={[
                            styles.statusText,
                            { color: getStatusColor(task.status) }
                          ]}>
                            {task.status}
                          </Text>
                          <Text style={[
                            styles.priorityText,
                            { color: getPriorityColor(task.priority) }
                          ]}>
                            {task.priority}
                          </Text>
                        </View>
                      </View>
                      {task.description && (
                        <Text style={styles.taskDetailDescription}>
                          {task.description}
                        </Text>
                      )}
                      {task.client && (
                        <Text style={styles.taskDetailClient}>
                          Client: {typeof task.client === 'object' ? task.client.name : task.client}
                        </Text>
                      )}
                      {task.assignedTo && (
                        <Text style={styles.taskDetailAssignee}>
                          Assigned to: {typeof task.assignedTo === 'object' 
                            ? task.assignedTo.name 
                            : task.assignedTo}
                        </Text>
                      )}
                      {task.status !== 'Completed' && (
                        <View style={styles.taskDetailActions}>
                          <TouchableOpacity
                            style={[styles.statusButton, { backgroundColor: colors.info }]}
                            onPress={() => updateTaskStatus(task._id, 'In Progress')}
                          >
                            <Text style={styles.statusButtonText}>Start</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.statusButton, { backgroundColor: colors.success }]}
                            onPress={() => updateTaskStatus(task._id, 'Completed')}
                          >
                            <Text style={styles.statusButtonText}>Complete</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </Card>
                  ))
                )}
              </ScrollView>
            </View>
          </SafeAreaView>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.md,
  },
  monthNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  monthButton: {
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.primary,
  },
  monthButtonText: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    color: colors.white,
  },
  monthText: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
    color: colors.white,
  },
  errorCard: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: colors.error,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  errorText: {
    color: colors.error,
    fontSize: typography.fontSizes.md,
  },
  calendarCard: {
    marginBottom: spacing.md,
  },
  cardTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
    color: colors.white,
    marginBottom: spacing.md,
  },
  calendar: {
    padding: spacing.md,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  dayHeaderText: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.semibold,
    color: colors.gray300,
    flex: 1,
    textAlign: 'center',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  emptyDay: {
    width: '14.28%',
    height: 40,
  },
  dayCell: {
    width: '14.28%',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: borderRadius.sm,
    marginVertical: 1,
  },
  dayWithTask: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
  },
  dayWithUrgentTask: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  dayText: {
    fontSize: typography.fontSizes.sm,
    color: colors.white,
  },
  taskIndicator: {
    position: 'absolute',
    bottom: 2,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primary,
  },
  taskListCard: {
    marginBottom: spacing.md,
  },
  taskItem: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray700,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  taskTitle: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.semibold,
    color: colors.white,
    flex: 1,
    marginRight: spacing.sm,
  },
  taskBadges: {
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  statusText: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.semibold,
  },
  priorityText: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.semibold,
  },
  taskDescription: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray300,
    marginBottom: spacing.xs,
  },
  taskDate: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray400,
    marginBottom: spacing.xs,
  },
  taskAssignee: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray400,
  },
  legendCard: {
    marginBottom: spacing.md,
  },
  legendGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
    marginBottom: spacing.sm,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: spacing.sm,
  },
  legendText: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray300,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.navyLight,
  },
  modalTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
    color: colors.white,
  },
  modalClose: {
    fontSize: typography.fontSizes['2xl'],
    color: colors.gray400,
    padding: spacing.xs,
  },
  modalContent: {
    flex: 1,
    padding: spacing.md,
  },
  noTasksContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  noTasksText: {
    fontSize: typography.fontSizes.md,
    color: colors.gray400,
  },
  taskDetailCard: {
    backgroundColor: colors.navyLight,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  taskDetailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  taskDetailTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
    color: colors.white,
    flex: 1,
    marginRight: spacing.sm,
  },
  taskDetailBadges: {
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  taskDetailDescription: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray300,
    marginBottom: spacing.sm,
  },
  taskDetailClient: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray400,
    marginBottom: spacing.xs,
  },
  taskDetailAssignee: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray400,
    marginBottom: spacing.sm,
  },
  taskDetailActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  statusButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
  },
  statusButtonText: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.semibold,
    color: colors.white,
  },
});

export default TaskCalendarScreen;
