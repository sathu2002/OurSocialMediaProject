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
import { useAuth } from '../../context/AuthContext';
import { feedbackApi, clientApi } from '../../api';
import { Card, Button, Input, Loading, EmptyState } from '../../components';
import { colors, typography, spacing, commonStyles } from '../../styles/theme';

// AI Sentiment Detection - Local Rule-Based
const POSITIVE_WORDS = [
  'good', 'great', 'excellent', 'happy', 'satisfied', 'best', 'nice', 'amazing', 
  'fast', 'helpful', 'love', 'perfect', 'awesome', 'fantastic', 'wonderful', 
  'brilliant', 'outstanding', 'superb', 'delightful', 'pleased', 'grateful',
  'recommend', 'smooth', 'easy', 'quick', 'professional', 'friendly', 'supportive'
];

const NEGATIVE_WORDS = [
  'bad', 'poor', 'worst', 'unhappy', 'disappointed', 'slow', 'problem', 'issue', 
  'angry', 'hate', 'terrible', 'not good', 'awful', 'horrible', 'frustrated',
  'annoying', 'difficult', 'complicated', 'useless', 'waste', 'regret', 'broken',
  'error', 'fail', 'failed', 'crash', 'bug', 'delay', 'late', 'unprofessional'
];

const detectSentiment = (text) => {
  if (!text || text.trim().length === 0) return 'Neutral';
  
  const lowerText = text.toLowerCase();
  let positiveScore = 0;
  let negativeScore = 0;
  
  POSITIVE_WORDS.forEach(word => {
    if (lowerText.includes(word)) positiveScore++;
  });
  
  NEGATIVE_WORDS.forEach(word => {
    if (lowerText.includes(word)) negativeScore++;
  });
  
  if (positiveScore > negativeScore) return 'Positive';
  if (negativeScore > positiveScore) return 'Negative';
  return 'Neutral';
};

const getSentimentColor = (sentiment) => {
  switch (sentiment?.toLowerCase()) {
    case 'positive': return colors.success;
    case 'negative': return colors.error;
    case 'neutral': return colors.warning;
    default: return colors.gray400;
  }
};

const getSentimentBgColor = (sentiment) => {
  switch (sentiment?.toLowerCase()) {
    case 'positive': return colors.success + '20';
    case 'negative': return colors.error + '20';
    case 'neutral': return colors.warning + '20';
    default: return colors.gray700;
  }
};

const FeedbackScreen = () => {
  const { user, hasRole } = useAuth();
  const [feedback, setFeedback] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sentimentFilter, setSentimentFilter] = useState('All');
  
  // Modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [editingFeedback, setEditingFeedback] = useState(null);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    clientId: '',
    campaignName: '',
    rating: 0,
    comment: '',
    sentiment: 'Neutral',
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const fetchFeedback = async () => {
    try {
      setError('');
      let response;

      if (hasRole(['Client'])) {
        response = await feedbackApi.getMyFeedback();
      } else {
        response = await feedbackApi.getFeedback();
      }

      setFeedback(response.data || []);
    } catch (error) {
      console.log('Fetch feedback error:', error);
      setError(error.response?.data?.message || 'Failed to load feedback');
    }
  };

  const fetchClients = async () => {
    if (!hasRole(['Admin', 'Manager'])) return;
    try {
      const response = await clientApi.getClients();
      setClients(response.data || []);
    } catch (error) {
      console.log('Fetch clients error:', error);
    }
  };

  const loadData = async () => {
    setLoading(true);
    await Promise.all([fetchFeedback(), fetchClients()]);
    setLoading(false);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchFeedback();
    setRefreshing(false);
  }, []);

  useEffect(() => {
    loadData();
  }, []);

  // Auto-detect sentiment when comment changes
  useEffect(() => {
    if (formData.comment) {
      const detected = detectSentiment(formData.comment);
      setFormData(prev => ({ ...prev, sentiment: detected }));
    }
  }, [formData.comment]);

  const validateForm = () => {
    const errors = {};
    if (!hasRole(['Client']) && !formData.clientId) {
      errors.clientId = 'Please select a client';
    }
    if (!formData.campaignName.trim()) {
      errors.campaignName = 'Campaign name is required';
    }
    if (formData.rating === 0) {
      errors.rating = 'Please select a rating';
    }
    if (!formData.comment.trim()) {
      errors.comment = 'Comment is required';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddFeedback = () => {
    setEditingFeedback(null);
    setFormData({
      clientId: hasRole(['Client']) && user?._id ? user._id : '',
      campaignName: '',
      rating: 0,
      comment: '',
      sentiment: 'Neutral',
    });
    setFormErrors({});
    setModalVisible(true);
  };

  const handleEditFeedback = (item) => {
    setEditingFeedback(item);
    setFormData({
      clientId: item.clientId?._id || item.clientId || '',
      campaignName: item.campaignName || '',
      rating: item.rating || 0,
      comment: item.comment || '',
      sentiment: item.sentiment || 'Neutral',
    });
    setFormErrors({});
    setModalVisible(true);
  };

  const handleViewDetails = (item) => {
    setSelectedFeedback(item);
    setDetailModalVisible(true);
  };

  const handleDeleteFeedback = (item) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this feedback?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await feedbackApi.deleteFeedback(item._id);
              Alert.alert('Success', 'Feedback deleted successfully');
              fetchFeedback();
            } catch (error) {
              Alert.alert('Error', error.response?.data?.message || 'Failed to delete feedback');
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
      const feedbackData = {
        ...formData,
        clientId: hasRole(['Client']) ? undefined : formData.clientId,
      };

      if (editingFeedback) {
        await feedbackApi.updateFeedback(editingFeedback._id, feedbackData);
        Alert.alert('Success', 'Feedback updated successfully');
      } else {
        await feedbackApi.createFeedback(feedbackData);
        Alert.alert('Success', 'Feedback submitted successfully');
      }
      
      setModalVisible(false);
      fetchFeedback();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to save feedback');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredFeedback = feedback.filter(item => {
    const matchesSearch = 
      (item.clientId?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.campaignName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.comment || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSentiment = sentimentFilter === 'All' || 
      (item.sentiment || '').toLowerCase() === sentimentFilter.toLowerCase();
    
    return matchesSearch && matchesSentiment;
  });

  const renderStars = (rating, interactive = false, onRate = null) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => interactive && onRate && onRate(star)}
            disabled={!interactive}
          >
            <Text style={[
              styles.star,
              { color: star <= rating ? '#FFD700' : colors.gray600 }
            ]}>
              ★
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderFeedbackItem = ({ item }) => (
    <Card style={styles.feedbackCard}>
      <TouchableOpacity onPress={() => handleViewDetails(item)}>
        <View style={styles.feedbackHeader}>
          <View style={styles.feedbackTitleSection}>
            <Text style={styles.campaignName}>{item.campaignName}</Text>
            <Text style={styles.clientName}>
              {item.clientId?.name || 'Unknown Client'}
            </Text>
          </View>
          <View style={[
            styles.sentimentBadge,
            { backgroundColor: getSentimentBgColor(item.sentiment) }
          ]}>
            <Text style={[
              styles.sentimentText,
              { color: getSentimentColor(item.sentiment) }
            ]}>
              {item.sentiment || 'Neutral'}
            </Text>
          </View>
        </View>

        <View style={styles.ratingSection}>
          {renderStars(item.rating)}
          <Text style={styles.dateText}>
            {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>

        <Text style={styles.commentText} numberOfLines={2}>
          {item.comment}
        </Text>

        <View style={styles.actionButtons}>
          <Button
            title="View"
            onPress={() => handleViewDetails(item)}
            variant="outline"
            size="sm"
            style={styles.actionButton}
          />
          {(hasRole(['Admin', 'Manager']) || (hasRole(['Client']) && item.clientId?._id === user?._id)) && (
            <>
              <Button
                title="Edit"
                onPress={() => handleEditFeedback(item)}
                variant="outline"
                size="sm"
                style={styles.actionButton}
              />
              <Button
                title="Delete"
                onPress={() => handleDeleteFeedback(item)}
                variant="danger"
                size="sm"
                style={styles.actionButton}
              />
            </>
          )}
        </View>
      </TouchableOpacity>
    </Card>
  );

  if (loading) {
    return <Loading fullScreen message="Loading feedback..." />;
  }

  return (
    <SafeAreaView style={commonStyles.safeArea}>
      <View style={commonStyles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={commonStyles.title}>Feedback History</Text>
          <Button title="+ Add" onPress={handleAddFeedback} size="sm" />
        </View>

        {/* Search & Filter */}
        <View style={styles.filterContainer}>
          <Input
            placeholder="Search by client, campaign, or comment..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
          />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
            {['All', 'Positive', 'Neutral', 'Negative'].map((sentiment) => (
              <TouchableOpacity
                key={sentiment}
                style={[
                  styles.filterChip,
                  sentimentFilter === sentiment && styles.filterChipActive,
                ]}
                onPress={() => setSentimentFilter(sentiment)}
              >
                <Text style={[
                  styles.filterChipText,
                  sentimentFilter === sentiment && styles.filterChipTextActive,
                ]}>
                  {sentiment}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Feedback List */}
        {filteredFeedback.length === 0 ? (
          <EmptyState
            title="No Feedback"
            message={searchQuery || sentimentFilter !== 'All' 
              ? "No feedback matches your search/filter." 
              : "No feedback found. Be the first to add feedback!"}
            actionLabel="Add Feedback"
            onAction={handleAddFeedback}
          />
        ) : (
          <FlatList
            data={filteredFeedback}
            renderItem={renderFeedbackItem}
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
              {editingFeedback ? 'Edit Feedback' : 'Add Feedback'}
            </Text>
            
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Client Selection (Admin/Manager only) */}
              {!hasRole(['Client']) && (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Client *</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {clients.map((client) => (
                      <TouchableOpacity
                        key={client._id}
                        style={[
                          styles.clientChip,
                          formData.clientId === client._id && styles.clientChipActive,
                        ]}
                        onPress={() => setFormData({ ...formData, clientId: client._id })}
                      >
                        <Text style={[
                          styles.clientChipText,
                          formData.clientId === client._id && styles.clientChipTextActive,
                        ]}>
                          {client.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                  {formErrors.clientId && <Text style={styles.errorText}>{formErrors.clientId}</Text>}
                </View>
              )}

              <Input
                label="Campaign Name *"
                placeholder="Enter campaign name"
                value={formData.campaignName}
                onChangeText={(text) => setFormData({ ...formData, campaignName: text })}
                error={formErrors.campaignName}
              />

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Rating *</Text>
                {renderStars(formData.rating, true, (star) => 
                  setFormData({ ...formData, rating: star })
                )}
                {formErrors.rating && <Text style={styles.errorText}>{formErrors.rating}</Text>}
              </View>

              <Input
                label="Comment *"
                placeholder="Share your feedback..."
                value={formData.comment}
                onChangeText={(text) => setFormData({ ...formData, comment: text })}
                error={formErrors.comment}
                multiline
                numberOfLines={4}
                style={styles.commentInput}
              />

              {/* AI Sentiment Detection */}
              <View style={styles.sentimentSection}>
                <Text style={styles.label}>AI Detected Sentiment</Text>
                <View style={[
                  styles.detectedSentiment,
                  { backgroundColor: getSentimentBgColor(formData.sentiment) }
                ]}>
                  <Text style={[
                    styles.detectedSentimentText,
                    { color: getSentimentColor(formData.sentiment) }
                  ]}>
                    {formData.sentiment}
                  </Text>
                </View>
                <Text style={styles.sentimentHint}>
                  Sentiment is automatically detected from your comment. You can manually select below if needed.
                </Text>
                <View style={styles.manualSentimentContainer}>
                  {['Positive', 'Neutral', 'Negative'].map((sentiment) => (
                    <TouchableOpacity
                      key={sentiment}
                      style={[
                        styles.sentimentButton,
                        formData.sentiment === sentiment && styles.sentimentButtonActive,
                        { borderColor: getSentimentColor(sentiment) }
                      ]}
                      onPress={() => setFormData({ ...formData, sentiment })}
                    >
                      <Text style={[
                        styles.sentimentButtonText,
                        formData.sentiment === sentiment && { 
                          color: getSentimentColor(sentiment),
                          fontWeight: 'bold'
                        }
                      ]}>
                        {sentiment}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.modalActions}>
                <Button
                  title="Cancel"
                  onPress={() => setModalVisible(false)}
                  variant="outline"
                  style={styles.modalButton}
                />
                <Button
                  title={submitting ? 'Saving...' : editingFeedback ? 'Update' : 'Submit'}
                  onPress={handleSubmit}
                  loading={submitting}
                  style={styles.modalButton}
                />
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Detail Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={detailModalVisible}
        onRequestClose={() => setDetailModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedFeedback && (
              <>
                <View style={styles.detailHeader}>
                  <Text style={styles.modalTitle}>Feedback Details</Text>
                  <TouchableOpacity onPress={() => setDetailModalVisible(false)}>
                    <Text style={styles.closeButton}>✕</Text>
                  </TouchableOpacity>
                </View>
                
                <ScrollView showsVerticalScrollIndicator={false}>
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Campaign</Text>
                    <Text style={styles.detailValue}>{selectedFeedback.campaignName}</Text>
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Client</Text>
                    <Text style={styles.detailValue}>
                      {selectedFeedback.clientId?.name || 'Unknown'}
                    </Text>
                    <Text style={styles.detailSubvalue}>
                      {selectedFeedback.clientId?.email || ''}
                    </Text>
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Rating</Text>
                    {renderStars(selectedFeedback.rating)}
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Sentiment</Text>
                    <View style={[
                      styles.detailSentimentBadge,
                      { backgroundColor: getSentimentBgColor(selectedFeedback.sentiment) }
                    ]}>
                      <Text style={[
                        styles.detailSentimentText,
                        { color: getSentimentColor(selectedFeedback.sentiment) }
                      ]}>
                        {selectedFeedback.sentiment || 'Neutral'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Comment</Text>
                    <Text style={styles.detailComment}>{selectedFeedback.comment}</Text>
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Date</Text>
                    <Text style={styles.detailValue}>
                      {new Date(selectedFeedback.createdAt).toLocaleString()}
                    </Text>
                  </View>

                  {selectedFeedback.aiSuggestion && (
                    <View style={styles.detailSection}>
                      <Text style={styles.detailLabel}>AI Suggestion</Text>
                      <Text style={styles.detailComment}>{selectedFeedback.aiSuggestion}</Text>
                    </View>
                  )}

                  <Button
                    title="Close"
                    onPress={() => setDetailModalVisible(false)}
                    style={styles.closeModalButton}
                  />
                </ScrollView>
              </>
            )}
          </View>
        </View>
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
  filterContainer: {
    marginBottom: spacing.md,
  },
  searchInput: {
    marginBottom: spacing.sm,
  },
  filterScroll: {
    flexDirection: 'row',
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    backgroundColor: colors.gray700,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.gray600,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    color: colors.gray300,
    fontSize: typography.fontSizes.sm,
  },
  filterChipTextActive: {
    color: colors.white,
    fontWeight: typography.fontWeights.semibold,
  },
  listContent: {
    paddingBottom: spacing.lg,
  },
  feedbackCard: {
    marginBottom: spacing.md,
  },
  feedbackHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  feedbackTitleSection: {
    flex: 1,
  },
  campaignName: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    color: colors.white,
    marginBottom: spacing.xs,
  },
  clientName: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray400,
  },
  sentimentBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  sentimentText: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.semibold,
  },
  ratingSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  starsContainer: {
    flexDirection: 'row',
  },
  star: {
    fontSize: 20,
    marginRight: 4,
  },
  dateText: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray500,
  },
  commentText: {
    fontSize: typography.fontSizes.md,
    color: colors.gray300,
    marginBottom: spacing.sm,
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    padding: spacing.md,
  },
  modalContent: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: spacing.lg,
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.bold,
    color: colors.white,
    marginBottom: spacing.lg,
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  closeButton: {
    fontSize: 24,
    color: colors.gray400,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
    color: colors.gray300,
    marginBottom: spacing.xs,
  },
  errorText: {
    color: colors.error,
    fontSize: typography.fontSizes.sm,
    marginTop: spacing.xs,
  },
  clientChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    backgroundColor: colors.gray700,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.gray600,
  },
  clientChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  clientChipText: {
    color: colors.gray300,
    fontSize: typography.fontSizes.sm,
  },
  clientChipTextActive: {
    color: colors.white,
    fontWeight: typography.fontWeights.semibold,
  },
  commentInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  sentimentSection: {
    marginBottom: spacing.md,
  },
  detectedSentiment: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: spacing.sm,
  },
  detectedSentimentText: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.bold,
  },
  sentimentHint: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray500,
    marginBottom: spacing.sm,
  },
  manualSentimentContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  sentimentButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.gray600,
    backgroundColor: colors.gray700,
    alignItems: 'center',
  },
  sentimentButtonActive: {
    backgroundColor: colors.gray600,
    borderWidth: 2,
  },
  sentimentButtonText: {
    color: colors.gray300,
    fontSize: typography.fontSizes.sm,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  modalButton: {
    flex: 1,
  },
  detailSection: {
    marginBottom: spacing.md,
  },
  detailLabel: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray500,
    marginBottom: spacing.xs,
  },
  detailValue: {
    fontSize: typography.fontSizes.lg,
    color: colors.white,
    fontWeight: typography.fontWeights.medium,
  },
  detailSubvalue: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray400,
  },
  detailSentimentBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  detailSentimentText: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.bold,
  },
  detailComment: {
    fontSize: typography.fontSizes.md,
    color: colors.gray300,
    lineHeight: 22,
    backgroundColor: colors.gray700,
    padding: spacing.md,
    borderRadius: 8,
  },
  closeModalButton: {
    marginTop: spacing.lg,
  },
});

export default FeedbackScreen;
