import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { analyticsApi, clientApi } from '../../api';
import { Button, Card, EmptyState, Input, Loading, SimpleChart, StatsCard } from '../../components';
import { colors, typography, spacing, borderRadius, commonStyles } from '../../styles/theme';

const PLATFORMS = ['Facebook', 'Instagram', 'LinkedIn', 'Google', 'TikTok', 'Other'];

const emptyForm = {
  clientId: '',
  campaignName: '',
  platform: 'Facebook',
  reportMonth: new Date().toISOString().slice(0, 7),
  reach: '',
  impressions: '',
  engagement: '',
  clicks: '',
  conversions: '',
};

const toNumberOrZero = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const AnalyticsScreen = () => {
  const [records, setRecords] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [searchText, setSearchText] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const filteredRecords = useMemo(() => {
    const query = searchText.trim().toLowerCase();
    if (!query) return records;

    return records.filter((record) => {
      const clientName = record.clientId?.name || '';
      return (
        record.campaignName?.toLowerCase().includes(query) ||
        record.platform?.toLowerCase().includes(query) ||
        clientName.toLowerCase().includes(query) ||
        record.reportMonth?.toLowerCase().includes(query)
      );
    });
  }, [records, searchText]);

  const summary = useMemo(() => {
    return records.reduce((acc, record) => {
      acc.totalReach += toNumberOrZero(record.reach);
      acc.totalImpressions += toNumberOrZero(record.impressions);
      acc.totalEngagement += toNumberOrZero(record.engagement);
      acc.totalClicks += toNumberOrZero(record.clicks);
      acc.totalConversions += toNumberOrZero(record.conversions);
      return acc;
    }, {
      totalReach: 0,
      totalImpressions: 0,
      totalEngagement: 0,
      totalClicks: 0,
      totalConversions: 0,
    });
  }, [records]);

  const chartData = useMemo(() => {
    return filteredRecords.slice(0, 5).map((record) => ({
      label: record.campaignName?.slice(0, 10) || 'Campaign',
      value: toNumberOrZero(record.reach),
    }));
  }, [filteredRecords]);

  const fetchData = useCallback(async () => {
    try {
      setError('');
      const [analyticsResponse, clientsResponse] = await Promise.all([
        analyticsApi.getAnalytics(),
        clientApi.getClients(),
      ]);

      setRecords(analyticsResponse || []);
      setClients(clientsResponse || []);
    } catch (fetchError) {
      console.log('Analytics screen error:', fetchError);
      setError(fetchError.message || 'Failed to load analytics data');
    }
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    await fetchData();
    setLoading(false);
  }, [fetchData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingRecord(null);
    setError('');
  };

  const openAddModal = () => {
    resetForm();
    setModalVisible(true);
  };

  const openEditModal = (record) => {
    setEditingRecord(record);
    setFormData({
      clientId: record.clientId?._id || record.clientId || '',
      campaignName: record.campaignName || '',
      platform: record.platform || 'Facebook',
      reportMonth: record.reportMonth || new Date().toISOString().slice(0, 7),
      reach: String(record.reach ?? ''),
      impressions: String(record.impressions ?? ''),
      engagement: String(record.engagement ?? ''),
      clicks: String(record.clicks ?? ''),
      conversions: String(record.conversions ?? ''),
    });
    setError('');
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    resetForm();
  };

  const validateForm = () => {
    if (!formData.clientId) {
      setError('Client is required');
      return false;
    }

    if (!formData.campaignName.trim()) {
      setError('Campaign name is required');
      return false;
    }

    if (!/^\d{4}-\d{2}$/.test(formData.reportMonth)) {
      setError('Report month must be in YYYY-MM format');
      return false;
    }

    const numericFields = ['reach', 'impressions', 'engagement', 'clicks', 'conversions'];
    for (const field of numericFields) {
      if (formData[field] && Number(formData[field]) < 0) {
        setError(`${field} must be zero or greater`);
        return false;
      }
    }

    return true;
  };

  const buildPayload = () => ({
    clientId: formData.clientId,
    campaignName: formData.campaignName.trim(),
    platform: formData.platform,
    reportMonth: formData.reportMonth,
    reach: toNumberOrZero(formData.reach),
    impressions: toNumberOrZero(formData.impressions),
    engagement: toNumberOrZero(formData.engagement),
    clicks: toNumberOrZero(formData.clicks),
    conversions: toNumberOrZero(formData.conversions),
  });

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setSubmitting(true);
    setError('');
    try {
      const payload = buildPayload();
      if (editingRecord) {
        await analyticsApi.updateAnalytics(editingRecord._id, payload);
        Alert.alert('Success', 'Analytics record updated successfully');
      } else {
        await analyticsApi.createAnalytics(payload);
        Alert.alert('Success', 'Analytics record created successfully');
      }

      closeModal();
      await fetchData();
    } catch (submitError) {
      setError(submitError.message || 'Failed to save analytics record');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (record) => {
    Alert.alert(
      'Delete Analytics Record',
      `Delete ${record.campaignName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await analyticsApi.deleteAnalytics(record._id);
              Alert.alert('Success', 'Analytics record deleted successfully');
              await fetchData();
            } catch (deleteError) {
              Alert.alert('Error', deleteError.message || 'Failed to delete analytics record');
            }
          },
        },
      ],
    );
  };

  if (loading) {
    return <Loading fullScreen message="Loading analytics..." />;
  }

  return (
    <SafeAreaView style={commonStyles.safeArea}>
      <ScrollView
        style={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Card style={styles.headerCard}>
          <Text style={styles.headerTitle}>Analytics Dashboard</Text>
          <Text style={styles.headerSubtitle}>
            Manage campaign analytics with live backend data
          </Text>
          <Button title="Add Record" onPress={openAddModal} style={styles.headerButton} />
        </Card>

        {error ? (
          <Card style={styles.errorCard}>
            <Text style={styles.errorText}>{error}</Text>
          </Card>
        ) : null}

        <View style={styles.statsGrid}>
          <StatsCard title="Reach" value={summary.totalReach} color={colors.primary} icon="R" />
          <StatsCard title="Engagement" value={summary.totalEngagement} color={colors.success} icon="E" />
          <StatsCard title="Clicks" value={summary.totalClicks} color={colors.warning} icon="C" />
          <StatsCard title="Conversions" value={summary.totalConversions} color={colors.info} icon="V" />
        </View>

        <SimpleChart
          title="Campaign Reach"
          data={chartData}
          type="bar"
          color={colors.primary}
          height={220}
        />

        <Card style={styles.filterCard}>
          <Input
            placeholder="Search by campaign, client, month, or platform"
            value={searchText}
            onChangeText={setSearchText}
          />
        </Card>

        <Card style={styles.listCard}>
          <Text style={styles.sectionTitle}>Analytics Records ({filteredRecords.length})</Text>
          {filteredRecords.length === 0 ? (
            <EmptyState
              title="No analytics records"
              message={records.length === 0 ? 'Create your first analytics record.' : 'No records match your search.'}
              actionLabel="Add Record"
              onAction={openAddModal}
            />
          ) : (
            filteredRecords.map((record) => (
              <Card key={record._id} style={styles.recordCard}>
                <View style={styles.recordHeader}>
                  <View style={styles.recordHeaderText}>
                    <Text style={styles.recordTitle}>{record.campaignName}</Text>
                    <Text style={styles.recordSubtitle}>
                      {record.clientId?.name || 'Unknown Client'} • {record.platform || 'Other'}
                    </Text>
                  </View>
                  <Text style={styles.recordMonth}>{record.reportMonth}</Text>
                </View>

                <View style={styles.metricsRow}>
                  <Text style={styles.metricText}>Reach: {toNumberOrZero(record.reach)}</Text>
                  <Text style={styles.metricText}>Impressions: {toNumberOrZero(record.impressions)}</Text>
                </View>
                <View style={styles.metricsRow}>
                  <Text style={styles.metricText}>Engagement: {toNumberOrZero(record.engagement)}</Text>
                  <Text style={styles.metricText}>Clicks: {toNumberOrZero(record.clicks)}</Text>
                </View>
                <Text style={styles.metricText}>Conversions: {toNumberOrZero(record.conversions)}</Text>

                <View style={styles.actionsRow}>
                  <Button title="Edit" variant="outline" size="sm" onPress={() => openEditModal(record)} style={styles.actionButton} />
                  <Button title="Delete" variant="danger" size="sm" onPress={() => handleDelete(record)} style={styles.actionButton} />
                </View>
              </Card>
            ))
          )}
        </Card>
      </ScrollView>

      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={closeModal}>
        <SafeAreaView style={commonStyles.safeArea}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingRecord ? 'Edit Analytics Record' : 'Add Analytics Record'}</Text>
              <TouchableOpacity onPress={closeModal}>
                <Text style={styles.modalClose}>x</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {error ? (
                <Card style={styles.errorCard}>
                  <Text style={styles.errorText}>{error}</Text>
                </Card>
              ) : null}

              <View style={styles.selectorGroup}>
                <Text style={styles.selectorLabel}>Client</Text>
                <View style={styles.selectorOptions}>
                  {clients.map((client) => (
                    <TouchableOpacity
                      key={client._id}
                      style={[styles.selectorChip, formData.clientId === client._id && styles.selectorChipActive]}
                      onPress={() => setFormData((current) => ({ ...current, clientId: client._id }))}
                    >
                      <Text style={styles.selectorChipText}>{client.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <Input
                label="Campaign Name"
                value={formData.campaignName}
                onChangeText={(text) => setFormData((current) => ({ ...current, campaignName: text }))}
                placeholder="Spring growth campaign"
              />

              <View style={styles.selectorGroup}>
                <Text style={styles.selectorLabel}>Platform</Text>
                <View style={styles.selectorOptions}>
                  {PLATFORMS.map((platform) => (
                    <TouchableOpacity
                      key={platform}
                      style={[styles.selectorChip, formData.platform === platform && styles.selectorChipActive]}
                      onPress={() => setFormData((current) => ({ ...current, platform }))}
                    >
                      <Text style={styles.selectorChipText}>{platform}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <Input
                label="Report Month"
                value={formData.reportMonth}
                onChangeText={(text) => setFormData((current) => ({ ...current, reportMonth: text }))}
                placeholder="YYYY-MM"
                helper="Example: 2026-05"
              />

              <Input label="Reach" value={formData.reach} onChangeText={(text) => setFormData((current) => ({ ...current, reach: text }))} keyboardType="numeric" />
              <Input label="Impressions" value={formData.impressions} onChangeText={(text) => setFormData((current) => ({ ...current, impressions: text }))} keyboardType="numeric" />
              <Input label="Engagement" value={formData.engagement} onChangeText={(text) => setFormData((current) => ({ ...current, engagement: text }))} keyboardType="numeric" />
              <Input label="Clicks" value={formData.clicks} onChangeText={(text) => setFormData((current) => ({ ...current, clicks: text }))} keyboardType="numeric" />
              <Input label="Conversions" value={formData.conversions} onChangeText={(text) => setFormData((current) => ({ ...current, conversions: text }))} keyboardType="numeric" />
            </ScrollView>

            <View style={styles.modalActions}>
              <Button title="Cancel" variant="outline" onPress={closeModal} style={styles.modalActionButton} />
              <Button title={editingRecord ? 'Update' : 'Create'} onPress={handleSubmit} loading={submitting} style={styles.modalActionButton} />
            </View>
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
  headerButton: {
    alignSelf: 'flex-start',
  },
  errorCard: {
    marginBottom: spacing.md,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: colors.error,
  },
  errorText: {
    color: colors.error,
    fontSize: typography.fontSizes.sm,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  filterCard: {
    marginBottom: spacing.md,
  },
  listCard: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  recordCard: {
    marginBottom: spacing.md,
    backgroundColor: colors.gray50,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  recordHeaderText: {
    flex: 1,
    marginRight: spacing.md,
  },
  recordTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    color: colors.textPrimary,
  },
  recordSubtitle: {
    fontSize: typography.fontSizes.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  recordMonth: {
    fontSize: typography.fontSizes.sm,
    color: colors.primary,
    fontWeight: typography.fontWeights.semibold,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  metricText: {
    fontSize: typography.fontSizes.sm,
    color: colors.textPrimary,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  actionButton: {
    flex: 1,
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
    borderBottomColor: colors.navyLight,
  },
  modalTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
    color: colors.white,
  },
  modalClose: {
    fontSize: typography.fontSizes.xl,
    color: colors.gray300,
  },
  modalBody: {
    flex: 1,
    padding: spacing.md,
  },
  selectorGroup: {
    marginBottom: spacing.md,
  },
  selectorLabel: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.semibold,
    color: colors.white,
    marginBottom: spacing.sm,
  },
  selectorOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  selectorChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.navyLight,
    borderWidth: 1,
    borderColor: colors.gray700,
  },
  selectorChipActive: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(37, 99, 235, 0.2)',
  },
  selectorChipText: {
    color: colors.white,
    fontSize: typography.fontSizes.sm,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.navyLight,
  },
  modalActionButton: {
    flex: 1,
  },
});

export default AnalyticsScreen;
