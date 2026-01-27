import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Icon, RadioButton } from 'react-native-paper';
import api from '../../api/api';
import {
  PaymentForm,
  MemberSearchResult,
  MembershipPlanSelect,
} from '../../types';

const CreatePaymentScreen = () => {
  const navigation = useNavigation<any>();

  // Form state
  const [formData, setFormData] = useState<PaymentForm>({
    memberId: 0,
    amount: 0,
    paymentMethod: 'UPI',
    status: 'COMPLETED',
    paymentDate: new Date().toISOString().split('T')[0],
  });

  // UI state
  const [submitting, setSubmitting] = useState(false);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Search state
  const [memberSearch, setMemberSearch] = useState('');
  const [memberSearchResults, setMemberSearchResults] = useState<MemberSearchResult[]>([]);
  const [showMemberDropdown, setShowMemberDropdown] = useState(false);
  const [searchingMembers, setSearchingMembers] = useState(false);

  // Data
  const [membershipPlans, setMembershipPlans] = useState<MembershipPlanSelect[]>([]);
  const [selectedMember, setSelectedMember] = useState<MemberSearchResult | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<MembershipPlanSelect | null>(null);

  // Fetch membership plans
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoadingPlans(true);
        const response = await api.get('/gym/membership_plans/active');
        setMembershipPlans(response.data);
      } catch (error) {
        console.error('Error fetching plans:', error);
      } finally {
        setLoadingPlans(false);
      }
    };
    fetchPlans();
  }, []);

  // Debounced member search
  const searchMembers = useCallback(async (searchTerm: string) => {
    if (!searchTerm || searchTerm.length < 2) {
      setMemberSearchResults([]);
      setShowMemberDropdown(false);
      return;
    }

    try {
      setSearchingMembers(true);
      const response = await api.get(`/gym/members/search?searchTerm=${searchTerm}&page=0&size=10`);
      const data = response.data;
      setMemberSearchResults(data.content || data || []);
      setShowMemberDropdown(true);
    } catch (error) {
      console.error('Error searching members:', error);
      setMemberSearchResults([]);
    } finally {
      setSearchingMembers(false);
    }
  }, []);

  useEffect(() => {
    const debounce = setTimeout(() => {
      searchMembers(memberSearch);
    }, 300);
    return () => clearTimeout(debounce);
  }, [memberSearch, searchMembers]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSelectMember = (member: MemberSearchResult) => {
    setSelectedMember(member);
    setFormData(prev => ({ ...prev, memberId: member.id }));
    setMemberSearch(`${member.firstName} ${member.lastName}`);
    setShowMemberDropdown(false);
    setMemberSearch('');
  };

  const handleSelectPlan = (plan: MembershipPlanSelect) => {
    setSelectedPlan(plan);
    setFormData(prev => ({
      ...prev,
      membershipId: plan.id,
      amount: plan.price,
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.memberId) newErrors.member = 'Please select a member';
    if (!formData.amount || formData.amount <= 0) newErrors.amount = 'Please enter a valid amount';
    if (!formData.paymentDate) newErrors.paymentDate = 'Please select a payment date';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      
      // Format date as LocalDateTime string for backend (yyyy-MM-ddTHH:mm:ss)
      const formatDateTime = (dateStr: string) => {
        const date = new Date(dateStr);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}:00`;
      };

      const payload = {
        memberId: formData.memberId,
        amount: Number(formData.amount),
        paymentMethod: formData.paymentMethod,
        status: formData.status,
        paymentDate: formatDateTime(formData.paymentDate), // Backend expects paymentDate
        transactionId: formData.transactionId || undefined,
        notes: formData.notes || undefined,
      };
      
      if (formData.membershipId) {
        payload.membershipId = formData.membershipId;
      }
      
      await api.post('/gym/payments/create_record', payload);
      Alert.alert('Success', 'Payment recorded successfully!', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error: any) {
      console.error('Error creating payment:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to record payment'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const paymentMethods = [
    { label: 'UPI', value: 'UPI', icon: 'smartphone' },
    { label: 'Cash', value: 'CASH', icon: 'cash' },
    { label: 'Card', value: 'CARD', icon: 'credit-card' },
    { label: 'Online', value: 'ONLINE', icon: 'web' },
    { label: 'Bank Transfer', value: 'BANK_TRANSFER', icon: 'bank' },
  ];

  const statusOptions = [
    { label: 'Completed', value: 'COMPLETED', color: '#10B981' },
    { label: 'Pending', value: 'PENDING', color: '#F59E0B' },
    { label: 'Failed', value: 'FAILED', color: '#EF4444' },
    { label: 'Refunded', value: 'REFUNDED', color: '#8B5CF6' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Icon source="arrow-left" size={24} color="#3B82F6" />
            </TouchableOpacity>
            <View style={styles.headerContent}>
              <Text style={styles.title}>Record Payment</Text>
              <Text style={styles.subtitle}>Add a new payment record</Text>
            </View>
          </View>

          {/* Form Card */}
          <View style={styles.formCard}>
            {/* Member Selection */}
            <View style={styles.formField}>
              <Text style={styles.label}>Member *</Text>
              <View style={[styles.inputContainer, errors.member && styles.inputError]}>
                <Icon source="account" size={20} color="#64748B" />
                <TextInput
                  style={styles.textInput}
                  placeholder="Search member..."
                  value={memberSearch}
                  onChangeText={(value) => {
                    setMemberSearch(value);
                    if (selectedMember) {
                      setSelectedMember(null);
                      setFormData(prev => ({ ...prev, memberId: 0 }));
                    }
                  }}
                />
                {searchingMembers && (
                  <ActivityIndicator size="small" color="#3B82F6" />
                )}
              </View>
              {errors.member && <Text style={styles.errorText}>{errors.member}</Text>}

              {/* Member Dropdown */}
              {showMemberDropdown && memberSearchResults.length > 0 && (
                <View style={styles.dropdown}>
                  <FlatList
                    data={memberSearchResults}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={styles.dropdownItem}
                        onPress={() => handleSelectMember(item)}
                      >
                        <View style={styles.memberInfo}>
                          <Text style={styles.memberName}>
                            {item.firstName} {item.lastName}
                          </Text>
                          <Text style={styles.memberCode}>{item.memberCode}</Text>
                        </View>
                        <Text style={styles.memberPhone}>{item.phone}</Text>
                      </TouchableOpacity>
                    )}
                    maxHeight={200}
                  />
                </View>
              )}

              {/* Selected Member Badge */}
              {selectedMember && (
                <View style={styles.selectedBadge}>
                  <Icon source="check-circle" size={16} color="#10B981" />
                  <Text style={styles.selectedText}>
                    {selectedMember.firstName} {selectedMember.lastName}
                  </Text>
                </View>
              )}
            </View>

            {/* Membership Plan Selection */}
            <View style={styles.formField}>
              <Text style={styles.label}>Membership Plan (Optional)</Text>
              {loadingPlans ? (
                <ActivityIndicator size="small" color="#3B82F6" />
              ) : (
                <View style={styles.plansContainer}>
                  {membershipPlans.map((plan) => (
                    <TouchableOpacity
                      key={plan.id}
                      style={[
                        styles.planCard,
                        selectedPlan?.id === plan.id && styles.planCardSelected,
                      ]}
                      onPress={() => handleSelectPlan(plan)}
                    >
                      <View style={styles.planHeader}>
                        <Text style={styles.planName}>{plan.name}</Text>
                        {selectedPlan?.id === plan.id && (
                          <Icon source="check" size={20} color="#3B82F6" />
                        )}
                      </View>
                      <Text style={styles.planPrice}>
                        {formatAmount(plan.price)} / {plan.durationMonths} months
                      </Text>
                      <Text style={styles.planMonthly} numberOfLines={1}>
                        (~{formatAmount(Math.round(plan.price / plan.durationMonths))}/month)
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Amount */}
            <View style={styles.formField}>
              <Text style={styles.label}>Amount (₹) *</Text>
              <View style={[styles.inputContainer, errors.amount && styles.inputError]}>
                <Icon source="currency-inr" size={20} color="#64748B" />
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter amount"
                  value={formData.amount ? formData.amount.toString() : ''}
                  onChangeText={(value) => handleInputChange('amount', value)}
                  keyboardType="numeric"
                />
              </View>
              {errors.amount && <Text style={styles.errorText}>{errors.amount}</Text>}
            </View>

            {/* Payment Method */}
            <View style={styles.formField}>
              <Text style={styles.label}>Payment Method</Text>
              <View style={styles.methodGrid}>
                {paymentMethods.map((method) => (
                  <TouchableOpacity
                    key={method.value}
                    style={[
                      styles.methodButton,
                      formData.paymentMethod === method.value && styles.methodButtonSelected,
                    ]}
                    onPress={() => handleInputChange('paymentMethod', method.value)}
                  >
                    <Icon
                      source={method.icon as any}
                      size={24}
                      color={formData.paymentMethod === method.value ? '#FFFFFF' : '#64748B'}
                    />
                    <Text
                      style={[
                        styles.methodText,
                        formData.paymentMethod === method.value && styles.methodTextSelected,
                      ]}
                    >
                      {method.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Transaction ID */}
            <View style={styles.formField}>
              <Text style={styles.label}>Transaction ID (Optional)</Text>
              <View style={styles.inputContainer}>
                <Icon source="identifier" size={20} color="#64748B" />
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g., TXN123456789"
                  value={formData.transactionId || ''}
                  onChangeText={(value) => handleInputChange('transactionId', value)}
                />
              </View>
            </View>

            {/* Payment Date */}
            <View style={styles.formField}>
              <Text style={styles.label}>Payment Date *</Text>
              <View style={[styles.inputContainer, errors.paymentDate && styles.inputError]}>
                <Icon source="calendar" size={20} color="#64748B" />
                <TextInput
                  style={styles.textInput}
                  placeholder="YYYY-MM-DD"
                  value={formData.paymentDate}
                  onChangeText={(value) => handleInputChange('paymentDate', value)}
                />
              </View>
              {errors.paymentDate && (
                <Text style={styles.errorText}>{errors.paymentDate}</Text>
              )}
            </View>

            {/* Status */}
            <View style={styles.formField}>
              <Text style={styles.label}>Payment Status</Text>
              <View style={styles.statusContainer}>
                {statusOptions.map((status) => (
                  <TouchableOpacity
                    key={status.value}
                    style={[
                      styles.statusButton,
                      formData.status === status.value && {
                        backgroundColor: status.color + '20',
                        borderColor: status.color,
                      },
                    ]}
                    onPress={() => handleInputChange('status', status.value)}
                  >
                    <View
                      style={[
                        styles.statusDot,
                        { backgroundColor: status.color },
                        formData.status === status.value && styles.statusDotSelected,
                      ]}
                    />
                    <Text
                      style={[
                        styles.statusText,
                        formData.status === status.value && {
                          color: status.color,
                          fontWeight: '600',
                        },
                      ]}
                    >
                      {status.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Notes */}
            <View style={styles.formField}>
              <Text style={styles.label}>Notes (Optional)</Text>
              <View style={[styles.inputContainer, styles.textArea]}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Add any notes..."
                  value={formData.notes || ''}
                  onChangeText={(value) => handleInputChange('notes', value)}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>
            </View>
          </View>

          {/* Submit Button */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Icon source="check" size={20} color="#FFFFFF" />
                  <Text style={styles.submitButtonText}>Record Payment</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
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
    marginTop: 4,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  formField: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  textInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#0F172A',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 6,
  },
  dropdown: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    marginTop: 4,
    maxHeight: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dropdownItem: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  memberInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
  },
  memberCode: {
    fontSize: 12,
    color: '#64748B',
  },
  memberPhone: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
  selectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  selectedText: {
    fontSize: 14,
    color: '#10B981',
    marginLeft: 6,
    fontWeight: '500',
  },
  plansContainer: {
    gap: 10,
  },
  planCard: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 14,
  },
  planCardSelected: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
  },
  planPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3B82F6',
    marginTop: 4,
  },
  planMonthly: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  methodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  methodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  methodButtonSelected: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  methodText: {
    fontSize: 13,
    color: '#64748B',
    marginLeft: 6,
  },
  methodTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  statusContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusDotSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusText: {
    fontSize: 13,
    color: '#64748B',
  },
  textArea: {
    minHeight: 80,
    alignItems: 'flex-start',
  },
  buttonContainer: {
    paddingVertical: 8,
    paddingBottom: 32,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 16,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default CreatePaymentScreen;

