import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Icon } from 'react-native-paper';
import api from '../../api/api';
import { Payment } from '../../types';

const PaymentsScreen = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const response = await api.get('/gym/payments');
      setPayments(response.data);
    } catch (error) {
      console.error('Error fetching payments:', error);
      Alert.alert('Error', 'Failed to fetch payments');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPayments();
    setRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return '#10B981';
      case 'PENDING':
        return '#F59E0B';
      case 'FAILED':
        return '#EF4444';
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
      default:
        return 'wallet';
    }
  };

  const renderPaymentItem = ({ item }: { item: Payment }) => (
    <View style={styles.paymentCard}>
      <View style={styles.paymentHeader}>
        <View style={styles.methodContainer}>
          <Icon source={getMethodIcon(item.paymentMethod) as any} size={24} color="#3B82F6" />
          <Text style={styles.methodText}>{item.paymentMethod}</Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: `${getStatusColor(item.status)}20` },
          ]}
        >
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {item.status}
          </Text>
        </View>
      </View>

      <View style={styles.amountContainer}>
        <Text style={styles.currency}>₹</Text>
        <Text style={styles.amount}>{item.amount.toFixed(2)}</Text>
      </View>

      <View style={styles.paymentDetails}>
        <View style={styles.detailRow}>
          <Icon source="calendar" size={16} color="#64748B" />
          <Text style={styles.detailText}>
            {new Date(item.paymentDate).toLocaleDateString()}
          </Text>
        </View>
        {item.transactionId && (
          <View style={styles.detailRow}>
            <Icon source="identifier" size={16} color="#64748B" />
            <Text style={styles.detailText}>{item.transactionId}</Text>
          </View>
        )}
      </View>

      {item.notes && (
        <Text style={styles.notes}>{item.notes}</Text>
      )}
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
        <Text style={styles.title}>Payments</Text>
        <Text style={styles.subtitle}>{payments.length} transactions</Text>
      </View>

      <FlatList
        data={payments}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderPaymentItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon source="credit-card-off" size={48} color="#64748B" />
            <Text style={styles.emptyText}>No payments found</Text>
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
  paymentCard: {
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
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  methodContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  methodText: {
    fontSize: 14,
    fontWeight: '600',
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
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  currency: {
    fontSize: 20,
    fontWeight: '600',
    color: '#3B82F6',
  },
  amount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  paymentDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
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
  notes: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    fontStyle: 'italic',
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

export default PaymentsScreen;

