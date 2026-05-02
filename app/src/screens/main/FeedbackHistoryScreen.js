import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { feedbackApi, clientApi } from '../../api';
import { Card, Button, Input, Loading, EmptyState } from '../../components';
import FeedbackCard from '../../components/FeedbackCard';
import FilterTabs from '../../components/FilterTabs';
import { colors, typography, spacing, borderRadius, commonStyles } from '../../styles/theme';

const FeedbackHistoryScreen = () => {
  const { hasRole } = useAuth();
  const canManageAllFeedback = hasRole(['Admin', 'Manager', 'Staff']);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [feedback, setFeedback] = useState([]);
  const [filteredFeedback, setFilteredFeedback] = useState([]);
  const [clients, setClients] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [sentimentFilter, setSentimentFilter] = useState('all');
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    positive: 0,
    neutral: 0,
    negative: 0,
  });

  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    clientId: '',
    campaignName: '',
    rating: 5,
    comment: '',
  });

  const fetchFeedback = useCallback(async () => {
    try {
      setError('');
      const response = canManageAllFeedback
        ? await feedbackApi.getFeedback()
        : await feedbackApi.getMyFeedback();

      const feedbackData = response || [];
      setFeedback(feedbackData);

      const total = feedbackData.length;
      const positive = feedbackData.filter((item) => item.sentiment?.toLowerCase() === 'positive').length;
      const neutral = feedbackData.filter((item) => item.sentiment?.toLowerCase() === 'neutral').length;
      const negative = feedbackData.filter((item) => item.sentiment?.toLowerCase() === 'negative').length;
      setStats({ total, positive, neutral, negative });
    } catch (fetchError) {
      console.log('Feedback error:', fetchError);
      setError(fetchError.message || 'Failed to load feedback');
    }
  }, [canManageAllFeedback]);

  const fetchClients = useCallback(async () => {
    if (!canManageAllFeedback) {
      setClients([]);
      return;
    }

    try {
      const response = await clientApi.getClients();
      setClients(response || []);
    } catch (fetchError) {
      console.log('Client list error:', fetchError);
      setError(fetchError.message || 'Failed to load clients');
    }
  }, [canManageAllFeedback]);

  const loadData = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchFeedback(), fetchClients()]);
    setLoading(false);
  }, [fetchClients, fetchFeedback]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchFeedback(), fetchClients()]);
    setRefreshing(false);
  }, [fetchClients, fetchFeedback]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    let filtered = [...feedback];

    if (searchText) {
      const normalizedSearch = searchText.toLowerCase();
      filtered = filtered.filter((item) =>
        (item.comment && item.comment.toLowerCase().includes(normalizedSearch)) ||
        (item.campaignName && item.campaignName.toLowerCase().includes(normalizedSearch)) ||
        (item.clientId?.name && item.clientId.name.toLowerCase().includes(normalizedSearch))
      );
    }

    if (sentimentFilter !== 'all') {
      filtered = filtered.filter((item) => item.sentiment?.toLowerCase() === sentimentFilter);
    }

    setFilteredFeedback(filtered);
  }, [feedback, searchText, sentimentFilter]);

  const resetForm = () => {
    setFormData({
      clientId: '',
      campaignName: '',
      rating: 5,
      comment: '',
    });
    setError('');
  };

  const openAddModal = () => {
    resetForm();
    setAddModalVisible(true);
  };

  const openEditModal = (feedbackItem) => {
    setSelectedFeedback(feedbackItem);
    setFormData({
      clientId:
        typeof feedbackItem.clientId === 'object'
          ? feedbackItem.clientId?._id || ''
          : feedbackItem.clientId || '',
      campaignName: feedbackItem.campaignName || '',
      rating: feedbackItem.rating || 5,
      comment: feedbackItem.comment || '',
    });
    setEditModalVisible(true);
  };

  const openDetailsModal = (feedbackItem) => {
    setSelectedFeedback(feedbackItem);
    setDetailsModalVisible(true);
  };

  const closeModals = () => {
    setAddModalVisible(false);
    setEditModalVisible(false);
    setDetailsModalVisible(false);
    setSelectedFeedback(null);
    resetForm();
  };

  const validateForm = () => {
    if (canManageAllFeedback && !formData.clientId) {
      setError('Please select a client');
      return false;
    }
    if (!formData.campaignName.trim()) {
      setError('Campaign name is required');
      return false;
    }
    if (!formData.comment.trim()) {
      setError('Comment is required');
      return false;
    }
    if (formData.comment.trim().length < 10) {
      setError('Comment must be at least 10 characters long');
      return false;
    }
    if (formData.rating < 1 || formData.rating > 5) {
      setError('Rating must be between 1 and 5');
      return false;
    }
    return true;
  };

  const buildPayload = () => ({
    clientId: canManageAllFeedback ? formData.clientId : undefined,
    campaignName: formData.campaignName.trim(),
    rating: formData.rating,
    comment: formData.comment.trim(),
  });

  const handleAddFeedback = async () => {
    if (!validateForm()) return;

    setSubmitting(true);
    setError('');

    try {
      const result = await feedbackApi.createFeedback(buildPayload());
      if (result.success || result.data) {
        Alert.alert('Success', 'Feedback added successfully');
        closeModals();
        await fetchFeedback();
      } else {
        setError(result.error || 'Failed to add feedback');
      }
    } catch (submitError) {
      setError(submitError.message || 'Failed to add feedback');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditFeedback = async () => {
    if (!validateForm() || !selectedFeedback) return;

    setSubmitting(true);
    setError('');

    try {
      const result = await feedbackApi.updateFeedback(selectedFeedback._id, buildPayload());
      if (result.success || result.data) {
        Alert.alert('Success', 'Feedback updated successfully');
        closeModals();
        await fetchFeedback();
      } else {
        setError(result.error || 'Failed to update feedback');
      }
    } catch (submitError) {
      setError(submitError.message || 'Failed to update feedback');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteFeedback = (feedbackItem) => {
    Alert.alert(
      'Delete Feedback',
      'Are you sure you want to delete this feedback?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await feedbackApi.deleteFeedback(feedbackItem._id);
              if (result.success || result.data) {
                Alert.alert('Success', 'Feedback deleted successfully');
                await fetchFeedback();
              } else {
                Alert.alert('Error', result.error || 'Failed to delete feedback');
              }
            } catch (deleteError) {
              Alert.alert('Error', deleteError.message || 'Failed to delete feedback');
            }
          },
        },
      ]
    );
  };

  const renderStars = (rating, onPress) => {
    const stars = [];
    for (let i = 1; i <= 5; i += 1) {
      stars.push(
        <TouchableOpacity
          key={i}
          onPress={() => onPress?.(i)}
          style={styles.starButton}
        >
          <Text style={[styles.star, i <= rating ? styles.filledStar : styles.emptyStar]}>
            {i <= rating ? '*' : 'o'}
          </Text>
        </TouchableOpacity>
      );
    }
    return stars;
  };

  const renderClientSelector = () => {
    if (!canManageAllFeedback) return null;

    return (
      <View style={styles.modalInput}>
        <Text style={styles.inputLabel}>Client</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.clientSelector}
        >
          {clients.map((client) => {
            const isSelected = formData.clientId === client._id;
            return (
              <TouchableOpacity
                key={client._id}
                style={[styles.clientChip, isSelected && styles.clientChipSelected]}
                onPress={() => setFormData((prev) => ({ ...prev, clientId: client._id }))}
              >
                <Text style={[styles.clientChipText, isSelected && styles.clientChipTextSelected]}>
                  {client.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    );
  };

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
              <Text style={styles.modalTitle}>{isEdit ? 'Edit Feedback' : 'Add Feedback'}</Text>
              <TouchableOpacity onPress={closeModals}>
                <Text style={styles.modalClose}>X</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              {error ? (
                <View style={styles.modalError}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              {renderClientSelector()}

              <Input
                label="Campaign Name"
                value={formData.campaignName}
                onChangeText={(text) => setFormData((prev) => ({ ...prev, campaignName: text }))}
                placeholder="Enter campaign name"
                style={styles.modalInput}
              />

              <View style={styles.modalInput}>
                <Text style={styles.inputLabel}>Rating</Text>
                <View style={styles.starsContainer}>
                  {renderStars(formData.rating, (rating) =>
                    setFormData((prev) => ({ ...prev, rating }))
                  )}
                </View>
                <Text style={styles.ratingText}>{formData.rating} out of 5</Text>
              </View>

              <Input
                label="Comment"
                value={formData.comment}
                onChangeText={(text) => setFormData((prev) => ({ ...prev, comment: text }))}
                placeholder="Enter feedback comment"
                multiline
                numberOfLines={4}
                style={styles.modalInput}
              />
            </ScrollView>

            <View style={styles.modalActions}>
              <Button title="Cancel" onPress={closeModals} style={styles.cancelButton} />
              <Button
                title={isEdit ? 'Update Feedback' : 'Add Feedback'}
                onPress={isEdit ? handleEditFeedback : handleAddFeedback}
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
            <Text style={styles.modalTitle}>Feedback Details</Text>
            <TouchableOpacity onPress={closeModals}>
              <Text style={styles.modalClose}>X</Text>
            </TouchableOpacity>
          </View>

          {selectedFeedback ? (
            <ScrollView style={styles.modalContent}>
              <FeedbackCard feedback={selectedFeedback} showActions={false} />

              <Card style={styles.detailsCard}>
                <Text style={styles.detailsTitle}>Full Comment</Text>
                <Text style={styles.fullComment}>{selectedFeedback.comment}</Text>
              </Card>

              <View style={styles.detailsActions}>
                <Button
                  title="Edit Feedback"
                  onPress={() => {
                    closeModals();
                    openEditModal(selectedFeedback);
                  }}
                  style={styles.detailsButton}
                />
              </View>
            </ScrollView>
          ) : null}
        </View>
      </SafeAreaView>
    </Modal>
  );

  const sentimentOptions = [
    { label: 'All', value: 'all', count: stats.total },
    { label: 'Positive', value: 'positive', count: stats.positive },
    { label: 'Neutral', value: 'neutral', count: stats.neutral },
    { label: 'Negative', value: 'negative', count: stats.negative },
  ];

  const renderFeedbackItem = ({ item }) => (
    <FeedbackCard
      feedback={item}
      onPress={openDetailsModal}
      onEdit={openEditModal}
      onDelete={handleDeleteFeedback}
      showActions
    />
  );

  if (loading) {
    return <Loading fullScreen message="Loading feedback..." />;
  }

  return (
    <SafeAreaView style={commonStyles.safeArea}>
      <View style={styles.container}>
        <Card style={styles.headerCard}>
          <Text style={styles.headerTitle}>Feedback History</Text>
          <Text style={styles.headerSubtitle}>View and manage client feedback</Text>
          <Button title="Add Feedback" onPress={openAddModal} style={styles.addButton} />
        </Card>

        {error ? (
          <Card style={styles.errorCard}>
            <Text style={styles.errorText}>{error}</Text>
          </Card>
        ) : null}

        <Card style={styles.searchCard}>
          <Input
            placeholder="Search by campaign, comment, or client..."
            value={searchText}
            onChangeText={setSearchText}
            style={styles.searchInput}
          />
        </Card>

        <Card style={styles.filterCard}>
          <FilterTabs
            options={sentimentOptions}
            selectedOption={sentimentFilter}
            onSelect={setSentimentFilter}
          />
        </Card>

        <FlatList
          data={filteredFeedback}
          renderItem={renderFeedbackItem}
          keyExtractor={(item) => item._id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <EmptyState
              title="No feedback found"
              message={
                feedback.length === 0
                  ? 'No feedback has been submitted yet.'
                  : 'No feedback matches your search criteria.'
              }
            />
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />

        {renderAddEditModal()}
        {renderDetailsModal()}
      </View>
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
  searchCard: {
    backgroundColor: colors.navy,
    borderRadius: spacing.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.navyLight,
  },
  searchInput: {
    backgroundColor: colors.navyLight,
  },
  filterCard: {
    backgroundColor: colors.navy,
    borderRadius: spacing.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.navyLight,
  },
  listContent: {
    paddingBottom: spacing.lg,
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
  clientSelector: {
    gap: spacing.sm,
    paddingRight: spacing.md,
  },
  clientChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.navyLight,
    borderWidth: 1,
    borderColor: colors.gray700,
  },
  clientChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  clientChipText: {
    color: colors.gray300,
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
  },
  clientChipTextSelected: {
    color: colors.white,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  starButton: {
    padding: spacing.xs,
  },
  star: {
    fontSize: typography.fontSizes['2xl'],
  },
  filledStar: {
    color: colors.warning,
  },
  emptyStar: {
    color: colors.gray600,
  },
  ratingText: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray400,
    textAlign: 'center',
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
  fullComment: {
    fontSize: typography.fontSizes.md,
    color: colors.gray300,
    lineHeight: 22,
  },
  detailsActions: {
    padding: spacing.md,
  },
  detailsButton: {
    backgroundColor: colors.primary,
  },
});

export default FeedbackHistoryScreen;
