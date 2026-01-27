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
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Icon } from 'react-native-paper';
import api from '../../api/api';
import { MembershipPlan } from '../../types';

// Helper function to convert features to array
const getFeaturesArray = (features: any): string[] => {
  if (Array.isArray(features)) {
    return features;
  }
  if (typeof features === 'string' && features) {
    return features.split(',').map((f: string) => f.trim());
  }
  return [];
};

const MembershipsScreen = () => {
  const navigation = useNavigation<any>();
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'active' | 'all'>('active');

  useEffect(() => {
    fetchMembershipPlans();
  }, [selectedTab]);

  const fetchMembershipPlans = async () => {
    try {
      const endpoint = selectedTab === 'active' 
        ? '/gym/membership_plans/active' 
        : '/gym/membership_plans/all';
      const response = await api.get(endpoint);
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

  const renderPlanItem = ({ item }: { item: MembershipPlan }) => {
    const features = getFeaturesArray(item.features);
    
    return (
      <TouchableOpacity 
        style={styles.planCard}
        onPress={() => {
          Alert.alert(
            item.name,
            `Price: ₹${item.price}\nDuration: ${item.durationMonths} months\n\n${item.description || 'No description'}`,
            [
              { text: 'Close', style: 'cancel' },
              { text: 'View Features', onPress: () => {
                if (features.length > 0) {
                  Alert.alert('Features', features.join('\n• '));
                } else {
                  Alert.alert('Features', 'No features listed');
                }
              }},
            ]
          );
        }}
        activeOpacity={0.8}
      >
        <View style={styles.planHeader}>
          <View style={styles.planTitleRow}>
            <View style={styles.iconContainer}>
              <Icon source="crown" size={24} color="#FFFFFF" />
            </View>
            <View>
              <Text style={styles.planName}>{item.name}</Text>
              <Text style={styles.planDuration}>{item.durationMonths} months plan</Text>
            </View>
          </View>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: item.isActive ? '#10B98120' : '#EF444420' },
            ]}
          >
            <Icon 
              source={item.isActive ? 'check-circle' : 'close-circle'} 
              size={14} 
              color={item.isActive ? '#10B981' : '#EF4444'} 
            />
            <Text
              style={[styles.statusText, { color: item.isActive ? '#10B981' : '#EF4444' }]}
            >
              {item.isActive ? 'Active' : 'Inactive'}
            </Text>
          </View>
        </View>

        <Text style={styles.planDescription} numberOfLines={2}>
          {item.description || 'No description available'}
        </Text>

        <View style={styles.priceContainer}>
          <View style={styles.priceWrapper}>
            <Text style={styles.currency}>₹</Text>
            <Text style={styles.price}>{item.price.toLocaleString()}</Text>
          </View>
          <View style={styles.monthlyPrice}>
            <Text style={styles.monthlyText}>
              ₹{Math.round(item.price / item.durationMonths)}/month
            </Text>
          </View>
        </View>

        {features.length > 0 && (
          <View style={styles.featuresContainer}>
            <View style={styles.featuresHeader}>
              <Icon source="star" size={16} color="#F59E0B" />
              <Text style={styles.featuresTitle}>Features</Text>
            </View>
            <View style={styles.featuresGrid}>
              {features.slice(0, 4).map((feature: string, index: number) => (
                <View key={index} style={styles.featureItem}>
                  <Icon source="check" size={14} color="#10B981" />
                  <Text style={styles.featureText} numberOfLines={1}>{feature}</Text>
                </View>
              ))}
              {features.length > 4 && (
                <Text style={styles.moreFeatures}>+{features.length - 4} more</Text>
              )}
            </View>
          </View>
        )}

        <View style={styles.cardFooter}>
          <View style={styles.createdDate}>
            <Icon source="calendar" size={14} color="#94A3B8" />
            <Text style={styles.createdDateText}>
              Created: {new Date(item.createdAt).toLocaleDateString()}
            </Text>
          </View>
          <Icon source="chevron-right" size={20} color="#94A3B8" />
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Loading plans...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Membership Plans</Text>
        <Text style={styles.subtitle}>
          {selectedTab === 'active' ? 'Active' : 'All'} plans • {plans.length} available
        </Text>
      </View>

      {/* Tab Switcher */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'active' && styles.activeTab]}
          onPress={() => setSelectedTab('active')}
        >
          <Icon 
            source="check-circle" 
            size={18} 
            color={selectedTab === 'active' ? '#3B82F6' : '#64748B'} 
          />
          <Text style={[styles.tabText, selectedTab === 'active' && styles.activeTabText]}>
            Active
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'all' && styles.activeTab]}
          onPress={() => setSelectedTab('all')}
        >
          <Icon 
            source="format-list-bulleted" 
            size={18} 
            color={selectedTab === 'all' ? '#3B82F6' : '#64748B'} 
          />
          <Text style={[styles.tabText, selectedTab === 'all' && styles.activeTabText]}>
            All Plans
          </Text>
        </TouchableOpacity>
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
            <Icon source="card-membership" size={64} color="#E2E8F0" />
            <Text style={styles.emptyTitle}>No Plans Found</Text>
            <Text style={styles.emptyText}>
              {selectedTab === 'active' 
                ? 'No active membership plans available' 
                : 'No membership plans found'}
            </Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CreateMembershipPlan')}
      >
        <Icon source="plus" size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#64748B',
  },
  header: {
    padding: 16,
    paddingTop: 8,
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
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 12,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  activeTab: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
  },
  activeTabText: {
    color: '#3B82F6',
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
    paddingBottom: 100,
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
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  planTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  planName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  planDuration: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
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
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  priceWrapper: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  currency: {
    fontSize: 20,
    fontWeight: '600',
    color: '#3B82F6',
  },
  price: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  monthlyPrice: {
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  monthlyText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
  },
  featuresContainer: {
    marginBottom: 12,
  },
  featuresHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 6,
  },
  featuresTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
    flex: 1,
    minWidth: '45%',
  },
  featureText: {
    fontSize: 12,
    color: '#0F172A',
    flex: 1,
  },
  moreFeatures: {
    fontSize: 12,
    color: '#3B82F6',
    fontWeight: '500',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  createdDate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  createdDateText: {
    fontSize: 12,
    color: '#94A3B8',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});

export default MembershipsScreen;

