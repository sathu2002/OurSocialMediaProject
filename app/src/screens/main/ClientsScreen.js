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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { clientApi, packageApi } from '../../api';
import { Card, Button, Input, Loading, EmptyState } from '../../components';
import { colors, typography, spacing, borderRadius, commonStyles } from '../../styles/theme';

const ClientsScreen = () => {
  const { hasRole } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [packageFilter, setPackageFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [error, setError] = useState('');

  // Modal states
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    package: 'Silver',
    status: 'active',
  });

  const fetchClients = async () => {
    try {
      setError('');
      const response = await clientApi.getClients();
      setClients(response || []);
      setFilteredClients(response || []);
    } catch (error) {
      console.log('Clients error:', error);
      setError(error.message || 'Failed to load clients');
    }
  };

  const loadData = async () => {
    setLoading(true);
    await fetchClients();
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchClients();
    setRefreshing(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterClients();
  }, [clients, searchText, packageFilter, statusFilter]);

  const filterClients = () => {
    let filtered = [...clients];

    // Search filter
    if (searchText) {
      filtered = filtered.filter(client =>
        client.name.toLowerCase().includes(searchText.toLowerCase()) ||
        client.email.toLowerCase().includes(searchText.toLowerCase()) ||
        (client.company && client.company.toLowerCase().includes(searchText.toLowerCase()))
      );
    }

    // Package filter
    if (packageFilter !== 'All') {
      filtered = filtered.filter(client => client.package === packageFilter);
    }

    // Status filter
    if (statusFilter !== 'All') {
      filtered = filtered.filter(client => (client.status || '').toLowerCase() === statusFilter.toLowerCase());
    }

    setFilteredClients(filtered);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      company: '',
      package: 'Silver',
      status: 'active',
    });
    setError('');
  };

  const openAddModal = () => {
    resetForm();
    setAddModalVisible(true);
  };

  const openEditModal = (client) => {
    setSelectedClient(client);
    setFormData({
      name: client.name || '',
      email: client.email || '',
      phone: client.phone || '',
      company: client.company || '',
      package: client.package || 'Silver',
      status: client.status || 'active',
    });
    setEditModalVisible(true);
  };

  const openDetailsModal = (client) => {
    setSelectedClient(client);
    setDetailsModalVisible(true);
  };

  const closeModals = () => {
    setAddModalVisible(false);
    setEditModalVisible(false);
    setDetailsModalVisible(false);
    setSelectedClient(null);
    resetForm();
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Name is required');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      setError('Please enter a valid email address');
      return false;
    }
    if (!formData.phone.trim()) {
      setError('Phone is required');
      return false;
    }
    if (!/^[+\d()\-\s]{7,20}$/.test(formData.phone.trim())) {
      setError('Please enter a valid phone number');
      return false;
    }
    if (!formData.company.trim()) {
      setError('Company is required');
      return false;
    }
    return true;
  };

  const handleAddClient = async () => {
    if (!validateForm()) return;

    setSubmitting(true);
    setError('');

    try {
      const result = await clientApi.createClient({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        company: formData.company.trim(),
        package: formData.package,
        status: formData.status,
      });

      if (result.success) {
        Alert.alert('Success', 'Client created successfully');
        closeModals();
        await fetchClients();
      } else {
        setError(result.error || 'Failed to create client');
      }
    } catch (error) {
      setError(error.message || 'Failed to create client');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditClient = async () => {
    if (!validateForm()) return;

    setSubmitting(true);
    setError('');

    try {
      const result = await clientApi.updateClient(selectedClient._id, {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        company: formData.company.trim(),
        package: formData.package,
        status: formData.status,
      });

      if (result.success) {
        Alert.alert('Success', 'Client updated successfully');
        closeModals();
        await fetchClients();
      } else {
        setError(result.error || 'Failed to update client');
      }
    } catch (error) {
      setError(error.message || 'Failed to update client');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClient = (client) => {
    Alert.alert(
      'Delete Client',
      `Are you sure you want to delete ${client.name}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await clientApi.deleteClient(client._id);
              if (result.success) {
                Alert.alert('Success', 'Client deleted successfully');
                await fetchClients();
              } else {
                Alert.alert('Error', result.error || 'Failed to delete client');
              }
            } catch (error) {
              Alert.alert('Error', error.message || 'Failed to delete client');
            }
          },
        },
      ]
    );
  };

  const getPackageColor = (packageName) => {
    return packageApi.getPackageColor(packageName);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return colors.success;
      case 'inactive': return colors.gray400;
      default: return colors.gray400;
    }
  };

  const getStatusLabel = (status) => (status === 'inactive' ? 'Inactive' : 'Active');

  const renderClientItem = (client) => (
    <Card key={client._id} style={styles.clientCard}>
      <View style={styles.clientHeader}>
        <View style={styles.clientInfo}>
          <Text style={styles.clientName}>{client.name}</Text>
          <Text style={styles.clientEmail}>{client.email}</Text>
          {client.company && (
            <Text style={styles.clientCompany}>{client.company}</Text>
          )}
          {client.phone && (
            <Text style={styles.clientPhone}>{client.phone}</Text>
          )}
        </View>
        <View style={styles.clientStatus}>
          <Text style={[
            styles.statusText,
            { color: getStatusColor(client.status) }
          ]}>
            {getStatusLabel(client.status)}
          </Text>
        </View>
      </View>

      <View style={styles.packageInfo}>
        {client.package ? (
          <View style={styles.currentPackage}>
            <Text style={styles.currentPackageLabel}>Package:</Text>
            <View style={[
              styles.packageBadge,
              { backgroundColor: getPackageColor(client.package) }
            ]}>
              <Text style={styles.packageBadgeText}>{client.package}</Text>
            </View>
          </View>
        ) : (
          <Text style={styles.noPackageText}>No package assigned</Text>
        )}
      </View>

      <View style={styles.clientActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => openDetailsModal(client)}
        >
          <Text style={styles.actionButtonText}>View</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => openEditModal(client)}
        >
          <Text style={styles.actionButtonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteClient(client)}
        >
          <Text style={[styles.actionButtonText, styles.deleteButtonText]}>
            Delete
          </Text>
        </TouchableOpacity>
      </View>
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
                {isEdit ? 'Edit Client' : 'Add New Client'}
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
                label="Name"
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                placeholder="Enter client name"
                style={styles.modalInput}
              />

              <Input
                label="Email"
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                placeholder="Enter email address"
                keyboardType="email-address"
                style={styles.modalInput}
              />

              <Input
                label="Phone"
                value={formData.phone}
                onChangeText={(text) => setFormData({ ...formData, phone: text })}
                placeholder="Enter phone number"
                keyboardType="phone-pad"
                style={styles.modalInput}
              />

              <Input
                label="Company"
                value={formData.company}
                onChangeText={(text) => setFormData({ ...formData, company: text })}
                placeholder="Enter company name"
                style={styles.modalInput}
              />

              <View style={styles.modalInput}>
                <Text style={styles.inputLabel}>Package</Text>
                <View style={styles.packageOptions}>
                  {packageApi.getAvailablePackages().map((pkg) => (
                    <TouchableOpacity
                      key={pkg}
                      style={[
                        styles.packageOption,
                        formData.package === pkg && styles.selectedPackageOption,
                        { borderLeftColor: getPackageColor(pkg) }
                      ]}
                      onPress={() => setFormData({ ...formData, package: pkg })}
                    >
                      <Text style={styles.packageOptionText}>{pkg}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.modalInput}>
                <Text style={styles.inputLabel}>Status</Text>
                <View style={styles.statusOptions}>
                  {['active', 'inactive'].map((status) => (
                    <TouchableOpacity
                      key={status}
                      style={[
                        styles.statusOption,
                        formData.status === status && styles.selectedStatusOption,
                        { borderLeftColor: getStatusColor(status) }
                      ]}
                      onPress={() => setFormData({ ...formData, status })}
                    >
                      <Text style={styles.statusOptionText}>{getStatusLabel(status)}</Text>
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
                title={isEdit ? 'Update Client' : 'Add Client'}
                onPress={isEdit ? handleEditClient : handleAddClient}
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
            <Text style={styles.modalTitle}>Client Details</Text>
            <TouchableOpacity onPress={closeModals}>
              <Text style={styles.modalClose}>×</Text>
            </TouchableOpacity>
          </View>

          {selectedClient && (
            <ScrollView style={styles.modalContent}>
              <Card style={styles.detailsCard}>
                <Text style={styles.detailsTitle}>Basic Information</Text>
                <View style={styles.detailsRow}>
                  <Text style={styles.detailsLabel}>Name:</Text>
                  <Text style={styles.detailsValue}>{selectedClient.name}</Text>
                </View>
                <View style={styles.detailsRow}>
                  <Text style={styles.detailsLabel}>Email:</Text>
                  <Text style={styles.detailsValue}>{selectedClient.email}</Text>
                </View>
                <View style={styles.detailsRow}>
                  <Text style={styles.detailsLabel}>Phone:</Text>
                  <Text style={styles.detailsValue}>{selectedClient.phone}</Text>
                </View>
                <View style={styles.detailsRow}>
                  <Text style={styles.detailsLabel}>Company:</Text>
                  <Text style={styles.detailsValue}>{selectedClient.company}</Text>
                </View>
              </Card>

              <Card style={styles.detailsCard}>
                <Text style={styles.detailsTitle}>Subscription</Text>
                <View style={styles.detailsRow}>
                  <Text style={styles.detailsLabel}>Package:</Text>
                  <View style={[
                    styles.packageBadge,
                    { backgroundColor: getPackageColor(selectedClient.package) }
                  ]}>
                    <Text style={styles.packageBadgeText}>{selectedClient.package}</Text>
                  </View>
                </View>
                <View style={styles.detailsRow}>
                  <Text style={styles.detailsLabel}>Status:</Text>
                  <Text style={[
                    styles.statusText,
                    { color: getStatusColor(selectedClient.status) }
                  ]}>
                    {getStatusLabel(selectedClient.status)}
                  </Text>
                </View>
                {selectedClient.packageAssignedAt && (
                  <View style={styles.detailsRow}>
                    <Text style={styles.detailsLabel}>Assigned:</Text>
                    <Text style={styles.detailsValue}>
                      {new Date(selectedClient.packageAssignedAt).toLocaleDateString()}
                    </Text>
                  </View>
                )}
              </Card>

              <View style={styles.detailsActions}>
                <Button
                  title="Edit Client"
                  onPress={() => {
                    closeModals();
                    openEditModal(selectedClient);
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
    return <Loading fullScreen message="Loading clients..." />;
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
          <Text style={styles.headerTitle}>Client Management</Text>
          <Text style={styles.headerSubtitle}>
            Manage your clients and their subscriptions
          </Text>
          <Button
            title="Add New Client"
            onPress={openAddModal}
            style={styles.addButton}
          />
        </Card>

        {error && (
          <Card style={styles.errorCard}>
            <Text style={styles.errorText}>{error}</Text>
          </Card>
        )}

        {/* Search and Filters */}
        <Card style={styles.filterCard}>
          <Input
            placeholder="Search clients..."
            value={searchText}
            onChangeText={setSearchText}
            style={styles.searchInput}
          />

          <View style={styles.filterRow}>
            <View style={styles.filterColumn}>
              <Text style={styles.filterLabel}>Package</Text>
              <View style={styles.filterOptions}>
                {['All', ...packageApi.getAvailablePackages()].map((pkg) => (
                  <TouchableOpacity
                    key={pkg}
                    style={[
                      styles.filterOption,
                      packageFilter === pkg && styles.selectedFilterOption,
                    ]}
                    onPress={() => setPackageFilter(pkg)}
                  >
                    <Text style={styles.filterOptionText}>{pkg}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.filterColumn}>
              <Text style={styles.filterLabel}>Status</Text>
              <View style={styles.filterOptions}>
                {['All', 'active', 'inactive'].map((status) => (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.filterOption,
                      statusFilter === status && styles.selectedFilterOption,
                    ]}
                    onPress={() => setStatusFilter(status)}
                  >
                    <Text style={styles.filterOptionText}>
                      {status === 'All' ? status : getStatusLabel(status)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </Card>

        {/* Clients List */}
        <Card style={styles.clientsCard}>
          <Text style={styles.cardTitle}>
            Clients ({filteredClients.length})
          </Text>
          {filteredClients.length === 0 ? (
            <EmptyState
              title="No clients found"
              message={
                clients.length === 0
                  ? "No clients have been added to the system yet."
                  : "No clients match your search criteria."
              }
            />
          ) : (
            filteredClients.map(renderClientItem)
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
  clientsCard: {
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
  clientCard: {
    backgroundColor: colors.navyLight,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  clientHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  clientInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
    color: colors.white,
    marginBottom: spacing.xs,
  },
  clientEmail: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray300,
    marginBottom: spacing.xs,
  },
  clientCompany: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray400,
    marginBottom: spacing.xs,
  },
  clientPhone: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray400,
  },
  clientStatus: {
    alignItems: 'flex-end',
  },
  statusText: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.semibold,
  },
  packageInfo: {
    marginBottom: spacing.md,
  },
  currentPackage: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currentPackageLabel: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray300,
    marginRight: spacing.sm,
  },
  packageBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  packageBadgeText: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.bold,
    color: colors.white,
  },
  noPackageText: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray400,
    fontStyle: 'italic',
  },
  clientActions: {
    flexDirection: 'row',
    gap: spacing.sm,
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
  packageOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  packageOption: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.navyLight,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderLeftWidth: 4,
  },
  selectedPackageOption: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
  },
  packageOptionText: {
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

export default ClientsScreen;
