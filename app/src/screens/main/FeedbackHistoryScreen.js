import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
  Modal,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { feedbackApi, clientApi } from '../../api';
import { Card, Button, Input, Loading, EmptyState } from '../../components';
import FeedbackCard from '../../components/FeedbackCard';
import FilterTabs from '../../components/FilterTabs';
import { colors, typography, spacing, commonStyles } from '../../styles/theme';

const FeedbackHistoryScreen = () => {
  const { hasRole } = useAuth();
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

  // Modal states
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    client: '',
    rating: 5,
    comment: '',
  });

  const fetchFeedback = useCallback(async () => {
    try {
      setError('');
      const response = hasRole(['Admin', 'Manager']) 
        ? await feedbackApi.getFeedback()
        : await feedbackApi.getMyFeedback();
      
      const feedbackData = response || [];
      setFeedback(feedbackData);
      setFilteredFeedback(feedbackData);
      
      // Calculate stats
      const total = feedbackData.length;
      const positive = feedbackData.filter(f => f.sentiment?.toLowerCase() === 'positive').length;
      const neutral = feedbackData.filter(f => f.sentiment?.toLowerCase() === 'neutral').length;
      const negative = feedbackData.filter(f => f.sentiment?.toLowerCase() === 'negative').length;
      
      setStats({ total, positive, neutral, negative });
    } catch (error) {
      console.log('Feedback error:', error);
      setError(error.message || 'Failed to load feedback');
    }
  }, [hasRole]);

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
    await Promise.all([fetchFeedback(), fetchClients()]);
    setLoading(false);
  }, [fetchFeedback, fetchClients]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchFeedback(), fetchClients()]);
    setRefreshing(false);
  }, [fetchFeedback, fetchClients]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    filterFeedback();
  }, [feedback, searchText, sentimentFilter]);

  const filterFeedback = () => {
    let filtered = [...feedback];

    // Search filter
    if (searchText) {
      filtered = filtered.filter(item =>
        (item.comment && item.comment.toLowerCase().includes(searchText.toLowerCase())) ||
        (item.clientName && item.clientName.toLowerCase().includes(searchText.toLowerCase())) ||
        (item.client && typeof item.client === 'object' && 
          item.client.name.toLowerCase().includes(searchText.toLowerCase()))
      );
    }

    // Sentiment filter
    if (sentimentFilter !== 'all') {
      filtered = filtered.filter(item => 
        item.sentiment?.toLowerCase() === sentimentFilter
      );
    }

    setFilteredFeedback(filtered);
  };

  const resetForm = () => {
    setFormData({
      client: '',
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
      client: feedbackItem.client || '',
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
    if (!formData.client.trim()) {
      setError('Client is required');
      return false;
    }
    if (!formData.comment.trim()) {
      setError('Comment is required');
      return false;
    }
    if (formData.rating < 1 || formData.rating > 5) {
      setError('Rating must be between 1 and 5');
      return false;
    }
    return true;
  };

  const handleAddFeedback = async () => {
    if (!validateForm()) return;

    setSubmitting(true);
    setError('');

    try {
      const feedbackData = {
        client: formData.client.trim(),
        rating: formData.rating,
        comment: formData.comment.trim(),
      };

      const result = await feedbackApi.createFeedback(feedbackData);

      if (result.success || result.data) {
        Alert.alert('Success', 'Feedback added successfully');
        closeModals();
        await fetchFeedback();
      } else {
        setError(result.error || 'Failed to add feedback');
      }
    } catch (error) {
      setError(error.message || 'Failed to add feedback');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditFeedback = async () => {
    if (!validateForm()) return;

    setSubmitting(true);
    setError('');

    try {
      const feedbackData = {
        client: formData.client.trim(),
        rating: formData.rating,
        comment: formData.comment.trim(),
      };

      const result = await feedbackApi.updateFeedback(selectedFeedback._id, feedbackData);

      if (result.success || result.data) {
        Alert.alert('Success', 'Feedback updated successfully');
        closeModals();
        await fetchFeedback();
      } else {
        setError(result.error || 'Failed to update feedback');
      }
    } catch (error) {
      setError(error.message || 'Failed to update feedback');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteFeedback = (feedbackItem) => {
    Alert.alert(
      'Delete Feedback',
      'Are you sure you want to delete this feedback? This action cannot be undone.',
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
            } catch (error) {
              Alert.alert('Error', error.message || 'Failed to delete feedback');
            }
          },
        },
      ]
    );
  };

  const getSentimentColor = (sentiment) => {
    switch (sentiment?.toLowerCase()) {
      case 'positive': return colors.success;
      case 'negative': return colors.error;
      case 'neutral': return colors.warning;
      default: return colors.gray400;
    }
  };

  const renderStars = (rating, onPress) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity
          key={i}
          onPress={() => onPress && onPress(i)}
          style={styles.starButton}
        >
          <Text style={[
            styles.star,
            i <= rating ? styles.filledStar : styles.emptyStar
          ]}>
            {i <= rating ? '⭐' : '☆'}
          </Text>
        </TouchableOpacity>
      );
    }
    return stars;
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
              <Text style={styles.modalTitle}>
                {isEdit ? 'Edit Feedback' : 'Add New Feedback'}
              </Text>
              <TouchableOpacity onPress={closeModals}>
                <Text style={styles.modalClose}>×</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalContent}>
              {error && (
                <View style={styles.modalError}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              <Input
                label="Client"
                value={formData.client}
                onChangeText={(text) => setFormData({ ...formData, client: text })}
                placeholder="Enter client name"
                style={styles.modalInput}
              />

              <View style={styles.modalInput}>
                <Text style={styles.inputLabel}>Rating</Text>
                <View style={styles.starsContainer}>
                  {renderStars(formData.rating, (rating) => 
                    setFormData({ ...formData, rating })
                  )}
                </View>
                <Text style={styles.ratingText}>
                  {formData.rating} out of 5
                </Text>
              </View>

              <Input
                label="Comment"
                value={formData.comment}
                onChangeText={(text) => setFormData({ ...formData, comment: text })}
                placeholder="Enter feedback comment"
                multiline
                numberOfLines={4}
                style={styles.modalInput}
              />

              <View style={styles.modalInput}>
                <Text style={styles.inputLabel}>Sentiment Analysis</Text>
                <View style={styles.sentimentInfo}>
                  <Text style={styles.sentimentInfoText}>
                    Sentiment will be automatically analyzed from your comment and rating
                  </Text>
                  <View style={styles.sentimentExamples}>
                    <Text style={styles.sentimentExampleTitle}>Examples:</Text>
                    <Text style={styles.sentimentExample}>• "Great service!" → Positive</Text>
                    <Text style={styles.sentimentExample}>• "It was okay" → Neutral</Text>
                    <Text style={styles.sentimentExample}>• "Terrible experience" → Negative</Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.modalActions}>
              <Button
                title="Cancel"
                onPress={closeModals}
                style={styles.cancelButton}
              />
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
              <Text style={styles.modalClose}>×</Text>
            </TouchableOpacity>
          </View>

          {selectedFeedback && (
            <ScrollView style={styles.modalContent}>
              <FeedbackCard
                feedback={selectedFeedback}
                showActions={false}
              />

              <Card style={styles.detailsCard}>
                <Text style={styles.detailsTitle}>Full Comment</Text>
                <Text style={styles.fullComment}>
                  {selectedFeedback.comment}
                </Text>
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
          )}
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
      onEdit={hasRole(['Admin', 'Manager']) ? openEditModal : null}
      onDelete={hasRole(['Admin', 'Manager']) ? handleDeleteFeedback : null}
      showActions={hasRole(['Admin', 'Manager'])}
    />
  );

  if (loading) {
    return <Loading fullScreen message="Loading feedback..." />;
  }

  return (
    <SafeAreaView style={commonStyles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <Card style={styles.headerCard}>
          <Text style={styles.headerTitle}>Feedback History</Text>
          <Text style={styles.headerSubtitle}>
            View and manage client feedback
          </Text>
          {hasRole(['Admin', 'Manager']) && (
            <Button
              title="Add Feedback"
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

        {/* Search */}
        <Card style={styles.searchCard}>
          <Input
            placeholder="Search by comment or client name..."
            value={searchText}
            onChangeText={setSearchText}
            style={styles.searchInput}
          />
        </Card>

        {/* Sentiment Filter */}
        <Card style={styles.filterCard}>
          <FilterTabs
            options={sentimentOptions}
            selectedOption={sentimentFilter}
            onSelect={setSentimentFilter}
          />
        </Card>

        {/* Feedback List */}
        <FlatList
          data={filteredFeedback}
          renderItem={renderFeedbackItem}
          keyExtractor={(item) => item._id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <EmptyState
              title="No feedback found"
              message={
                feedback.length === 0
                  ? "No feedback has been submitted yet."
                  : "No feedback matches your search criteria."
              }
            />
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />

        {/* Modals */}
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
  sentimentInfo: {
    backgroundColor: colors.navyLight,
    borderRadius: spacing.md,
    padding: spacing.md,
  },
  sentimentInfoText: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray300,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  sentimentExamples: {
    gap: spacing.xs,
  },
  sentimentExampleTitle: {
    fontSize: typography.fontSizes.sm,
    color: colors.white,
    fontWeight: typography.fontWeights.semibold,
    marginBottom: spacing.xs,
  },
  sentimentExample: {
    fontSize: typography.fontSizes.xs,
    color: colors.gray400,
    fontStyle: 'italic',
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
