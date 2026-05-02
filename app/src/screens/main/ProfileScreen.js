import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { Card, Button, Loading } from '../../components';
import { colors, typography, spacing, borderRadius, commonStyles } from '../../styles/theme';

const ProfileScreen = () => {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await logout();
            } catch (error) {
              console.log('Logout error:', error);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const getRoleDescription = (role) => {
    switch (role) {
      case 'Admin':
        return 'Full system access and leadership controls across every module.';
      case 'Manager':
        return 'Operational oversight for clients, tasks, payments, and analytics.';
      case 'Staff':
        return 'Execution-focused workspace for assigned tasks and daily updates.';
      case 'Client':
        return 'A focused portal for progress tracking, feedback, and visibility.';
      default:
        return 'Account overview and workspace access.';
    }
  };

  const getRoleFeatures = (role) => {
    switch (role) {
      case 'Admin':
        return ['User administration', 'Client operations', 'Analytics overview', 'Payment control', 'AI insights'];
      case 'Manager':
        return ['Client coordination', 'Task supervision', 'Analytics monitoring', 'Payment tracking', 'Feedback review'];
      case 'Staff':
        return ['Assigned tasks', 'Calendar workflow', 'Task updates', 'Feedback access'];
      case 'Client':
        return ['Submit feedback', 'Track progress', 'View assigned work', 'Stay informed'];
      default:
        return [];
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'Admin':
        return colors.primary;
      case 'Manager':
        return colors.warning;
      case 'Staff':
        return colors.info;
      case 'Client':
        return colors.success;
      default:
        return colors.gray400;
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'Admin':
        return 'shield-checkmark';
      case 'Manager':
        return 'briefcase';
      case 'Staff':
        return 'build';
      case 'Client':
        return 'person-circle';
      default:
        return 'person';
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';

    const parts = name.trim().split(/\s+/).slice(0, 2);
    return parts.map((part) => part.charAt(0).toUpperCase()).join('');
  };

  const formatUserId = (id) => {
    if (!id) return 'Not available';
    if (id.length <= 14) return id;
    return `${id.slice(0, 6)}...${id.slice(-6)}`;
  };

  if (!user) {
    return <Loading fullScreen message="Loading profile..." />;
  }

  const features = getRoleFeatures(user.role);
  const roleColor = getRoleColor(user.role);

  return (
    <SafeAreaView style={commonStyles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <View style={styles.heroGlow} />
          <View style={styles.heroTopRow}>
            <View style={styles.avatarWrap}>
              <View style={[styles.avatar, { backgroundColor: roleColor }]}>
                <Text style={styles.avatarText}>{getInitials(user.name)}</Text>
              </View>
            </View>
            <View style={[styles.rolePill, { borderColor: `${roleColor}55` }]}>
              <Ionicons name={getRoleIcon(user.role)} size={14} color={roleColor} />
              <Text style={[styles.rolePillText, { color: roleColor }]}>{user.role}</Text>
            </View>
          </View>

          <Text style={styles.heroName}>{user.name}</Text>
          <Text style={styles.heroEmail}>{user.email}</Text>
          <Text style={styles.heroDescription}>{getRoleDescription(user.role)}</Text>

          <View style={styles.quickStats}>
            <View style={styles.statTile}>
              <Text style={styles.statValue}>{features.length}</Text>
              <Text style={styles.statLabel}>Capabilities</Text>
            </View>
            <View style={styles.statTile}>
              <Text style={styles.statValue}>24/7</Text>
              <Text style={styles.statLabel}>Workspace</Text>
            </View>
            <View style={styles.statTile}>
              <Text style={styles.statValue}>Live</Text>
              <Text style={styles.statLabel}>Session</Text>
            </View>
          </View>
        </View>

        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Features</Text>
            <Text style={styles.sectionCaption}>{features.length} active permissions</Text>
          </View>
          {features.map((feature, index) => (
            <View
              key={feature}
              style={[
                styles.featureRow,
                index === features.length - 1 && styles.featureRowLast,
              ]}
            >
              <View style={[styles.featureIconWrap, { backgroundColor: `${roleColor}20` }]}>
                <Ionicons name="checkmark" size={14} color={roleColor} />
              </View>
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </Card>

        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Account Information</Text>
            <Text style={styles.sectionCaption}>Authenticated profile data</Text>
          </View>

          <View style={styles.infoGrid}>
            <View style={styles.infoBlock}>
              <Text style={styles.infoLabel}>User ID</Text>
              <Text style={styles.infoValue}>{formatUserId(user._id)}</Text>
            </View>
            <View style={styles.infoBlock}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{user.email}</Text>
            </View>
            <View style={styles.infoBlock}>
              <Text style={styles.infoLabel}>Role</Text>
              <Text style={styles.infoValue}>{user.role}</Text>
            </View>
            <View style={styles.infoBlock}>
              <Text style={styles.infoLabel}>Access Level</Text>
              <Text style={styles.infoValue}>Verified</Text>
            </View>
          </View>
        </Card>

        <Card style={styles.logoutCard}>
          <View style={styles.logoutTextWrap}>
            <Text style={styles.logoutTitle}>Session Control</Text>
            <Text style={styles.logoutDescription}>
              Sign out securely when you finish working on this device.
            </Text>
          </View>
          <Button
            title="Logout"
            onPress={handleLogout}
            style={styles.logoutButton}
            loading={loading}
            disabled={loading}
          />
        </Card>

        <Text style={styles.versionText}>SpotOn Mobile v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  heroCard: {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: colors.navyLight,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.16)',
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  heroGlow: {
    position: 'absolute',
    top: -60,
    right: -20,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(37, 99, 235, 0.15)',
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  avatarWrap: {
    padding: 4,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.extrabold,
    color: colors.white,
  },
  rolePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(15, 23, 42, 0.72)',
    borderWidth: 1,
  },
  rolePillText: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.semibold,
  },
  heroName: {
    fontSize: typography.fontSizes['2xl'],
    fontWeight: typography.fontWeights.bold,
    color: colors.white,
    marginBottom: spacing.xs,
  },
  heroEmail: {
    fontSize: typography.fontSizes.md,
    color: colors.gray300,
    marginBottom: spacing.sm,
  },
  heroDescription: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray400,
    lineHeight: 20,
    marginBottom: spacing.lg,
    maxWidth: '92%',
  },
  quickStats: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  statTile: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.82)',
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.10)',
  },
  statValue: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    color: colors.white,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: typography.fontSizes.xs,
    color: colors.gray400,
  },
  sectionCard: {
    marginBottom: spacing.md,
    backgroundColor: colors.navyLight,
    borderColor: 'rgba(148, 163, 184, 0.14)',
  },
  sectionHeader: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.bold,
    color: colors.white,
    marginBottom: 2,
  },
  sectionCaption: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray400,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(148, 163, 184, 0.10)',
  },
  featureRowLast: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  featureIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  featureText: {
    flex: 1,
    fontSize: typography.fontSizes.md,
    color: colors.gray200,
  },
  infoGrid: {
    gap: spacing.sm,
  },
  infoBlock: {
    backgroundColor: 'rgba(15, 23, 42, 0.74)',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.10)',
  },
  infoLabel: {
    fontSize: typography.fontSizes.xs,
    color: colors.gray400,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: spacing.xs,
  },
  infoValue: {
    fontSize: typography.fontSizes.md,
    color: colors.white,
    fontWeight: typography.fontWeights.medium,
  },
  logoutCard: {
    marginBottom: spacing.md,
    backgroundColor: colors.navyLight,
    borderColor: 'rgba(148, 163, 184, 0.14)',
  },
  logoutTextWrap: {
    marginBottom: spacing.md,
  },
  logoutTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    color: colors.white,
    marginBottom: spacing.xs,
  },
  logoutDescription: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray400,
    lineHeight: 20,
  },
  logoutButton: {
    backgroundColor: colors.error,
  },
  versionText: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray500,
    textAlign: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
});

export default ProfileScreen;
