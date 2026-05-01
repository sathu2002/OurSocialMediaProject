import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { feedbackApi } from '../../api';
import { Card, Loading, EmptyState } from '../../components';
import { colors, typography, spacing, commonStyles } from '../../styles/theme';

const { width } = Dimensions.get('window');

const AIInsightsScreen = () => {
  const { hasRole } = useAuth();
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [selectedSentiment, setSelectedSentiment] = useState(null);

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

  const loadData = async () => {
    setLoading(true);
    await fetchFeedback();
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

  // Calculate sentiment statistics
  const stats = {
    total: feedback.length,
    positive: feedback.filter(f => f.sentiment?.toLowerCase() === 'positive').length,
    neutral: feedback.filter(f => f.sentiment?.toLowerCase() === 'neutral').length,
    negative: feedback.filter(f => f.sentiment?.toLowerCase() === 'negative').length,
  };

  const percentages = {
    positive: stats.total > 0 ? ((stats.positive / stats.total) * 100).toFixed(1) : 0,
    neutral: stats.total > 0 ? ((stats.neutral / stats.total) * 100).toFixed(1) : 0,
    negative: stats.total > 0 ? ((stats.negative / stats.total) * 100).toFixed(1) : 0,
  };

  // Get recent feedback (last 5)
  const recentFeedback = [...feedback]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  // Filter feedback by selected sentiment
  const filteredFeedback = selectedSentiment
    ? feedback.filter(f => f.sentiment?.toLowerCase() === selectedSentiment.toLowerCase())
    : recentFeedback;

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

  const renderStatCard = (label, count, percentage, color, sentiment) => (
    <TouchableOpacity
      style={[
        styles.statCard,
        selectedSentiment === sentiment && styles.statCardActive,
        { borderLeftColor: color, borderLeftWidth: 4 }
      ]}
      onPress={() => setSelectedSentiment(selectedSentiment === sentiment ? null : sentiment)}
    >
      <Text style={[styles.statCount, { color }]}>{count}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statPercentage, { color }]}>{percentage}%</Text>
    </TouchableOpacity>
  );

  const renderFeedbackItem = (item) => (
    <Card key={item._id} style={styles.feedbackItem}>
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
      <Text style={styles.commentText} numberOfLines={2}>
        {item.comment}
      </Text>
      <Text style={styles.dateText}>
        {new Date(item.createdAt).toLocaleDateString()}
      </Text>
    </Card>
  );

  const getSatisfactionStatus = () => {
    const positiveRate = parseFloat(percentages.positive);
    if (positiveRate >= 70) return { label: 'Excellent', color: colors.success };
    if (positiveRate >= 50) return { label: 'Good', color: colors.info };
    if (positiveRate >= 30) return { label: 'Fair', color: colors.warning };
    return { label: 'Needs Improvement', color: colors.error };
  };

  const satisfaction = getSatisfactionStatus();

  if (loading) {
    return <Loading fullScreen message="Loading AI insights..." />;
  }

  return (
    <SafeAreaView style={commonStyles.safeArea}>
      <ScrollView
        style={commonStyles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Text style={commonStyles.title}>AI Insights</Text>

        {error && (
          <EmptyState
            title="Error"
            message={error}
            actionLabel="Retry"
            onAction={loadData}
          />
        )}

        {/* Summary Card */}
        <Card style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Feedback Analysis Summary</Text>
          <View style={styles.satisfactionRow}>
            <Text style={styles.satisfactionLabel}>Satisfaction Status:</Text>
            <View style={[styles.satisfactionBadge, { backgroundColor: satisfaction.color + '30' }]}>
              <Text style={[styles.satisfactionText, { color: satisfaction.color }]}>
                {satisfaction.label}
              </Text>
            </View>
          </View>
          <Text style={styles.totalFeedback}>
            Total Feedback: <Text style={styles.totalCount}>{stats.total}</Text>
          </Text>
        </Card>

        {/* Statistics Cards */}
        <View style={styles.statsContainer}>
          {renderStatCard('Positive', stats.positive, percentages.positive, colors.success, 'Positive')}
          {renderStatCard('Neutral', stats.neutral, percentages.neutral, colors.warning, 'Neutral')}
          {renderStatCard('Negative', stats.negative, percentages.negative, colors.error, 'Negative')}
        </View>

        {/* Recent Feedback Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {selectedSentiment 
                ? `${selectedSentiment} Feedback (${filteredFeedback.length})` 
                : 'Recent Feedback'}
            </Text>
            {selectedSentiment && (
              <TouchableOpacity onPress={() => setSelectedSentiment(null)}>
                <Text style={styles.clearFilter}>Clear Filter</Text>
              </TouchableOpacity>
            )}
          </View>

          {filteredFeedback.length === 0 ? (
            <EmptyState
              title="No Feedback"
              message={selectedSentiment 
                ? `No ${selectedSentiment.toLowerCase()} feedback found.` 
                : "No feedback available yet."}
            />
          ) : (
            <View style={styles.feedbackList}>
              {filteredFeedback.map(renderFeedbackItem)}
            </View>
          )}
        </View>

        {/* AI Analysis Notes */}
        <Card style={styles.analysisCard}>
          <Text style={styles.analysisTitle}>AI Analysis Notes</Text>
          <Text style={styles.analysisText}>
            Based on {stats.total} feedback entries:
          </Text>
          <Text style={styles.analysisText}>
            • {percentages.positive}% of clients are satisfied (Positive)
          </Text>
          <Text style={styles.analysisText}>
            • {percentages.negative}% of clients need attention (Negative)
          </Text>
          <Text style={styles.analysisText}>
            • {percentages.neutral}% are neutral responses
          </Text>
          <Text style={styles.analysisHint}>
            Tap on any stat card above to filter feedback by sentiment.
          </Text>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  summaryCard: {
    marginBottom: spacing.md,
    backgroundColor: colors.navyLight,
  },
  summaryTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    color: colors.white,
    marginBottom: spacing.sm,
  },
  satisfactionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  satisfactionLabel: {
    fontSize: typography.fontSizes.md,
    color: colors.gray300,
    marginRight: spacing.sm,
  },
  satisfactionBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  satisfactionText: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.semibold,
  },
  totalFeedback: {
    fontSize: typography.fontSizes.md,
    color: colors.gray300,
  },
  totalCount: {
    fontWeight: typography.fontWeights.bold,
    color: colors.white,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.md,
    marginHorizontal: spacing.xs,
    alignItems: 'center',
  },
  statCardActive: {
    backgroundColor: colors.navyLight,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  statCount: {
    fontSize: typography.fontSizes['3xl'],
    fontWeight: typography.fontWeights.bold,
  },
  statLabel: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray400,
    marginTop: spacing.xs,
  },
  statPercentage: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.semibold,
    marginTop: spacing.xs,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    color: colors.white,
  },
  clearFilter: {
    fontSize: typography.fontSizes.sm,
    color: colors.primary,
  },
  feedbackList: {
    gap: spacing.md,
  },
  feedbackItem: {
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
    fontSize: typography.fontSizes.md,
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
  commentText: {
    fontSize: typography.fontSizes.md,
    color: colors.gray300,
    marginBottom: spacing.xs,
  },
  dateText: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray500,
  },
  analysisCard: {
    backgroundColor: colors.navyLight,
    marginBottom: spacing.xl,
  },
  analysisTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  analysisText: {
    fontSize: typography.fontSizes.md,
    color: colors.gray300,
    marginBottom: spacing.xs,
    lineHeight: 22,
  },
  analysisHint: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray500,
    marginTop: spacing.md,
    fontStyle: 'italic',
  },
});

export default AIInsightsScreen;
