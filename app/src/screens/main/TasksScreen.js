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
  TextInput,
  DatePickerIOS,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { taskApi, clientApi } from '../../api';
import { Card, Button, Input, Loading, EmptyState } from '../../components';
import { colors, typography, spacing, commonStyles } from '../../styles/theme';

const TasksScreen = () => {
  const { user, hasRole } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [clients, setClients] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [error, setError] = useState('');

  // Modal states
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    client: '',
    assignedTo: '',
    dueDate: new Date(),
    priority: 'Medium',
    status: 'Pending',
  });

  const fetchTasks = async () => {
    try {
      setError('');
      const response = hasRole(['Admin', 'Manager']) 
        ? await taskApi.getTasks()
        : await taskApi.getMyTasks();
      setTasks(response || []);
      setFilteredTasks(response || []);
    } catch (error) {
      console.log('Tasks error:', error);
      setError(error.message || 'Failed to load tasks');
    }
  };

  const fetchClients = async () => {
    try {
      if (hasRole(['Admin', 'Manager'])) {
        const response = await clientApi.getClients();
        setClients(response || []);
      }
    } catch (error) {
      console.log('Clients error:', error);
    }
  };

  const loadData = async () => {
    setLoading(true);
    await Promise.all([fetchTasks(), fetchClients()]);
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchTasks(), fetchClients()]);
    setRefreshing(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterTasks();
  }, [tasks, searchText, statusFilter, priorityFilter]);

  const filterTasks = () => {
    let filtered = [...tasks];

    // Search filter
    if (searchText) {
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchText.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(searchText.toLowerCase()))
      );
    }

    // Status filter
    if (statusFilter !== 'All') {
      filtered = filtered.filter(task => task.status === statusFilter);
    }

    // Priority filter
    if (priorityFilter !== 'All') {
      filtered = filtered.filter(task => task.priority === priorityFilter);
    }

    setFilteredTasks(filtered);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      client: '',
      assignedTo: '',
      dueDate: new Date(),
      priority: 'Medium',
      status: 'Pending',
    });
    setError('');
  };

  const openAddModal = () => {
    resetForm();
    setAddModalVisible(true);
  };

  const openEditModal = (task) => {
    setSelectedTask(task);
    setFormData({
      title: task.title || '',
      description: task.description || '',
      client: task.client || '',
      assignedTo: task.assignedTo || '',
      dueDate: task.dueDate ? new Date(task.dueDate) : new Date(),
      priority: task.priority || 'Medium',
      status: task.status || 'Pending',
    });
    setEditModalVisible(true);
  };

  const openDetailsModal = (task) => {
    setSelectedTask(task);
    setDetailsModalVisible(true);
  };

  const closeModals = () => {
    setAddModalVisible(false);
    setEditModalVisible(false);
    setDetailsModalVisible(false);
    setSelectedTask(null);
    resetForm();
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError('Title is required');
      return false;
    }
    if (!formData.client.trim() && hasRole(['Admin', 'Manager'])) {
      setError('Client is required');
      return false;
    }
    if (!formData.assignedTo.trim() && hasRole(['Admin', 'Manager'])) {
      setError('Assignment is required');
      return false;
    }
    return true;
  };

  const handleAddTask = async () => {
    if (!validateForm()) return;

    setSubmitting(true);
    setError('');

    try {
      const taskData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        client: formData.client.trim(),
        assignedTo: formData.assignedTo.trim(),
        dueDate: formData.dueDate.toISOString(),
        priority: formData.priority,
        status: formData.status,
      };

      const result = await taskApi.createTask(taskData);

      if (result.success || result.data) {
        Alert.alert('Success', 'Task created successfully');
        closeModals();
        await fetchTasks();
      } else {
        setError(result.error || 'Failed to create task');
      }
    } catch (error) {
      setError(error.message || 'Failed to create task');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditTask = async () => {
    if (!validateForm()) return;

    setSubmitting(true);
    setError('');

    try {
      const taskData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        client: formData.client.trim(),
        assignedTo: formData.assignedTo.trim(),
        dueDate: formData.dueDate.toISOString(),
        priority: formData.priority,
        status: formData.status,
      };

      const result = await taskApi.updateTask(selectedTask._id, taskData);

      if (result.success || result.data) {
        Alert.alert('Success', 'Task updated successfully');
        closeModals();
        await fetchTasks();
      } else {
        setError(result.error || 'Failed to update task');
      }
    } catch (error) {
      setError(error.message || 'Failed to update task');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTask = (task) => {
    Alert.alert(
      'Delete Task',
      `Are you sure you want to delete "${task.title}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await taskApi.deleteTask(task._id);
              if (result.success || result.data) {
                Alert.alert('Success', 'Task deleted successfully');
                await fetchTasks();
              } else {
                Alert.alert('Error', result.error || 'Failed to delete task');
              }
            } catch (error) {
              Alert.alert('Error', error.message || 'Failed to delete task');
            }
          },
        },
      ]
    );
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      const result = await taskApi.updateTask(taskId, { status: newStatus });
      if (result.success || result.data) {
        await fetchTasks();
      } else {
        Alert.alert('Error', result.error || 'Failed to update task status');
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to update task status');
    }
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

  const renderTaskItem = (task) => (
    <Card key={task._id} style={styles.taskCard}>
      <View style={styles.taskHeader}>
        <View style={styles.taskInfo}>
          <Text style={styles.taskTitle}>{task.title}</Text>
          {task.description && (
            <Text style={styles.taskDescription} numberOfLines={2}>
              {task.description}
            </Text>
          )}
        </View>
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

      <View style={styles.taskMeta}>
        {task.dueDate && (
          <Text style={styles.taskDate}>
            Due: {new Date(task.dueDate).toLocaleDateString()}
          </Text>
        )}
        {task.client && (
          <Text style={styles.taskClient}>
            Client: {typeof task.client === 'object' ? task.client.name : task.client}
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

      <View style={styles.taskActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => openDetailsModal(task)}
        >
          <Text style={styles.actionButtonText}>View</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => openEditModal(task)}
        >
          <Text style={styles.actionButtonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteTask(task)}
        >
          <Text style={[styles.actionButtonText, styles.deleteButtonText]}>
            Delete
          </Text>
        </TouchableOpacity>
      </View>

      {task.status !== 'Completed' && (
        <View style={styles.statusActions}>
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
  );

  const renderAddEditModal = () => {
    const isEdit = editModalVisible;
    const modalVisible = isEdit ? editModalVisible : addModalVisible;

    return (
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeModals}
      >
        <SafeAreaView style={commonStyles.safeArea}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {isEdit ? 'Edit Task' : 'Add New Task'}
              </Text>
              <TouchableOpacity onPress={closeModals}>
                <Text style={styles.modalClose}>×</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              {error && (
                <View style={styles.modalError}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              <Input
                label="Title"
                value={formData.title}
                onChangeText={(text) => setFormData({ ...formData, title: text })}
                placeholder="Enter task title"
                style={styles.modalInput}
              />

              <Input
                label="Description"
                value={formData.description}
                onChangeText={(text) => setFormData({ ...formData, description: text })}
                placeholder="Enter task description"
                multiline
                numberOfLines={3}
                style={styles.modalInput}
              />

              {hasRole(['Admin', 'Manager']) && (
                <>
                  <Input
                    label="Client"
                    value={formData.client}
                    onChangeText={(text) => setFormData({ ...formData, client: text })}
                    placeholder="Enter client name or ID"
                    style={styles.modalInput}
                  />

                  <Input
                    label="Assigned To"
                    value={formData.assignedTo}
                    onChangeText={(text) => setFormData({ ...formData, assignedTo: text })}
                    placeholder="Enter assignee name or ID"
                    style={styles.modalInput}
                  />
                </>
              )}

              <View style={styles.modalInput}>
                <Text style={styles.inputLabel}>Due Date</Text>
                <View style={styles.datePickerContainer}>
                  <DatePickerIOS
                    date={formData.dueDate}
                    onDateChange={(date) => setFormData({ ...formData, dueDate: date })}
                    mode="date"
                    style={styles.datePicker}
                  />
                </View>
              </View>

              <View style={styles.modalInput}>
                <Text style={styles.inputLabel}>Priority</Text>
                <View style={styles.priorityOptions}>
                  {['Low', 'Medium', 'High', 'Urgent'].map((priority) => (
                    <TouchableOpacity
                      key={priority}
                      style={[
                        styles.priorityOption,
                        formData.priority === priority && styles.selectedPriorityOption,
                        { borderLeftColor: getPriorityColor(priority) }
                      ]}
                      onPress={() => setFormData({ ...formData, priority })}
                    >
                      <Text style={styles.priorityOptionText}>{priority}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.modalInput}>
                <Text style={styles.inputLabel}>Status</Text>
                <View style={styles.statusOptions}>
                  {['Pending', 'In Progress', 'Completed', 'Cancelled'].map((status) => (
                    <TouchableOpacity
                      key={status}
                      style={[
                        styles.statusOption,
                        formData.status === status && styles.selectedStatusOption,
                        { borderLeftColor: getStatusColor(status) }
                      ]}
                      onPress={() => setFormData({ ...formData, status })}
                    >
                      <Text style={styles.statusOptionText}>{status}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <Button
                title="Cancel"
                onPress={closeModals}
                style={styles.cancelButton}
              />
              <Button
                title={isEdit ? 'Update Task' : 'Add Task'}
                onPress={isEdit ? handleEditTask : handleAddTask}
                loading={submitting}
                disabled={submitting}
              />
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    );
  };

  const renderDetailsModal = () => (
    <Modal
      visible={detailsModalVisible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={closeModals}
    >
      <SafeAreaView style={commonStyles.safeArea}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Task Details</Text>
            <TouchableOpacity onPress={closeModals}>
              <Text style={styles.modalClose}>×</Text>
            </TouchableOpacity>
          </View>

          {selectedTask && (
            <ScrollView style={styles.modalContent}>
              <Card style={styles.detailsCard}>
                <Text style={styles.detailsTitle}>Task Information</Text>
                <View style={styles.detailsRow}>
                  <Text style={styles.detailsLabel}>Title:</Text>
                  <Text style={styles.detailsValue}>{selectedTask.title}</Text>
                </View>
                {selectedTask.description && (
                  <View style={styles.detailsRow}>
                    <Text style={styles.detailsLabel}>Description:</Text>
                    <Text style={styles.detailsValue}>{selectedTask.description}</Text>
                  </View>
                )}
                <View style={styles.detailsRow}>
                  <Text style={styles.detailsLabel}>Status:</Text>
                  <Text style={[
                    styles.statusText,
                    { color: getStatusColor(selectedTask.status) }
                  ]}>
                    {selectedTask.status}
                  </Text>
                </View>
                <View style={styles.detailsRow}>
                  <Text style={styles.detailsLabel}>Priority:</Text>
                  <Text style={[
                    styles.priorityText,
                    { color: getPriorityColor(selectedTask.priority) }
                  ]}>
                    {selectedTask.priority}
                  </Text>
                </View>
              </Card>

              {selectedTask.dueDate && (
                <Card style={styles.detailsCard}>
                  <Text style={styles.detailsTitle}>Schedule</Text>
                  <View style={styles.detailsRow}>
                    <Text style={styles.detailsLabel}>Due Date:</Text>
                    <Text style={styles.detailsValue}>
                      {new Date(selectedTask.dueDate).toLocaleDateString()}
                    </Text>
                  </View>
                </Card>
              )}

              {(selectedTask.client || selectedTask.assignedTo) && (
                <Card style={styles.detailsCard}>
                  <Text style={styles.detailsTitle}>Assignment</Text>
                  {selectedTask.client && (
                    <View style={styles.detailsRow}>
                      <Text style={styles.detailsLabel}>Client:</Text>
                      <Text style={styles.detailsValue}>
                        {typeof selectedTask.client === 'object' 
                          ? selectedTask.client.name 
                          : selectedTask.client}
                      </Text>
                    </View>
                  )}
                  {selectedTask.assignedTo && (
                    <View style={styles.detailsRow}>
                      <Text style={styles.detailsLabel}>Assigned To:</Text>
                      <Text style={styles.detailsValue}>
                        {typeof selectedTask.assignedTo === 'object' 
                          ? selectedTask.assignedTo.name 
                          : selectedTask.assignedTo}
                      </Text>
                    </View>
                  )}
                </Card>
              )}

              <View style={styles.detailsActions}>
                <Button
                  title="Edit Task"
                  onPress={() => {
                    closeModals();
                    openEditModal(selectedTask);
                  }}
                  style={styles.detailsButton}
                />
              </View>
            </ScrollView>
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );

  if (loading) {
    return <Loading fullScreen message="Loading tasks..." />;
  }

  return (
    <SafeAreaView style={commonStyles.safeArea}>
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <Card style={styles.headerCard}>
          <Text style={styles.headerTitle}>
            {hasRole(['Admin', 'Manager']) ? 'Task Management' : 'My Tasks'}
          </Text>
          <Text style={styles.headerSubtitle}>
            {hasRole(['Admin', 'Manager']) 
              ? 'Manage all tasks and assignments'
              : 'View and manage your assigned tasks'
            }
          </Text>
          {hasRole(['Admin', 'Manager']) && (
            <Button
              title="Add New Task"
              onPress={openAddModal}
              style={styles.addButton}
            />
          )}
        </Card>

        {error && (
          <Card style={styles.errorCard}>
            <Text style={styles.errorText}>{error}</Text>
          </Card>
        )}

        {/* Search and Filters */}
        <Card style={styles.filterCard}>
          <Input
            placeholder="Search tasks..."
            value={searchText}
            onChangeText={setSearchText}
            style={styles.searchInput}
          />

          <View style={styles.filterRow}>
            <View style={styles.filterColumn}>
              <Text style={styles.filterLabel}>Status</Text>
              <View style={styles.filterOptions}>
                {['All', 'Pending', 'In Progress', 'Completed', 'Cancelled'].map((status) => (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.filterOption,
                      statusFilter === status && styles.selectedFilterOption,
                    ]}
                    onPress={() => setStatusFilter(status)}
                  >
                    <Text style={styles.filterOptionText}>{status}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.filterColumn}>
              <Text style={styles.filterLabel}>Priority</Text>
              <View style={styles.filterOptions}>
                {['All', 'Low', 'Medium', 'High', 'Urgent'].map((priority) => (
                  <TouchableOpacity
                    key={priority}
                    style={[
                      styles.filterOption,
                      priorityFilter === priority && styles.selectedFilterOption,
                    ]}
                    onPress={() => setPriorityFilter(priority)}
                  >
                    <Text style={styles.filterOptionText}>{priority}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </Card>

        {/* Tasks List */}
        <Card style={styles.tasksCard}>
          <Text style={styles.cardTitle}>
            {hasRole(['Admin', 'Manager']) ? 'All Tasks' : 'My Tasks'} ({filteredTasks.length})
          </Text>
          {filteredTasks.length === 0 ? (
            <EmptyState
              title="No tasks found"
              message={
                tasks.length === 0
                  ? "No tasks have been created yet."
                  : "No tasks match your search criteria."
              }
            />
          ) : (
            filteredTasks.map(renderTaskItem)
          )}
        </Card>
      </ScrollView>

      {/* Modals */}
      {renderAddEditModal()}
      {renderDetailsModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.md,
    backgroundColor: colors.background,
  },
  headerCard: {
    backgroundColor: colors.navy,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  headerTitle: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.bold,
    color: colors.white,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: typography.fontSizes.md,
    color: colors.gray300,
    marginBottom: spacing.md,
  },
  addButton: {
    backgroundColor: colors.primary,
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
  filterCard: {
    backgroundColor: colors.navy,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.navyLight,
  },
  searchInput: {
    backgroundColor: colors.navyLight,
    marginBottom: spacing.md,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  filterColumn: {
    flex: 1,
  },
  filterLabel: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray300,
    marginBottom: spacing.sm,
    fontWeight: typography.fontWeights.semibold,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  filterOption: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: colors.navyLight,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.navyLight,
  },
  selectedFilterOption: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterOptionText: {
    fontSize: typography.fontSizes.xs,
    color: colors.gray300,
  },
  tasksCard: {
    backgroundColor: colors.navy,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.navyLight,
  },
  cardTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
    color: colors.white,
    marginBottom: spacing.md,
  },
  taskCard: {
    backgroundColor: colors.navyLight,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
    color: colors.white,
    marginBottom: spacing.xs,
  },
  taskDescription: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray300,
    marginBottom: spacing.sm,
  },
  taskBadges: {
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  statusText: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.semibold,
  },
  priorityText: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.semibold,
  },
  taskMeta: {
    marginBottom: spacing.md,
  },
  taskDate: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray400,
    marginBottom: spacing.xs,
  },
  taskClient: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray400,
    marginBottom: spacing.xs,
  },
  taskAssignee: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray400,
  },
  taskActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  actionButton: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: colors.error,
  },
  actionButtonText: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.semibold,
    color: colors.white,
  },
  deleteButtonText: {
    color: colors.white,
  },
  statusActions: {
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
  modalError: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: colors.error,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  modalInput: {
    marginBottom: spacing.md,
  },
  inputLabel: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.semibold,
    color: colors.white,
    marginBottom: spacing.sm,
  },
  datePickerContainer: {
    backgroundColor: colors.navyLight,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  datePicker: {
    height: 200,
  },
  priorityOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  priorityOption: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.navyLight,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderLeftWidth: 4,
  },
  selectedPriorityOption: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
  },
  priorityOptionText: {
    fontSize: typography.fontSizes.sm,
    color: colors.white,
    fontWeight: typography.fontWeights.semibold,
  },
  statusOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  statusOption: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.navyLight,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderLeftWidth: 4,
  },
  selectedStatusOption: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
  },
  statusOptionText: {
    fontSize: typography.fontSizes.sm,
    color: colors.white,
    fontWeight: typography.fontWeights.semibold,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.navyLight,
  },
  cancelButton: {
    backgroundColor: colors.gray700,
  },
  // Details modal styles
  detailsCard: {
    backgroundColor: colors.navyLight,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  detailsTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
    color: colors.white,
    marginBottom: spacing.md,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  detailsLabel: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray300,
    fontWeight: typography.fontWeights.medium,
  },
  detailsValue: {
    fontSize: typography.fontSizes.sm,
    color: colors.white,
    fontWeight: typography.fontWeights.semibold,
  },
  detailsActions: {
    padding: spacing.md,
  },
  detailsButton: {
    backgroundColor: colors.primary,
  },
});

export default TasksScreen;
