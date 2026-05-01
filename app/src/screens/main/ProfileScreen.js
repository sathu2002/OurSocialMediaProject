import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { Card, Button, Input, Loading } from '../../components';
import { colors, typography, spacing, commonStyles } from '../../styles/theme';

const ProfileScreen = () => {
  const { user, logout, hasRole } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          onPress: async () => {
            setLoading(true);
            try {
              await logout();
              // Navigation will be handled automatically by AuthContext state change
            } catch (error) {
              console.log('Logout error:', error);
            } finally {
              setLoading(false);
            }
          }, 
          style: 'destructive' 
        },
      ]
    );
  };

  const getRoleDescription = (role) => {
    switch (role) {
      case 'Admin':
        return 'Full system access and management';
      case 'Manager':
        return 'Manage clients, tasks, and view analytics';
      case 'Staff':
        return 'View and manage assigned tasks';
      case 'Client':
        return 'View progress and submit feedback';
      default:
        return '';
    }
  };

  const getRoleFeatures = (role) => {
    switch (role) {
      case 'Admin':
        return ['Manage Users', 'Manage Clients', 'View Analytics', 'Manage Payments', 'AI Assistant'];
      case 'Manager':
        return ['Manage Clients', 'Manage Tasks', 'View Analytics', 'Manage Payments', 'AI Assistant'];
      case 'Staff':
        return ['View My Tasks', 'Update Task Status'];
      case 'Client':
        return ['Submit Feedback', 'View My Tasks'];
      default:
        return [];
    }
  };

  if (!user) {
    return <Loading fullScreen message="Loading profile..." />;
  }

  return (
    <SafeAreaView style={commonStyles.safeArea}>
      <ScrollView style={commonStyles.content}>
        <Text style={commonStyles.title}>Profile</Text>

        {/* User Info Card */}
        <Card style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user.name?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
          </View>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{user.role}</Text>
          </View>
          <Text style={styles.roleDescription}>
            {getRoleDescription(user.role)}
          </Text>
        </Card>

        {/* Features Card */}
        <Card title="Your Features">
          {getRoleFeatures(user.role).map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <Text style={styles.featureBullet}>•</Text>
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </Card>

        {/* Account Info Card */}
        <Card title="Account Information">
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>User ID:</Text>
            <Text style={styles.infoValue}>{user._id}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email:</Text>
            <Text style={styles.infoValue}>{user.email}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Role:</Text>
            <Text style={styles.infoValue}>{user.role}</Text>
          </View>
        </Card>

        {/* Settings Card */}
        <Card title="Settings">
          <Button
            title="Logout"
            onPress={handleLogout}
            variant="danger"
            style={styles.logoutButton}
          />
        </Card>

        <Text style={styles.versionText}>Version 1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  profileCard: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  avatarContainer: {
    marginBottom: spacing.md,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: typography.fontSizes['3xl'],
    fontWeight: typography.fontWeights.bold,
    color: colors.white,
  },
  userName: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.bold,
    color: colors.white,
    marginBottom: spacing.xs,
  },
  userEmail: {
    fontSize: typography.fontSizes.md,
    color: colors.gray400,
    marginBottom: spacing.md,
  },
  roleBadge: {
    backgroundColor: colors.primary + '30',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 16,
    marginBottom: spacing.sm,
  },
  roleText: {
    color: colors.primary,
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.semibold,
  },
  roleDescription: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray400,
    textAlign: 'center',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray700,
  },
  featureBullet: {
    fontSize: typography.fontSizes.lg,
    color: colors.primary,
    marginRight: spacing.sm,
  },
  featureText: {
    fontSize: typography.fontSizes.md,
    color: colors.gray300,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray700,
  },
  infoLabel: {
    fontSize: typography.fontSizes.md,
    color: colors.gray400,
  },
  infoValue: {
    fontSize: typography.fontSizes.md,
    color: colors.white,
    flex: 1,
    textAlign: 'right',
    marginLeft: spacing.md,
  },
  logoutButton: {
    marginTop: spacing.md,
  },
  versionText: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray500,
    textAlign: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
  },
});

export default ProfileScreen;
