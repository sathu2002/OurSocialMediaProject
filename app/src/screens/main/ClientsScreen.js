import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { clientApi } from '../../api';
import { Card, Button, Loading, EmptyState } from '../../components';
import { colors, typography, spacing, commonStyles } from '../../styles/theme';

const ClientsScreen = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const fetchClients = async () => {
    try {
      setError('');
      const response = await clientApi.getClients();
      setClients(response.data || []);
    } catch (error) {
      console.log('Fetch clients error:', error);
      setError(error.response?.data?.message || 'Failed to load clients');
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
    switch (packageName) {
      case 'Diamond':
        return '#b9f2ff';
      case 'Platinum':
        return '#e5e4e2';
      case 'Gold':
        return '#ffd700';
      case 'Silver':
      default:
        return '#c0c0c0';
    }
  };

  const renderClient = ({ item }) => (
    <Card style={styles.clientCard}>
      <View style={styles.clientHeader}>
        <View>
          <Text style={styles.clientName}>{item.name}</Text>
          <Text style={styles.clientEmail}>{item.email}</Text>
        </View>
        <View style={[styles.packageBadge, { borderColor: getPackageColor(item.package) }]}>
          <Text style={[styles.packageText, { color: getPackageColor(item.package) }]}>
            {item.package}
          </Text>
        </View>
      </View>
      
      {item.company && (
        <Text style={styles.clientCompany}>{item.company}</Text>
      )}
      
      {item.phone && (
        <Text style={styles.clientPhone}>{item.phone}</Text>
      )}

      <View style={styles.statusRow}>
        <View style={[styles.statusBadge, { 
          backgroundColor: item.status === 'active' ? colors.success + '30' : colors.error + '30' 
        }]}>
          <Text style={[styles.statusText, { 
            color: item.status === 'active' ? colors.success : colors.error 
          }]}>
            {item.status === 'active' ? 'Active' : 'Inactive'}
          </Text>
        </View>
      </View>
    </Card>
  );

  if (loading) {
    return <Loading fullScreen message="Loading clients..." />;
  }

  if (error && clients.length === 0) {
    return (
      <SafeAreaView style={commonStyles.safeArea}>
        <View style={commonStyles.content}>
          <EmptyState
            title="Error Loading Clients"
            message={error}
            actionLabel="Retry"
            onAction={loadData}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={commonStyles.safeArea}>
      <View style={commonStyles.content}>
        <Text style={commonStyles.title}>Clients</Text>
        
        {clients.length === 0 ? (
          <EmptyState
            title="No Clients"
            message="No clients found in the system."
          />
        ) : (
          <FlatList
            data={clients}
            renderItem={renderClient}
            keyExtractor={(item) => item._id}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            contentContainerStyle={styles.listContent}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  clientCard: {
    marginBottom: spacing.md,
  },
  clientHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  clientName: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    color: colors.white,
    marginBottom: spacing.xs,
  },
  clientEmail: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray400,
  },
  packageBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  packageText: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.semibold,
  },
  clientCompany: {
    fontSize: typography.fontSizes.md,
    color: colors.gray300,
    marginBottom: spacing.xs,
  },
  clientPhone: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray400,
    marginBottom: spacing.sm,
  },
  statusRow: {
    flexDirection: 'row',
    marginTop: spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.medium,
  },
  listContent: {
    paddingBottom: spacing.lg,
  },
});

export default ClientsScreen;
