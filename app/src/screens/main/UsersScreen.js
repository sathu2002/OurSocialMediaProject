import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Modal,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { userApi } from '../../api';
import { Card, Button, Input, Loading, EmptyState } from '../../components';
import { colors, typography, spacing, commonStyles } from '../../styles/theme';

const ROLES = ['Admin', 'Manager', 'Staff', 'Client'];

const UsersScreen = () => {
  const [users, setUsers] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Client',
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const filteredUsers = users.filter((user) => {
    const query = searchText.trim().toLowerCase();
    if (!query) return true;

    return (
      user.name?.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query) ||
      user.role?.toLowerCase().includes(query)
    );
  });

  const fetchUsers = async () => {
    try {
      const response = await userApi.getUsers();
      setUsers((response || []).filter((user) => user.isActive !== false));
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to load users');
    }
  };

  const loadData = async () => {
    setLoading(true);
    await fetchUsers();
    setLoading(false);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchUsers();
    setRefreshing(false);
  }, []);

  useEffect(() => {
    loadData();
  }, []);

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Invalid email format';
    }
    if (!editingUser && !formData.password) {
      errors.password = 'Password is required for new users';
    } else if (!editingUser && formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddUser = () => {
    setEditingUser(null);
    setFormData({ name: '', email: '', password: '', role: 'Client' });
    setFormErrors({});
    setModalVisible(true);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
    });
    setFormErrors({});
    setModalVisible(true);
  };

  const handleDeleteUser = (user) => {
    Alert.alert(
      'Confirm Delete',
      `Are you sure you want to delete ${user.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await userApi.deleteUser(user._id);
              if (!(result.success || result.data)) {
                throw new Error(result.error || 'Failed to delete user');
              }
              setUsers((currentUsers) => currentUsers.filter((currentUser) => currentUser._id !== user._id));
              Alert.alert('Success', 'User deleted successfully');
            } catch (error) {
              Alert.alert('Error', error.message || 'Failed to delete user');
            }
          },
        },
      ]
    );
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      if (editingUser) {
        const updateData = { ...formData };
        if (!updateData.password) delete updateData.password;
        await userApi.updateUser(editingUser._id, updateData);
        Alert.alert('Success', 'User updated successfully');
      } else {
        await userApi.createUser(formData);
        Alert.alert('Success', 'User created successfully');
      }
      setModalVisible(false);
      fetchUsers();
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to save user');
    } finally {
      setSubmitting(false);
    }
  };

  const renderUser = ({ item }) => (
    <Card style={styles.userCard}>
      <View style={styles.userHeader}>
        <View>
          <Text style={styles.userName}>{item.name}</Text>
          <Text style={styles.userEmail}>{item.email}</Text>
        </View>
        <View style={[styles.roleBadge, { backgroundColor: getRoleColor(item.role) }]}>
          <Text style={styles.roleText}>{item.role}</Text>
        </View>
      </View>
      <View style={styles.userActions}>
        <Button
          title="Edit"
          onPress={() => handleEditUser(item)}
          variant="outline"
          size="sm"
          style={styles.actionButton}
        />
        <Button
          title="Delete"
          onPress={() => handleDeleteUser(item)}
          variant="danger"
          size="sm"
          style={styles.actionButton}
        />
      </View>
    </Card>
  );

  const getRoleColor = (role) => {
    switch (role) {
      case 'Admin': return colors.error + '40';
      case 'Manager': return colors.warning + '40';
      case 'Staff': return colors.info + '40';
      default: return colors.success + '40';
    }
  };

  if (loading) {
    return <Loading fullScreen message="Loading users..." />;
  }

  return (
    <SafeAreaView style={commonStyles.safeArea}>
      <View style={commonStyles.content}>
        <View style={styles.header}>
            <Text style={commonStyles.title}>User Management</Text>
          <Button title="+ Add User" onPress={handleAddUser} size="sm" />
        </View>

        <Input
          placeholder="Search by name, email, or role"
          value={searchText}
          onChangeText={setSearchText}
        />

        {filteredUsers.length === 0 ? (
          <EmptyState
            title={users.length === 0 ? 'No Users' : 'No Matches'}
            message={users.length === 0 ? 'No users found in the system.' : 'Try a different search term.'}
            actionLabel="Add User"
            onAction={handleAddUser}
          />
        ) : (
          <FlatList
            data={filteredUsers}
            renderItem={renderUser}
            keyExtractor={(item) => item._id}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            contentContainerStyle={styles.listContent}
          />
        )}
      </View>

      {/* Add/Edit Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingUser ? 'Edit User' : 'Add New User'}
            </Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Input
                label="Name"
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                error={formErrors.name}
                labelStyle={styles.modalInputLabel}
              />
              <Input
                label="Email"
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                error={formErrors.email}
                autoCapitalize="none"
                keyboardType="email-address"
                labelStyle={styles.modalInputLabel}
              />
              <Input
                label={editingUser ? 'Password (leave blank to keep unchanged)' : 'Password'}
                value={formData.password}
                onChangeText={(text) => setFormData({ ...formData, password: text })}
                error={formErrors.password}
                secureTextEntry
                labelStyle={styles.modalInputLabel}
              />
              <Text style={styles.label}>Role</Text>
              <View style={styles.roleContainer}>
                {ROLES.map((role) => (
                  <TouchableOpacity
                    key={role}
                    style={[
                      styles.roleButton,
                      formData.role === role && styles.roleButtonActive,
                    ]}
                    onPress={() => setFormData({ ...formData, role })}
                  >
                    <Text
                      style={[
                        styles.roleButtonText,
                        formData.role === role && styles.roleButtonTextActive,
                      ]}
                    >
                      {role}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.modalActions}>
                <Button
                  title="Cancel"
                  onPress={() => setModalVisible(false)}
                  variant="outline"
                  style={styles.modalButton}
                />
                <Button
                  title={submitting ? 'Saving...' : editingUser ? 'Update' : 'Create'}
                  onPress={handleSubmit}
                  loading={submitting}
                  style={styles.modalButton}
                />
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  userCard: {
    marginBottom: spacing.md,
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  userName: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    color: colors.textPrimary,
  },
  userEmail: {
    fontSize: typography.fontSizes.sm,
    color: colors.textSecondary,
  },
  roleBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleText: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.semibold,
    color: colors.white,
  },
  userActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
  listContent: {
    paddingBottom: spacing.lg,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: spacing.md,
  },
  modalContent: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: spacing.lg,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  modalInputLabel: {
    color: colors.textPrimary,
  },
  roleContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  roleButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    backgroundColor: colors.gray700,
    borderWidth: 1,
    borderColor: colors.gray600,
  },
  roleButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  roleButtonText: {
    color: colors.gray400,
    fontSize: typography.fontSizes.sm,
  },
  roleButtonTextActive: {
    color: colors.white,
    fontWeight: typography.fontWeights.semibold,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  modalButton: {
    flex: 1,
  },
});

export default UsersScreen;
