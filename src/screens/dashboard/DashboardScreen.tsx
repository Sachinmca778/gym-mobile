import React, { useEffect, useState, useCallback } from 'react';
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
import { LinearGradient } from 'expo-linear-gradient';
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
        { text: 'Logout', style: 'destructive', onPress: performLogout },
      ],
      { cancelable: true }
    );
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  const stats = [
    { label: 'Total Users', value: summary?.totalUsers || 0, icon: 'account-group', color: '#4F46E5' },
    { label: 'Active Users', value: summary?.activeUsers || 0, icon: 'check-circle', color: '#10B981' },
    { label: 'Staff', value: summary?.staffCount || 0, icon: 'account-tie', color: '#F59E0B' },
    { label: 'Members', value: summary?.memberCount || 0, icon: 'account', color: '#6366F1' },
    { label: 'Trainers', value: summary?.trainerCount || 0, icon: 'dumbbell', color: '#EC4899' },
    ...(permissions.canViewFinancialReports
      ? [
          {
            label: 'Revenue',
            value: `₹${summary?.totalPaymentsCurrentMonth || 0}`,
            icon: 'currency-inr',
            color: '#14B8A6',
          },
        ]
      : []),
  ];

  const quickActions = [
    ...(permissions.canManageGyms
      ? [{ label: 'Add Gym', icon: 'home-plus', screen: 'Gyms' }]
      : []),
    ...(permissions.canCreateMembershipPlan
      ? [{ label: 'Create MembershipPlan', icon: 'card-plus', screen: 'CreateMembershipPlan' }]
      : []),
    ...(permissions.canManageUsers
      ? [{ label: 'Add User', icon: 'account-plus', screen: 'Signup' }]
      : []),
    ...(permissions.canRecordPayment
      ? [{ label: 'Record Payment', icon: 'cash-plus', screen: 'CreatePayment' }]
      : []),
    ...(permissions.canViewTrainers
      ? [{ label: 'View Trainers', icon: 'dumbbell', screen: 'Trainers' }]
      : []),
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 30 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      showsVerticalScrollIndicator={false}
    >
      <LinearGradient
        colors={['rgb(0 0 0)', 'rgb(99, 102, 241)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View>
          <Text style={styles.welcome}>Welcome back,</Text>
          <Text style={styles.username}>{user?.username || 'Admin'} 👋</Text>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Icon source="logout" size={22} color="#fff" />
        </TouchableOpacity>
      </LinearGradient>

      {/* STATS */}
      <View style={styles.statsWrapper}>
        {stats.map((item, index) => (
          <View key={index} style={styles.statCard}>
            <View style={[styles.iconCircle, { backgroundColor: `${item.color}20` }]}>
              <Icon source={item.icon} size={22} color={item.color} />
            </View>
            <Text style={styles.statValue}>{item.value}</Text>
            <Text style={styles.statLabel}>{item.label}</Text>
          </View>
        ))}
      </View>

      {/* QUICK ACTIONS */}
      {quickActions.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsWrapper}>
            {quickActions.map((action, index) => (
              <TouchableOpacity
                key={index}
                style={styles.actionCard}
                onPress={() => navigation.navigate(action.screen)}
              >
                <Icon source={action.icon} size={24} color="#4F46E5" />
                <Text style={styles.actionText}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}
    </ScrollView>
  );
};

export default DashboardScreen;

/* ===================== STYLES ===================== */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcome: {
    color: '#E0E7FF',
    fontSize: 14,
  },
  username: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
    marginTop: 4,
  },
  logoutBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 10,
    borderRadius: 12,
  },

  statsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 20,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    elevation: 5,
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 10,
    color: '#111827',
  },
  statLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 10,
    marginBottom: 15,
    paddingHorizontal: 20,
    color: '#111827',
  },

  actionsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  actionCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 3,
  },
  actionText: {
    marginLeft: 12,
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
});
