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
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Icon } from 'react-native-paper';
import * as SecureStore from 'expo-secure-store';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/api';
import { DashboardSummary } from '../../types';
import { API_BASE_URL } from '../../utils/constants';
import { getRolePermissions } from '../../utils/permissions';

const DashboardScreen = () => {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);

  const permissions = getRolePermissions(user?.role || '');

  /* ===================== STORAGE HELPERS ===================== */

  const getToken = () => {
    return localStorage.getItem('accessToken');
  };

  const clearAllStorage = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('username');
    localStorage.removeItem('userId');
  };

  /* ===================== API ===================== */

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/gym/members/dashboard/summary');
      setSummary(response.data);
    } catch (error) {
      console.error('Dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  /* ===================== LOGOUT ===================== */

  const performLogout = async () => {
    try {
      const token = await getToken();

      if (token) {
        await fetch(`${API_BASE_URL}/gym/auth/logout?token=${token}`, {
          method: 'POST',
        });
      }
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      await clearAllStorage();

      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    }
  };

  const handleLogout = () => {
    // WEB
    if (Platform.OS === 'web') {
      const ok = window.confirm('Are you sure you want to logout?');
      if (ok) performLogout();
      return;
    }

    // MOBILE
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: performLogout,
        },
      ],
      { cancelable: true }
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
      title: 'Total Users',
      value: summary?.totalUsers || 0,
      icon: 'account-group',
      color: '#3B82F6',
    },
    {
      title: 'Active Users',
      value: summary?.activeUsers || 0,
      icon: 'check-circle',
      color: '#10B981',
    },
    {
      title: 'Staff Count',
      value: summary?.staffCount || 0,
      icon: 'account-group',
      color: '#3B82F6',
    },
    {
      title: 'Member Count',
      value: summary?.memberCount || 0,
      icon: 'account-group',
      color: '#3B82F6',
    },
    {
      title: 'Trainer Count',
      value: summary?.trainerCount || 0,
      icon: 'account-group',
      color: '#3B82F6',
    },
    ...(permissions.canViewFinancialReports
      ? [
          {
            title: 'Monthly Revenue',
            value: `₹${summary?.totalPaymentsCurrentMonth || 0}`,
            icon: 'currency-inr',
            color: '#F59E0B',
          },
        ]
      : []),
  ];

  // Quick actions for admin users
  const quickActions = [
    ...(permissions.canManageGyms
      ? [
          {
            title: 'Add New Gym',
            icon: 'home-plus',
            color: '#8B5CF6',
            onPress: () => navigation.navigate('Gyms'),
          },
        ]
      : []),
    ...(permissions.canCreateMember
      ? [
          {
            title: 'Add Member',
            icon: 'account-plus',
            color: '#3B82F6',
            onPress: () => navigation.navigate('CreateMember'),
          },
        ]
      : []),
    ...(permissions.canRecordPayment
      ? [
          {
            title: 'Record Payment',
            icon: 'cash-plus',
            color: '#10B981',
            onPress: () => navigation.navigate('CreatePayment'),
          },
        ]
      : []),
    ...(permissions.canViewTrainers
      ? [
          {
            title: 'View Trainers',
            icon: 'dumbbell',
            color: '#F59E0B',
            onPress: () => navigation.navigate('Trainers'),
          },
        ]
      : []),
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome Back!</Text>
          <Text style={styles.title}>Dashboard</Text>
        </View>

        <TouchableOpacity
          style={styles.logoutButton}
          activeOpacity={0.7}
          onPress={handleLogout}
        >
          <View pointerEvents="none">
            <Icon source="logout" size={20} color="#EF4444" />
          </View>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsGrid}>
        {stats.map((item, i) => (
          <View key={i} style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: `${item.color}20` }]}>
              <Icon source={item.icon} size={24} color={item.color} />
            </View>
            <Text style={styles.statValue}>{item.value}</Text>
            <Text style={styles.statTitle}>{item.title}</Text>
          </View>
        ))}
      </View>

      {/* Quick Actions */}
      {quickActions.length > 0 && (
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action, index) => (
              <TouchableOpacity
                key={index}
                style={styles.quickActionCard}
                onPress={action.onPress}
                activeOpacity={0.7}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: `${action.color}20` }]}>
                  <Icon source={action.icon} size={24} color={action.color} />
                </View>
                <Text style={styles.quickActionText}>{action.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
};

export default DashboardScreen;

/* ===================== STYLES ===================== */

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
    elevation: 2,
    zIndex: 10,
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
  },
  quickActionsSection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  quickActionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
    flex: 1,
  },
});
