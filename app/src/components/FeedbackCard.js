import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Card from './Card';
import { colors, typography, spacing, borderRadius } from '../styles/theme';

const FeedbackCard = ({
  feedback,
  onPress,
  onEdit,
  onDelete,
  showActions = false,
}) => {
  const getSentimentColor = (sentiment) => {
    switch (sentiment?.toLowerCase()) {
      case 'positive': return colors.success;
      case 'negative': return colors.error;
      case 'neutral': return colors.warning;
      default: return colors.gray400;
    }
  };

  const getSentimentEmoji = (sentiment) => {
    switch (sentiment?.toLowerCase()) {
      case 'positive': return '😊';
      case 'negative': return '😞';
      case 'neutral': return '😐';
      default: return '📝';
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Text key={`star-${i}`} style={styles.star}>⭐</Text>);
    }
    if (hasHalfStar) {
      stars.push(<Text key="half-star" style={styles.star}>⭐</Text>);
    }
    for (let i = stars.length; i < 5; i++) {
      stars.push(<Text key={`empty-star-${i}`} style={styles.emptyStar}>☆</Text>);
    }

    return stars;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <TouchableOpacity onPress={() => onPress?.(feedback)}>
      <Card style={styles.container}>
        <View style={styles.header}>
          <View style={styles.clientInfo}>
            <Text style={styles.clientName}>
              {feedback.campaignName || feedback.clientId?.name || 'Feedback'}
            </Text>
            {feedback.clientId?.name ? (
              <Text style={styles.clientSubtext}>{feedback.clientId.name}</Text>
            ) : null}
            <View style={styles.ratingContainer}>
              {renderStars(feedback.rating || 0)}
              <Text style={styles.ratingText}>({feedback.rating || 0})</Text>
            </View>
          </View>
          <View style={styles.sentimentContainer}>
            <Text style={styles.sentimentEmoji}>
              {getSentimentEmoji(feedback.sentiment)}
            </Text>
            <Text style={[
              styles.sentimentText,
              { color: getSentimentColor(feedback.sentiment) }
            ]}>
              {feedback.sentiment || 'Neutral'}
            </Text>
          </View>
        </View>

        {feedback.comment && (
          <Text style={styles.comment} numberOfLines={3}>
            {feedback.comment}
          </Text>
        )}

        <View style={styles.footer}>
          <Text style={styles.date}>
            {formatDate(feedback.createdAt || feedback.date)}
          </Text>
          {showActions && (
            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.actionButton, styles.editButton]}
                onPress={() => onEdit?.(feedback)}
              >
                <Text style={styles.actionButtonText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => onDelete?.(feedback)}
              >
                <Text style={styles.actionButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  clientInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  clientSubtext: {
    fontSize: typography.fontSizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  star: {
    fontSize: typography.fontSizes.md,
    color: colors.warning,
  },
  emptyStar: {
    fontSize: typography.fontSizes.md,
    color: colors.gray600,
  },
  ratingText: {
    fontSize: typography.fontSizes.sm,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  sentimentContainer: {
    alignItems: 'flex-end',
  },
  sentimentEmoji: {
    fontSize: typography.fontSizes.lg,
    marginBottom: spacing.xs,
  },
  sentimentText: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.semibold,
    textTransform: 'capitalize',
  },
  comment: {
    fontSize: typography.fontSizes.md,
    color: colors.textPrimary,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    fontSize: typography.fontSizes.sm,
    color: colors.textSecondary,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    minWidth: 50,
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: colors.info,
  },
  deleteButton: {
    backgroundColor: colors.error,
  },
  actionButtonText: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.semibold,
    color: colors.white,
  },
});

export default FeedbackCard;
