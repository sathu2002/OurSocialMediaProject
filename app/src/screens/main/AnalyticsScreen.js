import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  Modal,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { analyticsApi, clientApi } from '../../api';
import { Card, Button, Input, Loading, EmptyState } from '../../components';
import SimpleChart from '../../components/SimpleChart';
import StatsCard from '../../components/StatsCard';
import { colors, typography, spacing, commonStyles } from '../../styles/theme';

const AnalyticsScreen = () => {
  const { hasRole } = useAuth();
  const [campaigns, setCampaigns] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [summary, setSummary] = useState({
    totalCampaigns: 0,
    totalReach: 0,
    totalEngagement: 0,
    totalClicks: 0,
    totalConversions: 0,
    avgEngagementRate: 0,
    avgConversionRate: 0,
  });

  // Modal states
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    client: '',
    startDate: new Date(),
    endDate: new Date(),
    budget: '',
    targetAudience: '',
    platform: 'Social Media',
    status: 'Active',
  });

  const fetchCampaigns = useCallback(async () => {
    try {
      setError('');
      const response = await analyticsApi.getCampaigns();
      setCampaigns(response || []);
      
      // Calculate summary
      const campaignsData = response || [];
      const totalReach = campaignsData.reduce((sum, c) => sum + (c.reach || 0), 0);
      const totalEngagement = campaignsData.reduce((sum, c) => sum + (c.engagement || 0), 0);
      const totalClicks = campaignsData.reduce((sum, c) => sum + (c.clicks || 0), 0);
      const totalConversions = campaignsData.reduce((sum, c) => sum + (c.conversions || 0), 0);
      
      setSummary({
        totalCampaigns: campaignsData.length,
        totalReach,
        totalEngagement,
        totalClicks,
        totalConversions,
        avgEngagementRate: totalReach > 0 ? ((totalEngagement / totalReach) * 100).toFixed(1) : 0,
        avgConversionRate: totalClicks > 0 ? ((totalConversions / totalClicks) * 100).toFixed(1) : 0,
      });
    } catch (error) {
      console.log('Campaigns error:', error);
      setError(error.message || 'Failed to load campaigns');
    }
  }, []);

  const fetchClients = useCallback(async () => {
    try {
      if (hasRole(['Admin', 'Manager'])) {
        const response = await clientApi.getClients();
        setClients(response || []);
      }
    } catch (error) {
      console.log('Clients error:', error);
    }
  }, [hasRole]);

  const loadData = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchCampaigns(), fetchClients()]);
    setLoading(false);
  }, [fetchCampaigns, fetchClients]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchCampaigns(), fetchClients()]);
    setRefreshing(false);
  }, [fetchCampaigns, fetchClients]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      client: '',
      startDate: new Date(),
      endDate: new Date(),
      budget: '',
      targetAudience: '',
      platform: 'Social Media',
      status: 'Active',
    });
    setError('');
  };

  const openAddModal = () => {
    resetForm();
    setAddModalVisible(true);
  };

  const openEditModal = (campaign) => {
    setSelectedCampaign(campaign);
    setFormData({
      name: campaign.name || '',
      description: campaign.description || '',
      client: campaign.client || '',
      startDate: campaign.startDate ? new Date(campaign.startDate) : new Date(),
      endDate: campaign.endDate ? new Date(campaign.endDate) : new Date(),
      budget: campaign.budget ? campaign.budget.toString() : '',
      targetAudience: campaign.targetAudience || '',
      platform: campaign.platform || 'Social Media',
      status: campaign.status || 'Active',
    });
    setEditModalVisible(true);
  };

  const openDetailsModal = (campaign) => {
    setSelectedCampaign(campaign);
    setDetailsModalVisible(true);
  };

  const closeModals = () => {
    setAddModalVisible(false);
    setEditModalVisible(false);
    setDetailsModalVisible(false);
    setSelectedCampaign(null);
    resetForm();
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Campaign name is required');
      return false;
    }
    if (!formData.client.trim()) {
      setError('Client is required');
      return false;
    }
    if (!formData.budget.trim()) {
      setError('Budget is required');
      return false;
    }
    const budget = parseFloat(formData.budget);
    if (isNaN(budget) || budget <= 0) {
      setError('Budget must be a positive number');
      return false;
    }
    if (formData.startDate >= formData.endDate) {
      setError('End date must be after start date');
      return false;
    }
    return true;
  };

  const handleAddCampaign = async () => {
    if (!validateForm()) return;

    setSubmitting(true);
    setError('');

    try {
      const campaignData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        client: formData.client.trim(),
        startDate: formData.startDate.toISOString(),
        endDate: formData.endDate.toISOString(),
        budget: parseFloat(formData.budget),
        targetAudience: formData.targetAudience.trim(),
        platform: formData.platform,
        status: formData.status,
      };

      const result = await analyticsApi.createCampaign(campaignData);

      if (result.success || result.data) {
        Alert.alert('Success', 'Campaign created successfully');
        closeModals();
        await fetchCampaigns();
      } else {
        setError(result.error || 'Failed to create campaign');
      }
    } catch (error) {
      setError(error.message || 'Failed to create campaign');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditCampaign = async () => {
    if (!validateForm()) return;

    setSubmitting(true);
    setError('');

    try {
      const campaignData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        client: formData.client.trim(),
        startDate: formData.startDate.toISOString(),
        endDate: formData.endDate.toISOString(),
        budget: parseFloat(formData.budget),
        targetAudience: formData.targetAudience.trim(),
        platform: formData.platform,
        status: formData.status,
      };

      const result = await analyticsApi.updateCampaign(selectedCampaign._id, campaignData);

      if (result.success || result.data) {
        Alert.alert('Success', 'Campaign updated successfully');
        closeModals();
        await fetchCampaigns();
      } else {
        setError(result.error || 'Failed to update campaign');
      }
    } catch (error) {
      setError(error.message || 'Failed to update campaign');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCampaign = (campaign) => {
    Alert.alert(
      'Delete Campaign',
      `Are you sure you want to delete "${campaign.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await analyticsApi.deleteCampaign(campaign._id);
              if (result.success || result.data) {
                Alert.alert('Success', 'Campaign deleted successfully');
                await fetchCampaigns();
              } else {
                Alert.alert('Error', result.error || 'Failed to delete campaign');
              }
            } catch (error) {
              Alert.alert('Error', error.message || 'Failed to delete campaign');
            }
          },
        },
      ]
    );
  };

  useEffect(() => {
    loadData();
  }, []);

  const formatCurrency = (amount) => {
    return `$${(amount || 0).toLocaleString()}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return colors.success;
      case 'Completed': return colors.info;
      case 'Paused': return colors.warning;
      case 'Cancelled': return colors.error;
      default: return colors.gray400;
    }
  };

  if (loading) {
    return <Loading fullScreen message="Loading analytics..." />;
  }

  const renderCampaignItem = ({ item }) => (
    <Card key={item._id} style={styles.campaignCard}>
      <View style={styles.campaignHeader}>
        <View style={styles.campaignInfo}>
          <Text style={styles.campaignName}>{item.name}</Text>
          <Text style={styles.campaignClient}>
            {item.clientName || (typeof item.client === 'object' ? item.client.name : item.client)}
          </Text>
        </View>
        <View style={styles.campaignStatus}>
          <Text style={[
            styles.statusText,
            { color: getStatusColor(item.status) }
          ]}>
            {item.status}
          </Text>
        </View>
      </View>

      <View style={styles.campaignMetrics}>
        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>Reach:</Text>
          <Text style={styles.metricValue}>{(item.reach || 0).toLocaleString()}</Text>
        </View>
        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>Engagement:</Text>
          <Text style={styles.metricValue}>{(item.engagement || 0).toLocaleString()}</Text>
        </View>
        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>Clicks:</Text>
          <Text style={styles.metricValue}>{(item.clicks || 0).toLocaleString()}</Text>
        </View>
        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>Conversions:</Text>
          <Text style={styles.metricValue}>{(item.conversions || 0).toLocaleString()}</Text>
        </View>
      </View>

      <View style={styles.campaignActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => openDetailsModal(item)}
        >
          <Text style={styles.actionButtonText}>View</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => openEditModal(item)}
        >
          <Text style={styles.actionButtonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteCampaign(item)}
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
                {isEdit ? 'Edit Campaign' : 'Create Campaign'}
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
                label="Campaign Name"
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                placeholder="Enter campaign name"
                style={styles.modalInput}
              />

              <Input
                label="Client"
                value={formData.client}
                onChangeText={(text) => setFormData({ ...formData, client: text })}
                placeholder="Enter client name"
                style={styles.modalInput}
              />

              <Input
                label="Description"
                value={formData.description}
                onChangeText={(text) => setFormData({ ...formData, description: text })}
                placeholder="Enter campaign description"
                multiline
                numberOfLines={3}
                style={styles.modalInput}
              />

              <Input
                label="Budget"
                value={formData.budget}
                onChangeText={(text) => setFormData({ ...formData, budget: text })}
                placeholder="Enter budget amount"
                keyboardType="numeric"
                style={styles.modalInput}
              />

              <Input
                label="Target Audience"
                value={formData.targetAudience}
                onChangeText={(text) => setFormData({ ...formData, targetAudience: text })}
                placeholder="Enter target audience"
                style={styles.modalInput}
              />

              <View style={styles.modalInput}>
                <Text style={styles.inputLabel}>Platform</Text>
                <View style={styles.platformOptions}>
                  {['Social Media', 'Email', 'Website', 'Mobile App'].map((platform) => (
                    <TouchableOpacity
                      key={platform}
                      style={[
                        styles.platformOption,
                        formData.platform === platform && styles.selectedPlatformOption,
                      ]}
                      onPress={() => setFormData({ ...formData, platform })}
                    >
                      <Text style={styles.platformOptionText}>{platform}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.modalInput}>
                <Text style={styles.inputLabel}>Status</Text>
                <View style={styles.statusOptions}>
                  {['Active', 'Paused', 'Completed', 'Cancelled'].map((status) => (
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
                title={isEdit ? 'Update Campaign' : 'Create Campaign'}
                onPress={isEdit ? handleEditCampaign : handleAddCampaign}
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
            <Text style={styles.modalTitle}>Campaign Details</Text>
            <TouchableOpacity onPress={closeModals}>
              <Text style={styles.modalClose}>×</Text>
            </TouchableOpacity>
          </View>

          {selectedCampaign && (
            <ScrollView style={styles.modalContent}>
              <Card style={styles.detailsCard}>
                <Text style={styles.detailsTitle}>Campaign Information</Text>
                <View style={styles.detailsRow}>
                  <Text style={styles.detailsLabel}>Name:</Text>
                  <Text style={styles.detailsValue}>{selectedCampaign.name}</Text>
                </View>
                <View style={styles.detailsRow}>
                  <Text style={styles.detailsLabel}>Client:</Text>
                  <Text style={styles.detailsValue}>
                    {selectedCampaign.clientName || (typeof selectedCampaign.client === 'object' 
                      ? selectedCampaign.client.name 
                      : selectedCampaign.client)}
                  </Text>
                </View>
                <View style={styles.detailsRow}>
                  <Text style={styles.detailsLabel}>Status:</Text>
                  <Text style={[
                    styles.statusText,
                    { color: getStatusColor(selectedCampaign.status) }
                  ]}>
                    {selectedCampaign.status}
                  </Text>
                </View>
                <View style={styles.detailsRow}>
                  <Text style={styles.detailsLabel}>Platform:</Text>
                  <Text style={styles.detailsValue}>{selectedCampaign.platform}</Text>
                </View>
                {selectedCampaign.description && (
                  <View style={styles.detailsRow}>
                    <Text style={styles.detailsLabel}>Description:</Text>
                    <Text style={styles.detailsValue}>{selectedCampaign.description}</Text>
                  </View>
                )}
              </Card>

              <Card style={styles.detailsCard}>
                <Text style={styles.detailsTitle}>Performance Metrics</Text>
                <View style={styles.detailsRow}>
                  <Text style={styles.detailsLabel}>Reach:</Text>
                  <Text style={styles.detailsValue}>{(selectedCampaign.reach || 0).toLocaleString()}</Text>
                </View>
                <View style={styles.detailsRow}>
                  <Text style={styles.detailsLabel}>Engagement:</Text>
                  <Text style={styles.detailsValue}>{(selectedCampaign.engagement || 0).toLocaleString()}</Text>
                </View>
                <View style={styles.detailsRow}>
                  <Text style={styles.detailsLabel}>Clicks:</Text>
                  <Text style={styles.detailsValue}>{(selectedCampaign.clicks || 0).toLocaleString()}</Text>
                </View>
                <View style={styles.detailsRow}>
                  <Text style={styles.detailsLabel}>Conversions:</Text>
                  <Text style={styles.detailsValue}>{(selectedCampaign.conversions || 0).toLocaleString()}</Text>
                </View>
                <View style={styles.detailsRow}>
                  <Text style={styles.detailsLabel}>Budget:</Text>
                  <Text style={styles.detailsValue}>{formatCurrency(selectedCampaign.budget)}</Text>
                </View>
              </Card>

              <View style={styles.detailsActions}>
                <Button
                  title="Edit Campaign"
                  onPress={() => {
                    closeModals();
                    openEditModal(selectedCampaign);
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
          <Text style={styles.headerTitle}>Campaign Analytics</Text>
          <Text style={styles.headerSubtitle}>
            Track and manage marketing campaigns
          </Text>
          <Button
            title="Create Campaign"
            onPress={openAddModal}
            style={styles.addButton}
          />
        </Card>

        {error && (
          <Card style={styles.errorCard}>
            <Text style={styles.errorText}>{error}</Text>
          </Card>
        )}

        {/* Statistics Cards */}
        <View style={styles.statsGrid}>
          <StatsCard
            title="Total Campaigns"
            value={summary.totalCampaigns}
            color={colors.primary}
          />
          <StatsCard
            title="Total Reach"
            value={summary.totalReach.toLocaleString()}
            color={colors.info}
          />
          <StatsCard
            title="Total Engagement"
            value={summary.totalEngagement.toLocaleString()}
            color={colors.success}
          />
          <StatsCard
            title="Total Conversions"
            value={summary.totalConversions.toLocaleString()}
            color={colors.warning}
          />
        </View>

        {/* Charts */}
        {campaigns.length > 0 && (
          <>
            <SimpleChart
              title="Campaign Performance"
              type="bar"
              data={campaigns.slice(0, 5).map(campaign => ({
                label: campaign.name.substring(0, 15),
                value: campaign.engagement || 0,
              }))}
              color={colors.primary}
              height={200}
            />

            <SimpleChart
              title="Reach Distribution"
              type="pie"
              data={campaigns.slice(0, 4).map(campaign => ({
                label: campaign.name.substring(0, 10),
                value: campaign.reach || 0,
              }))}
              color={colors.info}
              height={200}
            />
          </>
        )}

        {/* Campaigns List */}
        <Card style={styles.campaignsCard}>
          <Text style={styles.cardTitle}>
            Campaigns ({campaigns.length})
          </Text>
          {campaigns.length === 0 ? (
            <EmptyState
              title="No campaigns found"
              message="No campaigns have been created yet."
            />
          ) : (
            campaigns.map(renderCampaignItem)
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
    borderRadius: spacing.lg,
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
    borderRadius: spacing.lg,
  },
  errorText: {
    color: colors.error,
    fontSize: typography.fontSizes.md,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  campaignsCard: {
    backgroundColor: colors.navy,
    borderRadius: spacing.lg,
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
  campaignCard: {
    backgroundColor: colors.navyLight,
    borderRadius: spacing.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  campaignHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  campaignInfo: {
    flex: 1,
  },
  campaignName: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
    color: colors.white,
    marginBottom: spacing.xs,
  },
  campaignClient: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray300,
  },
  campaignStatus: {
    alignItems: 'flex-end',
  },
  statusText: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.semibold,
  },
  campaignMetrics: {
    marginBottom: spacing.md,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  metricLabel: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray300,
  },
  metricValue: {
    fontSize: typography.fontSizes.sm,
    color: colors.white,
    fontWeight: typography.fontWeights.semibold,
  },
  campaignActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: spacing.sm,
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
    borderRadius: spacing.md,
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
  platformOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  platformOption: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.navyLight,
    borderRadius: spacing.sm,
    borderWidth: 1,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  selectedPlatformOption: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
  },
  platformOptionText: {
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
    borderRadius: spacing.sm,
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
    borderRadius: spacing.md,
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

export default AnalyticsScreen;
