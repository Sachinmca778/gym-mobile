import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Platform,
} from 'react-native';
import { Icon } from 'react-native-paper';
import * as SecureStore from 'expo-secure-store';
import api from '../../api/api';
import { Payment } from '../../types';

const MyPaymentHistoryScreen = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [totalSpent, setTotalSpent] = useState<number>(0);

  // Load userId on mount
  useEffect(() => {
    const loadUserId = async () => {
      try {
        if (Platform.OS !== 'web') {
          const storedUserId = await SecureStore.getItemAsync('userId');
          if (storedUserId) setUserId(storedUserId);
        } else {
          const storedUserId = localStorage.getItem('userId');
          if (storedUserId) setUserId(storedUserId);
        }
      } catch (e) {
        console.error('Error loading userId:', e);
      }
    };
    loadUserId();
  }, []);

  const fetchPaymentHistory = async () => {
    if (!userId) {
      if (Platform.OS === 'web') {
        window.alert('User not authenticated');
      } else {
        Alert.alert('Error', 'User not authenticated');
      }
      return;
    }

    try {
      const response = await api.get(`/gym/payments/member/${userId}`);
      const paymentsData = response.data;
      
      if (Array.isArray(paymentsData)) {
        setPayments(paymentsData);
        
        // Calculate total spent (only completed payments)
        const total = paymentsData
          .filter((p: Payment) => p.status === 'COMPLETED')
          .reduce((sum: number, p: Payment) => sum + (p.amount || 0), 0);
        setTotalSpent(total);
      }
    } catch (error: any) {
      console.error('Error fetching payment history:', error);
      Alert.alert(
        'Error',
        error?.response?.data?.message || 'Failed to fetch payment history'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentHistory();
  }, [userId]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPaymentHistory();
    setRefreshing(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return '#10B981';
      case 'PENDING':
        return '#F59E0B';
      case 'FAILED':
        return '#EF4444';
      case 'REFUNDED':
        return '#8B5CF6';
      default:
        return '#64748B';
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'CASH':
        return 'cash';
      case 'UPI':
        return 'smartphone';
      case 'CARD':
        return 'credit-card';
      case 'ONLINE':
        return 'web';
      case 'BANK_TRANSFER':
        return 'bank';
      default:
        return 'wallet';
    }
  };

  const renderPaymentItem = ({ item }: { item: Payment }) => (
    <View style={styles.paymentCard}>
      <View style={styles.paymentHeader}>
        <View style={styles.methodContainer}>
          <View style={styles.methodIconContainer}>
            <Icon 
              source={getMethodIcon(item.paymentMethod) as any} 
              size={20} 
              color="#3B82F6" 
            />
          </View>
          <View>
            <Text style={styles.methodText}>
              {item.paymentMethod?.replace('_', ' ') || 'Payment'}
            </Text>
            <Text style={styles.paymentDate}>
              {formatDateTime(item.paymentDate)}
            </Text>
          </View>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: `${getStatusColor(item.status)}15` },
          ]}
        >
          <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {item.status}
          </Text>
        </View>
      </View>

      <View style={styles.amountSection}>
        <Text style={styles.currency}>₹</Text>
        <Text style={styles.amount}>{item.amount?.toLocaleString() || '0'}</Text>
      </View>

      <View style={styles.paymentDetails}>
        {item.transactionId && (
          <View style={styles.detailRow}>
            <Icon source="identifier" size={14} color="#64748B" />
            <Text style={styles.detailText} numberOfLines={1}>
              TXN: {item.transactionId}
            </Text>
          </View>
        )}
        {item.notes && (
          <View style={styles.detailRow}>
            <Icon source="text" size={14} color="#64748B" />
            <Text style={styles.detailText} numberOfLines={1}>
              {item.notes}
            </Text>
          </View>
        )}
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading payment history...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>My Payments</Text>
        <Text style={styles.subtitle}>{payments.length} transactions</Text>
      </View>

      {/* Summary Card */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryIconContainer}>
          <Icon source="wallet" size={28} color="#3B82F6" />
        </View>
        <Text style={styles.summaryLabel}>Total Spent</Text>
        <Text style={styles.summaryValue}>{formatCurrency(totalSpent)}</Text>
      </View>

      {/* Payment History List */}
      <FlatList
        data={payments}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        renderItem={renderPaymentItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon source="credit-card-off" size={48} color="#94A3B8" />
            <Text style={styles.emptyText}>No payment history</Text>
            <Text style={styles.emptySubText}>
              Your payment transactions will appear here
            </Text>
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
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748B',
  },
  summaryCard: {
    margin: 16,
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
    paddingBottom: 32,
  },
  paymentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  methodContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  methodIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  methodText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
    textTransform: 'capitalize',
  },
  paymentDate: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  amountSection: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  currency: {
    fontSize: 18,
    fontWeight: '600',
    color: '#3B82F6',
  },
  amount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  paymentDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 12,
    color: '#64748B',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 12,
  },
  emptySubText: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 4,
    textAlign: 'center',
  },
});

export default MyPaymentHistoryScreen;

