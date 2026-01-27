import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Icon } from 'react-native-paper';
import api from '../../api/api';
import { MembershipPlan } from '../../types';

const MembershipsScreen = () => {
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchMembershipPlans();
  }, []);

  const fetchMembershipPlans = async () => {
    try {
      const response = await api.get('/gym/membership-plans');
      setPlans(response.data);
    } catch (error) {
      console.error('Error fetching membership plans:', error);
      Alert.alert('Error', 'Failed to fetch membership plans');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchMembershipPlans();
    setRefreshing(false);
  };

  const renderPlanItem = ({ item }: { item: MembershipPlan }) => (
    <View style={styles.planCard}>
      <View style={styles.planHeader}>
        <Text style={styles.planName}>{item.name}</Text>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: item.isActive ? '#10B98120' : '#EF444420' },
          ]}
        >
          <Text
            style={[styles.statusText, { color: item.isActive ? '#10B981' : '#EF4444' }]}
          >
            {item.isActive ? 'Active' : 'Inactive'}
          </Text>
        </View>
      </View>

      <Text style={styles.planDescription}>{item.description}</Text>

      <View style={styles.priceContainer}>
        <Text style={styles.currency}>₹</Text>
        <Text style={styles.price}>{item.price}</Text>
        <Text style={styles.duration}>/ {item.durationMonths} months</Text>
      </View>

      <View style={styles.featuresContainer}>
        {item.features?.map((feature, index) => (
          <View key={index} style={styles.featureItem}>
            <Icon source="check" size={16} color="#10B981" />
            <Text style={styles.featureText}>{feature}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Membership Plans</Text>
        <Text style={styles.subtitle}>{plans.length} plans available</Text>
      </View>

      <FlatList
        data={plans}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderPlanItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon source="card-membership" size={48} color="#64748B" />
            <Text style={styles.emptyText}>No membership plans found</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    padding: 16,
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
  },
  planCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  planName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  planDescription: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 16,
    lineHeight: 20,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 16,
  },
  currency: {
    fontSize: 20,
    fontWeight: '600',
    color: '#3B82F6',
  },
  price: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  duration: {
    fontSize: 16,
    color: '#64748B',
    marginLeft: 4,
  },
  featuresContainer: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    color: '#0F172A',
    marginLeft: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    color: '#64748B',
    marginTop: 12,
  },
});

export default MembershipsScreen;

