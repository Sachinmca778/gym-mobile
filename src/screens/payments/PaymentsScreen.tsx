import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Icon } from 'react-native-paper';
import api from '../../api/api';
import { Payment, PaymentSummary } from '../../types';

// Filter type enum
type FilterType = 'RECENT' | 'TODAY_EXPIRES' | 'UPCOMING_7_DAYS' | 'OVERDUES';

interface PaginatedResponse {
  content: Payment[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

const filterOptions: { label: string; value: FilterType; icon: string }[] = [
  { label: 'Recent Transactions', value: 'RECENT', icon: 'history' },
  { label: 'Today Expires', value: 'TODAY_EXPIRES', icon: 'calendar-today' },
  { label: 'Upcoming (7 Days)', value: 'UPCOMING_7_DAYS', icon: 'calendar-week' },
  { label: 'Overdues', value: 'OVERDUES', icon: 'alert-circle' },
];

const PaymentsScreen = () => {
  const navigation = useNavigation<any>();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [summary, setSummary] = useState<PaymentSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(true);
  
  // Filter state
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('RECENT');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 5;

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      
      const params = {
        filter: selectedFilter,
        page: currentPage,
        size: pageSize,
      };
      
      const [paymentsRes, summaryRes] = await Promise.all([
        api.get('/gym/payments/all_payments', { params }),
        api.get('/gym/payments/summary').catch(() => ({ data: null })),
      ]);
      
      const paymentsData = paymentsRes.data;
      if (paymentsData.content) {
        setPayments(paymentsData.content);
        setTotalElements(paymentsData.totalElements || 0);
        setTotalPages(paymentsData.totalPages || 0);
        setCurrentPage(paymentsData.currentPage || 0);
      } else if (Array.isArray(paymentsData)) {
        setPayments(paymentsData);
        setTotalElements(paymentsData.length);
        setTotalPages(1);
        setCurrentPage(0);
      }
      
      if (summaryRes.data) {
        setSummary(summaryRes.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      // Try to fetch payments only if summary fails
      try {
        const params = {
          filter: selectedFilter,
          page: currentPage,
          size: pageSize,
        };
        const paymentsRes = await api.get('/gym/payments/all_payments', { params });
        const paymentsData = paymentsRes.data;
        if (paymentsData.content) {
          setPayments(paymentsData.content);
          setTotalElements(paymentsData.totalElements || 0);
          setTotalPages(paymentsData.totalPages || 0);
        } else {
          setPayments(Array.isArray(paymentsData) ? paymentsData : paymentsData.content || []);
        }
      } catch (e) {
        console.error('Error fetching payments:', e);
        Alert.alert('Error', 'Failed to fetch payments');
      }
    } finally {
      setLoading(false);
      setSummaryLoading(false);
    }
  }, [selectedFilter, currentPage]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = async () => {
    setRefreshing(true);
    setCurrentPage(0); // Reset to first page on refresh
    await fetchData();
    setRefreshing(false);
  };

  const handleFilterChange = (filter: FilterType) => {
    setSelectedFilter(filter);
    setCurrentPage(0); // Reset to first page when filter changes
    setShowFilterDropdown(false);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
    }
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
      case 'BANK_TRANSFER':
        return 'bank';
      default:
        return 'wallet';
    }
  };

  const renderFilterDropdown = () => {
    if (!showFilterDropdown) return null;
    
    return (
      <View style={styles.dropdownContainer}>
        {filterOptions.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.dropdownItem,
              selectedFilter === option.value && styles.dropdownItemSelected,
            ]}
            onPress={() => handleFilterChange(option.value)}
          >
            <Icon 
              source={option.icon} 
              size={20} 
              color={selectedFilter === option.value ? '#3B82F6' : '#64748B'} 
            />
            <Text 
              style={[
                styles.dropdownItemText,
                selectedFilter === option.value && styles.dropdownItemTextSelected,
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderSummaryCard = () => {
    if (summaryLoading) {
      return (
        <View style={styles.summaryLoadingContainer}>
          <ActivityIndicator size="small" color="#3B82F6" />
        </View>
      );
    }

    return (
      <View style={styles.summaryContainer}>
        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, styles.summaryCardPrimary]}>
            <View style={styles.summaryIconContainer}>
              <Icon source="calendar-month" size={24} color="#3B82F6" />
            </View>
            <Text style={styles.summaryLabel}>This Month</Text>
            <Text style={styles.summaryValue}>
              {formatCurrency(summary?.currentMonthAmount || 0)}
            </Text>
          </View>

          <View style={[styles.summaryCard, styles.summaryCardSuccess]}>
            <View style={styles.summaryIconContainer}>
              <Icon source="cash-check" size={24} color="#10B981" />
            </View>
            <Text style={styles.summaryLabel}>Today</Text>
            <Text style={styles.summaryValue}>
              {formatCurrency(summary?.todayRevenue || 0)}
            </Text>
          </View>
        </View>

        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, styles.summaryCardWarning]}>
            <View style={styles.summaryIconContainer}>
              <Icon source="clock-alert" size={24} color="#F59E0B" />
            </View>
            <Text style={styles.summaryLabel}>Pending</Text>
            <Text style={styles.summaryValue}>
              {formatCurrency(summary?.pendingAmount || 0)}
            </Text>
          </View>

          <View style={[styles.summaryCard, styles.summaryCardDanger]}>
            <View style={styles.summaryIconContainer}>
              <Icon source="alert-circle" size={24} color="#EF4444" />
            </View>
            <Text style={styles.summaryLabel}>Overdue</Text>
            <Text style={styles.summaryValue}>
              {formatCurrency(summary?.totalOverdueAmount || 0)}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderPaymentItem = ({ item }: { item: Payment }) => (
    <View style={styles.paymentCard}>
      <View style={styles.paymentHeader}>
        <View style={styles.methodContainer}>
          <View style={styles.methodIconContainer}>
            <Icon source={getMethodIcon(item.paymentMethod) as any} size={20} color="#3B82F6" />
          </View>
          <View>
            <Text style={styles.methodText}>{item.paymentMethod?.replace('_', ' ')}</Text>
            {item.transactionId && (
              <Text style={styles.transactionId}>{item.transactionId}</Text>
            )}
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

      {/* Member Details */}
      <View style={styles.memberDetailsContainer}>
        <View style={styles.memberInfoRow}>
          <Icon source="account" size={16} color="#3B82F6" />
          <Text style={styles.memberName}>
            {item.memberName || 'Unknown Member'}
          </Text>
        </View>
        <View style={styles.memberInfoRow}>
          <Icon source="phone" size={16} color="#64748B" />
          <Text style={styles.memberInfoText}>
            {item.memberPhone || 'N/A'}
          </Text>
        </View>
        <View style={styles.memberInfoRow}>
          <Icon source="email" size={16} color="#64748B" />
          <Text style={styles.memberInfoText}>
            {item.memberEmail || 'N/A'}
          </Text>
        </View>
        {item.membershipPlanName && (
          <View style={styles.memberInfoRow}>
            <Icon source="card-account-details" size={16} color="#10B981" />
            <Text style={styles.planNameText}>
              {item.membershipPlanName}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.amountSection}>
        <Text style={styles.currency}>₹</Text>
        <Text style={styles.amount}>{item.amount?.toLocaleString() || '0'}</Text>
      </View>

      <View style={styles.paymentDetails}>
        <View style={styles.detailRow}>
          <Icon source="identifier" size={14} color="#64748B" />
          <Text style={styles.detailText}>ID: {item.userId}</Text>
        </View>
        <View style={styles.detailRow}>
          <Icon source="calendar" size={14} color="#64748B" />
          <Text style={styles.detailText}>{formatDate((item.paymentDate || item.dueDate) || '')}</Text>
        </View>
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

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    
    return (
      <View style={styles.paginationContainer}>
        <TouchableOpacity
          style={[styles.paginationButton, currentPage === 0 && styles.paginationButtonDisabled]}
          onPress={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 0}
        >
          <Icon source="chevron-left" size={20} color={currentPage === 0 ? '#94A3B8' : '#3B82F6'} />
        </TouchableOpacity>
        
        <Text style={styles.paginationText}>
          {currentPage + 1} / {totalPages}
        </Text>
        
        <TouchableOpacity
          style={[styles.paginationButton, currentPage === totalPages - 1 && styles.paginationButtonDisabled]}
          onPress={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages - 1}
        >
          <Icon source="chevron-right" size={20} color={currentPage === totalPages - 1 ? '#94A3B8' : '#3B82F6'} />
        </TouchableOpacity>
      </View>
    );
  };

  if (loading && payments.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading payments...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Payments</Text>
          <Text style={styles.subtitle}>{totalElements} records</Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('CreatePayment')}
        >
          <Icon source="plus" size={20} color="#FFFFFF" />
          <Text style={styles.addButtonText}>New</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Filter Dropdown */}
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowFilterDropdown(!showFilterDropdown)}
          >
            <Icon source={filterOptions.find(f => f.value === selectedFilter)?.icon || 'filter'} size={20} color="#3B82F6" />
            <Text style={styles.filterButtonText}>
              {filterOptions.find(f => f.value === selectedFilter)?.label || 'Filter'}
            </Text>
            <Icon source={showFilterDropdown ? 'chevron-up' : 'chevron-down'} size={20} color="#64748B" />
          </TouchableOpacity>
          {renderFilterDropdown()}
        </View>

        {/* Summary Cards */}
        {renderSummaryCard()}

        {/* Payments List */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {filterOptions.find(f => f.value === selectedFilter)?.label || 'Recent Transactions'}
          </Text>
          <Text style={styles.pageInfo}>
            Showing {payments.length} of {totalElements} records (5 per page)
          </Text>
        </View>
        
        <FlatList
          data={payments}
          keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
          renderItem={renderPaymentItem}
          contentContainerStyle={styles.listContent}
          scrollEnabled={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon source="credit-card-off" size={48} color="#94A3B8" />
              <Text style={styles.emptyText}>No payments found</Text>
              <Text style={styles.emptySubText}>Try changing the filter</Text>
            </View>
          }
        />
        
        {/* Pagination */}
        {renderPagination()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 40,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerContent: {
    flex: 1,
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
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
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
  
  // Filter styles
  filterContainer: {
    padding: 16,
    paddingBottom: 0,
    position: 'relative',
    zIndex: 100,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterButtonText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
    marginLeft: 10,
  },
  dropdownContainer: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 101,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  dropdownItemSelected: {
    backgroundColor: '#EFF6FF',
  },
  dropdownItemText: {
    fontSize: 14,
    color: '#64748B',
    marginLeft: 12,
  },
  dropdownItemTextSelected: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  
  summaryLoadingContainer: {
    padding: 16,
    alignItems: 'center',
  },
  summaryContainer: {
    padding: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryCardPrimary: {
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  summaryCardSuccess: {
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  summaryCardWarning: {
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  summaryCardDanger: {
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  summaryIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
  },
  pageInfo: {
    fontSize: 12,
    color: '#94A3B8',
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
    paddingBottom: 16,
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
  transactionId: {
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
  
  // Member details styles
  memberDetailsContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  memberInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  memberName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
    marginLeft: 8,
  },
  memberInfoText: {
    fontSize: 13,
    color: '#64748B',
    marginLeft: 8,
  },
  planNameText: {
    fontSize: 13,
    color: '#10B981',
    fontWeight: '600',
    marginLeft: 8,
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
  },
  
  // Pagination styles
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 16,
  },
  paginationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  paginationButtonDisabled: {
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  paginationText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
});

export default PaymentsScreen;

