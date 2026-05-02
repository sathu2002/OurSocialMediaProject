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
import { paymentApi, clientApi } from '../../api';
import { Card, Button, Input, Loading, EmptyState } from '../../components';
import { colors, typography, spacing, borderRadius, commonStyles } from '../../styles/theme';

const PaymentsScreen = () => {
  const { hasRole } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [clients, setClients] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalRevenue: 0,
    paidCount: 0,
    pendingCount: 0,
    overdueCount: 0,
  });

  // Modal states
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    clientId: '',
    amount: '',
    package: 'Silver',
    method: 'Bank Transfer',
    status: 'Pending',
    note: '',
  });

  const fetchPayments = async () => {
    try {
      setError('');
      const response = await paymentApi.getPayments();
      setPayments(response || []);
      setFilteredPayments(response || []);
      
      // Calculate stats
      const paymentsData = response || [];
      const totalRevenue = paymentsData
        .filter(p => p.status === 'Paid')
        .reduce((sum, p) => sum + (p.amount || 0), 0);
      const paidCount = paymentsData.filter(p => p.status === 'Paid').length;
      const pendingCount = paymentsData.filter(p => p.status === 'Pending').length;
      const overdueCount = paymentsData.filter(p => p.status === 'Overdue').length;
      
      setStats({
        totalRevenue,
        paidCount,
        pendingCount,
        overdueCount,
      });
    } catch (error) {
      console.log('Payments error:', error);
      setError(error.message || 'Failed to load payments');
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
    await Promise.all([fetchPayments(), fetchClients()]);
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchPayments(), fetchClients()]);
    setRefreshing(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterPayments();
  }, [payments, searchText, statusFilter]);

  const filterPayments = () => {
    let filtered = [...payments];

    // Search filter
    if (searchText) {
      filtered = filtered.filter(payment =>
        payment.invoiceNumber.toLowerCase().includes(searchText.toLowerCase()) ||
        (payment.clientId && typeof payment.clientId === 'object' &&
          payment.clientId.name.toLowerCase().includes(searchText.toLowerCase()))
      );
    }

    // Status filter
    if (statusFilter !== 'All') {
      filtered = filtered.filter(payment => payment.status === statusFilter);
    }

    setFilteredPayments(filtered);
  };

  const resetForm = () => {
    setFormData({
      clientId: '',
      amount: '',
      package: 'Silver',
      method: 'Bank Transfer',
      status: 'Pending',
      note: '',
    });
    setError('');
  };

  const openAddModal = () => {
    resetForm();
    setAddModalVisible(true);
  };

  const openEditModal = (payment) => {
    setSelectedPayment(payment);
    setFormData({
      clientId: payment.clientId?._id || payment.clientId || '',
      amount: payment.amount ? payment.amount.toString() : '',
      package: payment.package || 'Silver',
      method: payment.method || 'Bank Transfer',
      status: payment.status || 'Pending',
      note: payment.note || '',
    });
    setEditModalVisible(true);
  };

  const openDetailsModal = (payment) => {
    setSelectedPayment(payment);
    setDetailsModalVisible(true);
  };

  const closeModals = () => {
    setAddModalVisible(false);
    setEditModalVisible(false);
    setDetailsModalVisible(false);
    setSelectedPayment(null);
    resetForm();
  };

  const validateForm = () => {
    if (!formData.clientId.trim()) {
      setError('Client is required');
      return false;
    }
    if (!formData.amount.trim()) {
      setError('Amount is required');
      return false;
    }
    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      setError('Amount must be a positive number');
      return false;
    }
    if (!formData.method.trim()) {
      setError('Payment method is required');
      return false;
    }
    if (!formData.status.trim()) {
      setError('Status is required');
      return false;
    }
    return true;
  };

  const handleAddPayment = async () => {
    if (!validateForm()) return;

    setSubmitting(true);
    setError('');

    try {
      const paymentData = {
        clientId: formData.clientId.trim(),
        amount: parseFloat(formData.amount),
        package: formData.package,
        method: formData.method.trim(),
        status: formData.status.trim(),
        note: formData.note.trim(),
      };

      const result = await paymentApi.createPayment(paymentData);

      if (result.success || result.data) {
        Alert.alert('Success', 'Payment recorded successfully');
        closeModals();
        await fetchPayments();
      } else {
        setError(result.error || 'Failed to record payment');
      }
    } catch (error) {
      setError(error.message || 'Failed to record payment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditPayment = async () => {
    if (!validateForm()) return;

    setSubmitting(true);
    setError('');

    try {
      const paymentData = {
        clientId: formData.clientId.trim(),
        amount: parseFloat(formData.amount),
        package: formData.package,
        method: formData.method.trim(),
        status: formData.status.trim(),
        note: formData.note.trim(),
      };

      const result = await paymentApi.updatePayment(selectedPayment._id, paymentData);

      if (result.success || result.data) {
        Alert.alert('Success', 'Payment updated successfully');
        closeModals();
        await fetchPayments();
      } else {
        setError(result.error || 'Failed to update payment');
      }
    } catch (error) {
      setError(error.message || 'Failed to update payment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePayment = (payment) => {
    Alert.alert(
      'Delete Payment',
      `Are you sure you want to delete invoice #${payment.invoiceNumber}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await paymentApi.deletePayment(payment._id);
              if (result.success || result.data) {
                Alert.alert('Success', 'Payment deleted successfully');
                await fetchPayments();
              } else {
                Alert.alert('Error', result.error || 'Failed to delete payment');
              }
            } catch (error) {
              Alert.alert('Error', error.message || 'Failed to delete payment');
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Paid': return colors.success;
      case 'Pending': return colors.warning;
      case 'Overdue': return colors.error;
      default: return colors.gray400;
    }
  };

  const getMethodColor = (method) => {
    switch (method) {
      case 'Online': return colors.primary;
      case 'Bank Transfer': return colors.info;
      case 'Cash': return colors.success;
      case 'Cheque': return colors.warning;
      default: return colors.gray400;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount || 0);
  };

  const renderPaymentItem = (payment) => (
    <Card key={payment._id} style={styles.paymentCard}>
      <View style={styles.paymentHeader}>
        <View style={styles.paymentInfo}>
          <Text style={styles.invoiceNumber}>
            Invoice #{payment.invoiceNumber}
          </Text>
          <Text style={styles.clientName}>
            {payment.clientId?.name || 'Unknown Client'}
          </Text>
        </View>
        <View style={styles.paymentStatus}>
          <Text style={[
            styles.statusText,
            { color: getStatusColor(payment.status) }
          ]}>
            {payment.status}
          </Text>
        </View>
      </View>

      <View style={styles.paymentDetails}>
        <Text style={styles.amount}>
          {formatCurrency(payment.amount)}
        </Text>
        <View style={styles.paymentMeta}>
          <Text style={styles.methodText}>
            Method: <Text style={{ color: getMethodColor(payment.method) }}>{payment.method}</Text>
          </Text>
          {payment.package && (
            <Text style={styles.dueDate}>Package: {payment.package}</Text>
          )}
          {payment.paidAt && (
            <Text style={styles.paidDate}>
              Paid: {new Date(payment.paidAt).toLocaleDateString()}
            </Text>
          )}
        </View>
      </View>

      {payment.note && (
        <Text style={styles.description} numberOfLines={2}>
          {payment.note}
        </Text>
      )}

      <View style={styles.paymentActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => openDetailsModal(payment)}
        >
          <Text style={styles.actionButtonText}>View</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => openEditModal(payment)}
        >
          <Text style={styles.actionButtonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeletePayment(payment)}
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
                {isEdit ? 'Edit Payment' : 'Record New Payment'}
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
                label="Amount"
                value={formData.amount}
                onChangeText={(text) => setFormData({ ...formData, amount: text })}
                placeholder="Enter amount"
                keyboardType="numeric"
                style={styles.modalInput}
              />

              <View style={styles.modalInput}>
                <Text style={styles.inputLabel}>Client</Text>
                <View style={styles.methodOptions}>
                  {clients.map((client) => (
                    <TouchableOpacity
                      key={client._id}
                      style={[
                        styles.methodOption,
                        formData.clientId === client._id && styles.selectedMethodOption,
                      ]}
                      onPress={() => setFormData({
                        ...formData,
                        clientId: client._id,
                        package: client.package || 'Silver',
                      })}
                    >
                      <Text style={styles.methodOptionText}>{client.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.modalInput}>
                <Text style={styles.inputLabel}>Package</Text>
                <View style={styles.methodOptions}>
                  {['Silver', 'Gold', 'Platinum', 'Diamond'].map((pkg) => (
                    <TouchableOpacity
                      key={pkg}
                      style={[
                        styles.methodOption,
                        formData.package === pkg && styles.selectedMethodOption,
                      ]}
                      onPress={() => setFormData({ ...formData, package: pkg })}
                    >
                      <Text style={styles.methodOptionText}>{pkg}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.modalInput}>
                <Text style={styles.inputLabel}>Payment Method</Text>
                <View style={styles.methodOptions}>
                  {['Cash', 'Bank Transfer', 'Cheque', 'Online'].map((method) => (
                    <TouchableOpacity
                      key={method}
                      style={[
                        styles.methodOption,
                        formData.method === method && styles.selectedMethodOption,
                        { borderLeftColor: getMethodColor(method) }
                      ]}
                      onPress={() => setFormData({ ...formData, method })}
                    >
                      <Text style={styles.methodOptionText}>{method}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.modalInput}>
                <Text style={styles.inputLabel}>Status</Text>
                <View style={styles.statusOptions}>
                  {['Pending', 'Paid', 'Overdue'].map((status) => (
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

              <Input
                label="Note"
                value={formData.note}
                onChangeText={(text) => setFormData({ ...formData, note: text })}
                placeholder="Optional payment note"
                multiline
                numberOfLines={3}
                style={styles.modalInput}
              />
            </ScrollView>

            <View style={styles.modalActions}>
              <Button
                title="Cancel"
                onPress={closeModals}
                style={styles.cancelButton}
              />
              <Button
                title={isEdit ? 'Update Payment' : 'Record Payment'}
                onPress={isEdit ? handleEditPayment : handleAddPayment}
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
            <Text style={styles.modalTitle}>Payment Details</Text>
            <TouchableOpacity onPress={closeModals}>
              <Text style={styles.modalClose}>×</Text>
            </TouchableOpacity>
          </View>

          {selectedPayment && (
            <ScrollView style={styles.modalContent}>
              <Card style={styles.detailsCard}>
                <Text style={styles.detailsTitle}>Invoice Information</Text>
                <View style={styles.detailsRow}>
                  <Text style={styles.detailsLabel}>Invoice #:</Text>
                  <Text style={styles.detailsValue}>{selectedPayment.invoiceNumber}</Text>
                </View>
                <View style={styles.detailsRow}>
                  <Text style={styles.detailsLabel}>Client:</Text>
                  <Text style={styles.detailsValue}>
                    {selectedPayment.clientId?.name || 'Unknown Client'}
                  </Text>
                </View>
                <View style={styles.detailsRow}>
                  <Text style={styles.detailsLabel}>Amount:</Text>
                  <Text style={styles.detailsValue}>
                    {formatCurrency(selectedPayment.amount)}
                  </Text>
                </View>
                <View style={styles.detailsRow}>
                  <Text style={styles.detailsLabel}>Status:</Text>
                  <Text style={[
                    styles.statusText,
                    { color: getStatusColor(selectedPayment.status) }
                  ]}>
                    {selectedPayment.status}
                  </Text>
                </View>
              </Card>

              <Card style={styles.detailsCard}>
                <Text style={styles.detailsTitle}>Payment Details</Text>
                <View style={styles.detailsRow}>
                  <Text style={styles.detailsLabel}>Method:</Text>
                  <Text style={styles.detailsValue}>{selectedPayment.method}</Text>
                </View>
                <View style={styles.detailsRow}>
                  <Text style={styles.detailsLabel}>Package:</Text>
                  <Text style={styles.detailsValue}>{selectedPayment.package || 'N/A'}</Text>
                </View>
                {selectedPayment.paidAt && (
                  <View style={styles.detailsRow}>
                    <Text style={styles.detailsLabel}>Paid Date:</Text>
                    <Text style={styles.detailsValue}>
                      {new Date(selectedPayment.paidAt).toLocaleDateString()}
                    </Text>
                  </View>
                )}
                {selectedPayment.note && (
                  <View style={styles.detailsRow}>
                    <Text style={styles.detailsLabel}>Note:</Text>
                    <Text style={styles.detailsValue}>{selectedPayment.note}</Text>
                  </View>
                )}
              </Card>

              <View style={styles.detailsActions}>
                <Button
                  title="Edit Payment"
                  onPress={() => {
                    closeModals();
                    openEditModal(selectedPayment);
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
    return <Loading fullScreen message="Loading payments..." />;
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
          <Text style={styles.headerTitle}>Payment Management</Text>
          <Text style={styles.headerSubtitle}>
            Track and manage client payments and invoices
          </Text>
          <Button
            title="Record New Payment"
            onPress={openAddModal}
            style={styles.addButton}
          />
        </Card>

        {/* Statistics */}
        <View style={styles.statsGrid}>
          <Card style={styles.statCard}>
            <Text style={styles.statNumber}>{formatCurrency(stats.totalRevenue)}</Text>
            <Text style={styles.statLabel}>Total Revenue</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.paidCount}</Text>
            <Text style={styles.statLabel}>Paid Invoices</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.pendingCount}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.overdueCount}</Text>
            <Text style={styles.statLabel}>Overdue</Text>
          </Card>
        </View>

        {error && (
          <Card style={styles.errorCard}>
            <Text style={styles.errorText}>{error}</Text>
          </Card>
        )}

        {/* Search and Filters */}
        <Card style={styles.filterCard}>
          <Input
            placeholder="Search by invoice or client..."
            value={searchText}
            onChangeText={setSearchText}
            style={styles.searchInput}
          />

          <View style={styles.filterColumn}>
            <Text style={styles.filterLabel}>Status</Text>
            <View style={styles.filterOptions}>
              {['All', 'Pending', 'Paid', 'Overdue'].map((status) => (
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
        </Card>

        {/* Payments List */}
        <Card style={styles.paymentsCard}>
          <Text style={styles.cardTitle}>
            Payments ({filteredPayments.length})
          </Text>
          {filteredPayments.length === 0 ? (
            <EmptyState
              title="No payments found"
              message={
                payments.length === 0
                  ? "No payment records have been created yet."
                  : "No payments match your search criteria."
              }
            />
          ) : (
            filteredPayments.map(renderPaymentItem)
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  statCard: {
    width: '48%',
    backgroundColor: colors.navy,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.navyLight,
  },
  statNumber: {
    fontSize: typography.fontSizes['2xl'],
    fontWeight: typography.fontWeights.bold,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray300,
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
  paymentsCard: {
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
  paymentCard: {
    backgroundColor: colors.navyLight,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  paymentInfo: {
    flex: 1,
  },
  invoiceNumber: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
    color: colors.white,
    marginBottom: spacing.xs,
  },
  clientName: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray300,
    marginBottom: spacing.xs,
  },
  paymentStatus: {
    alignItems: 'flex-end',
  },
  statusText: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.semibold,
  },
  paymentDetails: {
    marginBottom: spacing.md,
  },
  amount: {
    fontSize: typography.fontSizes['2xl'],
    fontWeight: typography.fontWeights.bold,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  paymentMeta: {
    gap: spacing.xs,
  },
  methodText: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray400,
  },
  dueDate: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray400,
  },
  paidDate: {
    fontSize: typography.fontSizes.sm,
    color: colors.success,
  },
  description: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray300,
    marginBottom: spacing.md,
    lineHeight: 18,
  },
  paymentActions: {
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
  datePickerContainer: {
    backgroundColor: colors.navyLight,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  datePicker: {
    height: 200,
  },
  methodOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  methodOption: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.navyLight,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderLeftWidth: 4,
  },
  selectedMethodOption: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
  },
  methodOptionText: {
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

export default PaymentsScreen;
