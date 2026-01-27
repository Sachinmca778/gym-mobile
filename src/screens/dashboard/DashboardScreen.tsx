import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Icon } from 'react-native-paper';
import * as SecureStore from 'expo-secure-store';
import api from '../../api/api';
import { DashboardSummary } from '../../types';
import { API_BASE_URL } from '../../utils/constants';

const DashboardScreen = () => {
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/gym/members/dashborad/summary');
      setSummary(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  const clearAllStorage = async () => {
    // Clear SecureStore
    await SecureStore.deleteItemAsync('accessToken');
    await SecureStore.deleteItemAsync('refreshToken');
    await SecureStore.deleteItemAsync('userRole');
    await SecureStore.deleteItemAsync('username');
    await SecureStore.deleteItemAsync('userId');
    
    // Clear localStorage for web
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userRole');
      localStorage.removeItem('username');
      localStorage.removeItem('userId');
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              // Get token from SecureStore
              const token = await SecureStore.getItemAsync('accessToken');
              
              if (token) {
                // Call backend logout
                await fetch(`${API_BASE_URL}/gym/auth/logout?token=${token}`, {
                  method: 'POST',
                });
              }
            } catch (error) {
              console.error('Logout error:', error);
            } finally {
              // Clear all stored data
              await clearAllStorage();
              
              // Reset navigation to login
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  const stats = [
    {
      title: 'Total Members',
      value: summary?.totalMembers || 0,
      icon: 'account-group',
      color: '#3B82F6',
      change: '+12%',
    },
    {
      title: 'Active Members',
      value: summary?.activeMembers || 0,
      icon: 'check-circle',
      color: '#10B981',
      change: '+8%',
    },
    {
      title: 'Monthly Revenue',
      value: `₹${summary?.totalPaymentsCurrentMonth || 0}`,
      icon: 'currency-inr',
      color: '#F59E0B',
      change: '+15%',
    },
    {
      title: 'Expiring Soon',
      value: summary?.expiringMembersCount || 0,
      icon: 'alert',
      color: '#EF4444',
      change: '-5%',
    },
  ];

  const quickActions = [
    { title: 'Add Member', icon: 'account-plus', color: '#3B82F6', screen: 'Members' },
    { title: 'Attendance', icon: 'check-circle', color: '#10B981', screen: 'Attendance' },
    { title: 'Memberships', icon: 'card-membership', color: '#8B5CF6', screen: 'Memberships' },
    { title: 'Payments', icon: 'credit-card', color: '#F59E0B', screen: 'Payments' },
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header with Logout */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.greeting}>Welcome Back!</Text>
          <Text style={styles.title}>Dashboard</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Icon source="logout" size={20} color="#EF4444" />
        </TouchableOpacity>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        {stats.map((stat, index) => (
          <View key={index} style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: `${stat.color}20` }]}>
              <Icon source={stat.icon} size={24} color={stat.color} />
            </View>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statTitle}>{stat.title}</Text>
            <Text style={[styles.statChange, { color: stat.change.startsWith('+') ? '#10B981' : '#EF4444' }]}>
              {stat.change}
            </Text>
          </View>
        ))}
      </View>

      {/* Quick Actions */}
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.quickActions}>
        {quickActions.map((action, index) => (
          <TouchableOpacity
            key={index}
            style={styles.actionCard}
            onPress={() => navigation.navigate(action.screen as any)}
          >
            <View style={[styles.actionIcon, { backgroundColor: `${action.color}20` }]}>
              <Icon source={action.icon} size={28} color={action.color} />
            </View>
            <Text style={styles.actionText}>{action.title}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Alerts */}
      {summary && summary.expiringMembersCount > 0 && (
        <View style={styles.alertCard}>
          <View style={styles.alertHeader}>
            <Icon source="alert-circle" size={24} color="#F59E0B" />
            <Text style={styles.alertTitle}>Attention Required</Text>
          </View>
          <Text style={styles.alertText}>
            {summary.expiringMembersCount} memberships are expiring this week.
            Consider sending renewal reminders.
          </Text>
          <TouchableOpacity style={styles.alertButton}>
            <Text style={styles.alertButtonText}>View Details</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    padding: 16,
    paddingTop: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: 16,
    color: '#64748B',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  logoutButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  statTitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
  },
  statChange: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
    marginTop: 8,
    marginBottom: 16,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '23%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0F172A',
    textAlign: 'center',
  },
  alertCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginLeft: 8,
  },
  alertText: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 12,
  },
  alertButton: {
    backgroundColor: '#F59E0B',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
  },
  alertButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default DashboardScreen;

