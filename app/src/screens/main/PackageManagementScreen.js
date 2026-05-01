import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { clientApi, packageApi } from '../../api';
import { Card, Button, Input, Loading, EmptyState } from '../../components';
import { colors, typography, spacing, commonStyles } from '../../styles/theme';

const PackageManagementScreen = () => {
  const { hasRole } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [clients, setClients] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [formData, setFormData] = useState({
    package: 'Silver',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchClients = async () => {
    try {
      setError('');
      const response = await packageApi.getClientsWithPackages();
      setClients(response || []);
    } catch (error) {
      console.log('Package Management error:', error);
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

  const getPackageColor = (packageName) => {
    return packageApi.getPackageColor(packageName);
  };

  const getPackageDetails = (packageName) => {
    return packageApi.getPackageDetails(packageName);
  };

  const handleUpdatePackage = async () => {
    if (!selectedClient) return;

    setSubmitting(true);
    setError('');

    try {
      const result = await packageApi.updateClientPackage(selectedClient._id, {
        package: formData.package,
        packageAssignedAt: new Date().toISOString(),
      });

      if (result.success) {
        Alert.alert('Success', 'Package updated successfully');
        setModalVisible(false);
        setSelectedClient(null);
        await fetchClients();
      } else {
        setError(result.error || 'Failed to update package');
      }
    } catch (error) {
      setError(error.message || 'Failed to update package');
    } finally {
      setSubmitting(false);
    }
  };

  const openPackageModal = (client) => {
    setSelectedClient(client);
    setFormData({
      package: client.package || 'Silver',
    });
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedClient(null);
    setError('');
  };

  const renderPackageCard = (packageInfo) => {
    const availablePackages = packageApi.getAvailablePackages();
    
    return (
      <View style={styles.packageCards}>
        {availablePackages.map((pkgName) => {
          const pkgDetails = getPackageDetails(pkgName);
          const isSelected = formData.package === pkgName;
          
          return (
            <TouchableOpacity
              key={pkgName}
              style={[
                styles.packageCard,
                isSelected && styles.selectedPackageCard,
                { borderLeftColor: getPackageColor(pkgName) }
              ]}
              onPress={() => setFormData({ ...formData, package: pkgName })}
            >
              <View style={styles.packageHeader}>
                <Text style={[
                  styles.packageName,
                  { color: getPackageColor(pkgName) }
                ]}>
                  {pkgName}
                </Text>
                <Text style={styles.packagePrice}>
                  ${pkgDetails.price}/{pkgDetails.duration}
                </Text>
              </View>
              <View style={styles.packageFeatures}>
                {pkgDetails.features.slice(0, 3).map((feature, index) => (
                  <Text key={index} style={styles.packageFeature}>
                    • {feature}
                  </Text>
                ))}
                {pkgDetails.features.length > 3 && (
                  <Text style={styles.packageFeatureMore}>
                    +{pkgDetails.features.length - 3} more features
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  const renderClientItem = (client) => {
    const packageDetails = client.package ? getPackageDetails(client.package) : null;
    
    return (
      <Card style={styles.clientCard}>
        <View style={styles.clientHeader}>
          <View style={styles.clientInfo}>
            <Text style={styles.clientName}>{client.name}</Text>
            <Text style={styles.clientEmail}>{client.email}</Text>
            {client.company && (
              <Text style={styles.clientCompany}>{client.company}</Text>
            )}
          </View>
          <View style={styles.clientStatus}>
            <Text style={[
              styles.statusText,
              { color: client.status === 'Active' ? colors.success : colors.gray400 }
            ]}>
              {client.status}
            </Text>
          </View>
        </View>

        <View style={styles.packageInfo}>
          {client.package ? (
            <View style={styles.currentPackage}>
              <Text style={styles.currentPackageLabel}>Current Package:</Text>
              <View style={[
                styles.packageBadge,
                { backgroundColor: getPackageColor(client.package) }
              ]}>
                <Text style={styles.packageBadgeText}>{client.package}</Text>
              </View>
              {packageDetails && (
                <Text style={styles.packagePrice}>
                  ${packageDetails.price}/{packageDetails.duration}
                </Text>
              )}
              {client.packageAssignedAt && (
                <Text style={styles.packageAssignedDate}>
                  Assigned: {new Date(client.packageAssignedAt).toLocaleDateString()}
                </Text>
              )}
            </View>
          ) : (
            <View style={styles.noPackage}>
              <Text style={styles.noPackageText}>No package assigned</Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={styles.updateButton}
          onPress={() => openPackageModal(client)}
        >
          <Text style={styles.updateButtonText}>Update Package</Text>
        </TouchableOpacity>
      </Card>
    );
  };

  if (loading) {
    return <Loading fullScreen message="Loading package management..." />;
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
          <Text style={styles.headerTitle}>Package Management</Text>
          <Text style={styles.headerSubtitle}>
            Manage client subscriptions and packages
          </Text>
        </Card>

        {error && (
          <Card style={styles.errorCard}>
            <Text style={styles.errorText}>{error}</Text>
          </Card>
        )}

        {/* Package Overview */}
        <Card style={styles.overviewCard}>
          <Text style={styles.cardTitle}>Available Packages</Text>
          <View style={styles.packageOverview}>
            {packageApi.getAvailablePackages().map((pkgName) => {
              const pkgDetails = getPackageDetails(pkgName);
              return (
                <View key={pkgName} style={styles.overviewItem}>
                  <View style={[
                    styles.overviewDot,
                    { backgroundColor: getPackageColor(pkgName) }
                  ]} />
                  <View style={styles.overviewContent}>
                    <Text style={styles.overviewName}>{pkgName}</Text>
                    <Text style={styles.overviewPrice}>
                      ${pkgDetails.price}/{pkgDetails.duration}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </Card>

        {/* Clients List */}
        <Card style={styles.clientsCard}>
          <Text style={styles.cardTitle}>
            Clients ({clients.length})
          </Text>
          {clients.length === 0 ? (
            <EmptyState
              title="No clients found"
              message="No clients have been added to the system yet."
            />
          ) : (
            clients.map((client) => renderClientItem(client))
          )}
        </Card>
      </ScrollView>

      {/* Package Update Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeModal}
      >
        <SafeAreaView style={commonStyles.safeArea}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Update Package</Text>
              <TouchableOpacity onPress={closeModal}>
                <Text style={styles.modalClose}>×</Text>
              </TouchableOpacity>
            </View>

            {selectedClient && (
              <View style={styles.modalContent}>
                <View style={styles.selectedClient}>
                  <Text style={styles.selectedClientLabel}>Client:</Text>
                  <Text style={styles.selectedClientName}>{selectedClient.name}</Text>
                  <Text style={styles.selectedClientEmail}>{selectedClient.email}</Text>
                </View>

                {error && (
                  <View style={styles.modalError}>
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                )}

                <Text style={styles.modalSectionTitle}>Select Package:</Text>
                {renderPackageCard()}

                <View style={styles.modalActions}>
                  <Button
                    title="Cancel"
                    onPress={closeModal}
                    style={styles.cancelButton}
                  />
                  <Button
                    title="Update Package"
                    onPress={handleUpdatePackage}
                    loading={submitting}
                    disabled={submitting}
                  />
                </View>
              </View>
            )}
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.md,
  },
  headerCard: {
    marginBottom: spacing.md,
    padding: spacing.lg,
  },
  headerTitle: {
    fontSize: typography.fontSizes['2xl'],
    fontWeight: typography.fontWeights.bold,
    color: colors.white,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: typography.fontSizes.md,
    color: colors.gray300,
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
  overviewCard: {
    marginBottom: spacing.md,
  },
  cardTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
    color: colors.white,
    marginBottom: spacing.md,
  },
  packageOverview: {
    gap: spacing.sm,
  },
  overviewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    backgroundColor: colors.navyLight,
    borderRadius: borderRadius.md,
  },
  overviewDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: spacing.sm,
  },
  overviewContent: {
    flex: 1,
  },
  overviewName: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.semibold,
    color: colors.white,
  },
  overviewPrice: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray300,
  },
  clientsCard: {
    marginBottom: spacing.md,
  },
  clientCard: {
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
    fontSize: typography.fontSizes.md,
    color: colors.gray300,
    marginBottom: spacing.xs,
  },
  clientCompany: {
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
    padding: spacing.md,
    backgroundColor: colors.navyLight,
    borderRadius: borderRadius.md,
  },
  currentPackageLabel: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray300,
    marginBottom: spacing.sm,
  },
  packageBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.sm,
  },
  packageBadgeText: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.bold,
    color: colors.white,
  },
  packagePrice: {
    fontSize: typography.fontSizes.md,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  packageAssignedDate: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray400,
  },
  noPackage: {
    padding: spacing.md,
    backgroundColor: 'rgba(156, 163, 175, 0.1)',
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  noPackageText: {
    fontSize: typography.fontSizes.md,
    color: colors.gray400,
  },
  updateButton: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  updateButtonText: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.semibold,
    color: colors.white,
  },
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
    borderBottomColor: colors.gray700,
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
  selectedClient: {
    padding: spacing.md,
    backgroundColor: colors.navyLight,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  selectedClientLabel: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray300,
    marginBottom: spacing.xs,
  },
  selectedClientName: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
    color: colors.white,
    marginBottom: spacing.xs,
  },
  selectedClientEmail: {
    fontSize: typography.fontSizes.md,
    color: colors.gray300,
  },
  modalError: {
    marginBottom: spacing.md,
  },
  modalSectionTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
    color: colors.white,
    marginBottom: spacing.md,
  },
  packageCards: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  packageCard: {
    padding: spacing.md,
    backgroundColor: colors.navyLight,
    borderRadius: borderRadius.md,
    borderLeftWidth: 4,
  },
  selectedPackageCard: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
  },
  packageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  packageName: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
  },
  packagePrice: {
    fontSize: typography.fontSizes.md,
    color: colors.primary,
    fontWeight: typography.fontWeights.semibold,
  },
  packageFeatures: {
    gap: spacing.xs,
  },
  packageFeature: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray300,
  },
  packageFeatureMore: {
    fontSize: typography.fontSizes.sm,
    color: colors.primary,
    fontStyle: 'italic',
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: 'auto',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: colors.gray700,
  },
});

export default PackageManagementScreen;
