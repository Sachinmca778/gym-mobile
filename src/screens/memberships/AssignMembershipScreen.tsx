import React, { useState, useEffect, useMemo } from 'react';
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
import DateTimePicker from '@react-native-community/datetimepicker';
import api from '../../api/api';
import { Member, MembershipPlan, MemberSearchItem, MemberMembershipForm } from '../../types';

const AssignMembershipScreen = () => {
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showMembersDropdown, setShowMembersDropdown] = useState(false);
  const [showPlanDropdown, setShowPlanDropdown] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form state
  const [formData, setFormData] = useState<MemberMembershipForm>({
    memberId: 0,
    planId: 0,
    startDate: '',
    endDate: '',
    amountPaid: 0,
    autoRenewal: false,
  });

  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<MembershipPlan | null>(null);

  // Date picker state
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [startDate, setStartDate] = useState<Date>(new Date());

  // Calculate min date (15 days ago)
  const minDate = new Date();
  minDate.setDate(minDate.getDate() - 15);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch all members
      const membersResponse = await api.get('/gym/members/all');
      setMembers(membersResponse.data);
      
      // Fetch active plans
      const plansResponse = await api.get('/gym/membership_plans/active');
      setPlans(plansResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      Alert.alert('Error', 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = useMemo(() => {
    if (!searchTerm) return [];
    const term = searchTerm.toLowerCase();
    return members.filter(member => 
      member.firstName.toLowerCase().includes(term) ||
      member.lastName.toLowerCase().includes(term) ||
      member.memberCode?.toLowerCase().includes(term) ||
      member.phone?.includes(term)
    );
  }, [members, searchTerm]);

  const handleMemberSelect = (member: Member) => {
    setSelectedMember(member);
    setFormData(prev => ({ ...prev, memberId: member.id }));
    setSearchTerm(`${member.firstName} ${member.lastName} (${member.memberCode})`);
    setShowMembersDropdown(false);
    setErrors(prev => ({ ...prev, memberId: '' }));
  };

  const handlePlanSelect = (plan: MembershipPlan) => {
    setSelectedPlan(plan);
    setFormData(prev => ({ 
      ...prev, 
      planId: plan.id,
      amountPaid: plan.price 
    }));
    setShowPlanDropdown(false);
    setErrors(prev => ({ ...prev, planId: '' }));
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setStartDate(selectedDate);
      const formattedDate = selectedDate.toISOString().split('T')[0];
      setFormData(prev => ({ ...prev, startDate: formattedDate }));
    }
  };

  const calculateEndDate = () => {
    if (formData.startDate && selectedPlan) {
      const start = new Date(formData.startDate);
      const end = new Date(start);
      end.setMonth(end.getMonth() + selectedPlan.durationMonths);
      return end.toISOString().split('T')[0];
    }
    return '';
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.memberId) newErrors.memberId = 'Please select a member';
    if (!formData.planId) newErrors.planId = 'Please select a plan';
    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    if (!formData.amountPaid || formData.amountPaid <= 0) newErrors.amountPaid = 'Valid amount is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const endDate = calculateEndDate();
    
    try {
      setSubmitting(true);
      
      await api.post('/gym/memberships/create', {
        memberId: formData.memberId,
        planId: formData.planId,
        startDate: formData.startDate,
        endDate: endDate,
        amountPaid: formData.amountPaid,
        autoRenewal: formData.autoRenewal,
      });

      Alert.alert('Success', `Membership assigned to ${selectedMember?.firstName} ${selectedMember?.lastName}!\nPlan: ${selectedPlan?.name}\nEnd Date: ${endDate}`, [
        { 
          text: 'OK', 
          onPress: () => {
            // Reset form
            setFormData({
              memberId: 0,
              planId: 0,
              startDate: '',
              endDate: '',
              amountPaid: 0,
              autoRenewal: false,
            });
            setSelectedMember(null);
            setSelectedPlan(null);
            setSearchTerm('');
            navigation.goBack();
          }
        }
      ]);
    } catch (error: any) {
      console.error('Error creating membership:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to assign membership');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Assign Membership</Text>
            <Text style={styles.subtitle}>Assign a membership plan to a member</Text>
          </View>

          {/* Member Selection */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon source="account-multiple" size={20} color="#3B82F6" />
              <Text style={styles.sectionTitle}>Select Member *</Text>
            </View>
            
            <TouchableOpacity 
              style={[styles.dropdownButton, errors.memberId && styles.inputError]}
              onPress={() => setShowMembersDropdown(true)}
            >
              <View style={styles.dropdownButtonContent}>
                {selectedMember ? (
                  <View>
                    <Text style={styles.dropdownSelectedText}>
                      {selectedMember.firstName} {selectedMember.lastName}
                    </Text>
                    <Text style={styles.dropdownSelectedSubtext}>
                      {selectedMember.memberCode} • {selectedMember.phone}
                    </Text>
                  </View>
                ) : (
                  <Text style={styles.dropdownPlaceholder}>Search member by name or code...</Text>
                )}
              </View>
              <Icon source="magnify" size={20} color="#64748B" />
            </TouchableOpacity>

            {/* Member Search Dropdown */}
            {showMembersDropdown && (
              <View style={styles.dropdownContainer}>
                <View style={styles.searchInputContainer}>
                  <Icon source="magnify" size={20} color="#64748B" />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search member..."
                    value={searchTerm}
                    onChangeText={setSearchTerm}
                    autoFocus
                  />
                  <TouchableOpacity onPress={() => {
                    setShowMembersDropdown(false);
                    setSearchTerm('');
                  }}>
                    <Icon source="close" size={20} color="#64748B" />
                  </TouchableOpacity>
                </View>
                
                <FlatList
                  data={filteredMembers}
                  keyExtractor={(item) => item.id.toString()}
                  style={styles.dropdownList}
                  nestedScrollEnabled
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.dropdownItem}
                      onPress={() => handleMemberSelect(item)}
                    >
                      <View style={styles.avatarSmall}>
                        <Text style={styles.avatarText}>
                          {item.firstName.charAt(0)}{item.lastName.charAt(0)}
                        </Text>
                      </View>
                      <View style={styles.dropdownItemContent}>
                        <Text style={styles.dropdownItemName}>
                          {item.firstName} {item.lastName}
                        </Text>
                        <Text style={styles.dropdownItemSubtext}>
                          {item.memberCode} • {item.phone}
                        </Text>
                      </View>
                      <View style={[
                        styles.statusBadge,
                        { backgroundColor: item.status === 'ACTIVE' ? '#10B98120' : '#F59E0B20' }
                      ]}>
                        <Text style={[
                          styles.statusText,
                          { color: item.status === 'ACTIVE' ? '#10B981' : '#F59E0B' }
                        ]}>
                          {item.status}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  )}
                  ListEmptyComponent={
                    searchTerm ? (
                      <View style={styles.noResultsContainer}>
                        <Icon source="account-search" size={40} color="#94A3B8" />
                        <Text style={styles.noResultsText}>No members found</Text>
                      </View>
                    ) : null
                  }
                />
              </View>
            )}
            
            {errors.memberId && <Text style={styles.errorText}>{errors.memberId}</Text>}
          </View>

          {/* Selected Member Card */}
          {selectedMember && (
            <View style={styles.memberCard}>
              <View style={styles.memberCardHeader}>
                <View style={styles.avatarLarge}>
                  <Text style={styles.avatarText}>
                    {selectedMember.firstName.charAt(0)}{selectedMember.lastName.charAt(0)}
                  </Text>
                </View>
                <View style={styles.memberCardInfo}>
                  <Text style={styles.memberCardName}>
                    {selectedMember.firstName} {selectedMember.lastName}
                  </Text>
                  <Text style={styles.memberCardCode}>{selectedMember.memberCode}</Text>
                  <View style={styles.memberCardContact}>
                    <Text style={styles.memberCardContactText}>{selectedMember.email}</Text>
                    <Text style={styles.memberCardContactText}>{selectedMember.phone}</Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Plan Selection */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon source="credit-card" size={20} color="#8B5CF6" />
              <Text style={styles.sectionTitle}>Select Plan *</Text>
            </View>
            
            <TouchableOpacity 
              style={[styles.dropdownButton, errors.planId && styles.inputError]}
              onPress={() => setShowPlanDropdown(true)}
            >
              <View style={styles.dropdownButtonContent}>
                {selectedPlan ? (
                  <View>
                    <Text style={styles.dropdownSelectedText}>{selectedPlan.name}</Text>
                    <Text style={styles.dropdownSelectedSubtext}>
                      ₹{selectedPlan.price} • {selectedPlan.durationMonths} months
                    </Text>
                  </View>
                ) : (
                  <Text style={styles.dropdownPlaceholder}>Select a membership plan</Text>
                )}
              </View>
              <Icon source="chevron-down" size={24} color="#64748B" />
            </TouchableOpacity>

            {/* Plan Dropdown Modal */}
            {showPlanDropdown && (
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Select Membership Plan</Text>
                    <TouchableOpacity onPress={() => setShowPlanDropdown(false)}>
                      <Icon source="close" size={24} color="#64748B" />
                    </TouchableOpacity>
                  </View>
                  
                  <ScrollView style={styles.modalList}>
                    {plans.map((plan) => {
                      const monthlyPrice = Math.round(plan.price / plan.durationMonths);
                      const isSelected = formData.planId === plan.id;
                      
                      return (
                        <TouchableOpacity
                          key={plan.id}
                          style={[
                            styles.planOption,
                            isSelected && styles.planOptionSelected,
                          ]}
                          onPress={() => handlePlanSelect(plan)}
                        >
                          <View style={styles.planOptionContent}>
                            <Text style={[
                              styles.planOptionName,
                              isSelected && styles.planOptionNameSelected,
                            ]}>
                              {plan.name}
                            </Text>
                            <Text style={styles.planOptionPrice}>
                              ₹{monthlyPrice}/month • {plan.durationMonths} months
                            </Text>
                            <Text style={styles.planOptionTotal}>
                              Total: ₹{plan.price}
                            </Text>
                            {plan.description && (
                              <Text style={styles.planOptionDesc} numberOfLines={2}>
                                {plan.description}
                              </Text>
                            )}
                          </View>
                          {isSelected && (
                            <Icon source="check-circle" size={24} color="#3B82F6" />
                          )}
                        </TouchableOpacity>
                      );
                    })}
                    
                    {plans.length === 0 && (
                      <View style={styles.noPlansContainer}>
                        <Text style={styles.noPlansText}>No active plans available</Text>
                      </View>
                    )}
                  </ScrollView>
                </View>
              </View>
            )}
            
            {errors.planId && <Text style={styles.errorText}>{errors.planId}</Text>}
          </View>

          {/* Selected Plan Card */}
          {selectedPlan && (
            <View style={styles.planCard}>
              <View style={styles.planCardHeader}>
                <Icon source="crown" size={24} color="#FFFFFF" />
                <View style={styles.planCardInfo}>
                  <Text style={styles.planCardName}>{selectedPlan.name}</Text>
                  <Text style={styles.planCardDuration}>{selectedPlan.durationMonths} months plan</Text>
                </View>
              </View>
              <View style={styles.planCardPrice}>
                <Text style={styles.planCardPriceLabel}>Total Amount</Text>
                <Text style={styles.planCardPriceValue}>₹{selectedPlan.price.toLocaleString()}</Text>
              </View>
            </View>
          )}

          {/* Membership Details */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon source="calendar" size={20} color="#10B981" />
              <Text style={styles.sectionTitle}>Membership Details</Text>
            </View>
            
            <View style={styles.formRow}>
              <View style={styles.formField}>
                <Text style={styles.label}>Start Date *</Text>
                <TouchableOpacity 
                  style={[styles.dateInput, errors.startDate && styles.inputError]}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Icon source="calendar" size={20} color="#64748B" />
                  <Text style={styles.dateText}>
                    {formData.startDate || 'Select date'}
                  </Text>
                </TouchableOpacity>
                {showDatePicker && (
                  <DateTimePicker
                    value={startDate}
                    mode="date"
                    display="default"
                    onChange={handleDateChange}
                    minimumDate={minDate}
                  />
                )}
                {errors.startDate && <Text style={styles.errorText}>{errors.startDate}</Text>}
              </View>
              
              <View style={styles.formField}>
                <Text style={styles.label}>End Date</Text>
                <View style={styles.readOnlyInput}>
                  <Icon source="calendar-check" size={20} color="#64748B" />
                  <Text style={styles.readOnlyText}>
                    {calculateEndDate() || 'Select start date'}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.formField}>
              <Text style={styles.label}>Amount Paid (₹) *</Text>
              <TextInput
                style={[styles.input, errors.amountPaid && styles.inputError]}
                placeholder="Enter amount"
                value={formData.amountPaid.toString()}
                onChangeText={(value) => {
                  const numValue = parseFloat(value) || 0;
                  setFormData(prev => ({ ...prev, amountPaid: numValue }));
                  setErrors(prev => ({ ...prev, amountPaid: '' }));
                }}
                keyboardType="numeric"
              />
              {errors.amountPaid && <Text style={styles.errorText}>{errors.amountPaid}</Text>}
            </View>

            <View style={styles.checkboxContainer}>
              <TouchableOpacity 
                style={styles.checkbox}
                onPress={() => setFormData(prev => ({ ...prev, autoRenewal: !prev.autoRenewal }))}
              >
                <Icon 
                  source={formData.autoRenewal ? "checkbox-marked" : "checkbox-blank-outline"} 
                  size={24} 
                  color="#3B82F6" 
                />
                <Text style={styles.checkboxLabel}>Enable Auto Renewal</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Summary */}
          {selectedMember && selectedPlan && formData.startDate && (
            <View style={styles.summaryCard}>
              <View style={styles.summaryHeader}>
                <Icon source="receipt" size={20} color="#3B82F6" />
                <Text style={styles.summaryTitle}>Summary</Text>
              </View>
              
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Member</Text>
                <Text style={styles.summaryValue}>
                  {selectedMember.firstName} {selectedMember.lastName}
                </Text>
              </View>
              
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Plan</Text>
                <Text style={styles.summaryValue}>{selectedPlan.name}</Text>
              </View>
              
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Duration</Text>
                <Text style={styles.summaryValue}>{selectedPlan.durationMonths} months</Text>
              </View>
              
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Start Date</Text>
                <Text style={styles.summaryValue}>{formData.startDate}</Text>
              </View>
              
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>End Date</Text>
                <Text style={styles.summaryValue}>{calculateEndDate()}</Text>
              </View>
              
              <View style={[styles.summaryRow, styles.summaryTotal]}>
                <Text style={styles.summaryTotalLabel}>Total Amount</Text>
                <Text style={styles.summaryTotalValue}>₹{formData.amountPaid.toLocaleString()}</Text>
              </View>
            </View>
          )}

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
                  <Text style={styles.submitButtonText}>Assign Membership</Text>
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
  scrollView: {
    flex: 1,
    padding: 16,
  },
  header: {
    paddingVertical: 16,
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
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginLeft: 8,
  },
  formRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  formField: {
    flex: 1,
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0F172A',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#0F172A',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  dateText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#94A3B8',
  },
  readOnlyInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  readOnlyText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#64748B',
  },
  checkboxContainer: {
    marginTop: 8,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#0F172A',
    marginLeft: 8,
  },
  // Dropdown styles
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  dropdownButtonContent: {
    flex: 1,
  },
  dropdownSelectedText: {
    fontSize: 16,
    color: '#0F172A',
    fontWeight: '500',
  },
  dropdownSelectedSubtext: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 2,
  },
  dropdownPlaceholder: {
    fontSize: 16,
    color: '#94A3B8',
  },
  dropdownContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    marginTop: 8,
    maxHeight: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  dropdownList: {
    maxHeight: 250,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  dropdownItemContent: {
    flex: 1,
    marginLeft: 12,
  },
  dropdownItemName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#0F172A',
  },
  dropdownItemSubtext: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  noResultsContainer: {
    alignItems: 'center',
    padding: 24,
  },
  noResultsText: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 8,
  },
  // Avatar styles
  avatarSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  avatarLarge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  // Member card
  memberCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  memberCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberCardInfo: {
    flex: 1,
    marginLeft: 16,
  },
  memberCardName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
  },
  memberCardCode: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 2,
  },
  memberCardContact: {
    marginTop: 8,
  },
  memberCardContactText: {
    fontSize: 12,
    color: '#64748B',
  },
  // Plan card
  planCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#8B5CF6',
  },
  planCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8B5CF6',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  planCardInfo: {
    marginLeft: 12,
    flex: 1,
  },
  planCardName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  planCardDuration: {
    fontSize: 12,
    color: '#FFFFFFAA',
    marginTop: 2,
  },
  planCardPrice: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planCardPriceLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  planCardPriceValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8B5CF6',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    maxHeight: '70%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
  },
  modalList: {
    padding: 16,
  },
  planOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  planOptionSelected: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  planOptionContent: {
    flex: 1,
    marginRight: 12,
  },
  planOptionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
  },
  planOptionNameSelected: {
    color: '#3B82F6',
  },
  planOptionPrice: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
  },
  planOptionTotal: {
    fontSize: 12,
    color: '#10B981',
    marginTop: 2,
  },
  planOptionDesc: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
  },
  noPlansContainer: {
    padding: 24,
    alignItems: 'center',
  },
  noPlansText: {
    fontSize: 14,
    color: '#64748B',
  },
  // Summary card
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginLeft: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0F172A',
  },
  summaryTotal: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  summaryTotalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
  },
  summaryTotalValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  // Button
  buttonContainer: {
    paddingVertical: 16,
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

export default AssignMembershipScreen;

