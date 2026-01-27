import React, { useState, useEffect } from 'react';
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
  Modal,
  Pressable,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Icon, Divider, RadioButton } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import api from '../../api/api';
import { MemberFormData, MembershipPlan } from '../../types';

const CreateMemberScreen = () => {
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [membershipPlans, setMembershipPlans] = useState<MembershipPlan[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showMembershipDropdown, setShowMembershipDropdown] = useState(false);

  // Form state
  const [formData, setFormData] = useState<MemberFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelation: '',
    membershipType: '',
    startDate: '',
    duration: '',
    amount: '',
    medicalConditions: '',
    allergies: '',
    fitnessGoals: '',
  });

  // Date picker state
  const [showDOBPicker, setShowDOBPicker] = useState(false);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [dob, setDob] = useState<Date>(new Date());
  const [startDate, setStartDate] = useState<Date>(new Date());

  // Calculate min date (15 days ago)
  const minDate = new Date();
  minDate.setDate(minDate.getDate() - 15);

  useEffect(() => {
    fetchMembershipPlans();
  }, []);

  const fetchMembershipPlans = async () => {
    try {
      setLoading(true);
      const response = await api.get('/gym/membership_plans/active');
      setMembershipPlans(response.data);
    } catch (error) {
      console.error('Error fetching membership plans:', error);
      Alert.alert('Error', 'Failed to load membership plans');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleDOBChange = (event: any, selectedDate?: Date) => {
    setShowDOBPicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDob(selectedDate);
      const formattedDate = selectedDate.toISOString().split('T')[0];
      handleInputChange('dateOfBirth', formattedDate);
    }
  };

  const handleStartDateChange = (event: any, selectedDate?: Date) => {
    setShowStartDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setStartDate(selectedDate);
      const formattedDate = selectedDate.toISOString().split('T')[0];
      handleInputChange('startDate', formattedDate);
    }
  };

  const handleMembershipChange = (planName: string) => {
    handleInputChange('membershipType', planName);
    const selectedPlan = membershipPlans.find(plan => plan.name === planName);
    if (selectedPlan) {
      handleInputChange('duration', selectedPlan.durationMonths.toString());
      handleInputChange('amount', selectedPlan.price.toString());
    } else {
      handleInputChange('duration', '');
      handleInputChange('amount', '');
    }
  };

  const calculateEndDate = () => {
    if (formData.startDate && formData.duration) {
      const start = new Date(formData.startDate);
      const end = new Date(start);
      end.setMonth(end.getMonth() + parseInt(formData.duration));
      return end.toISOString().split('T')[0];
    }
    return '';
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.emergencyContactName.trim()) newErrors.emergencyContactName = 'Emergency contact name is required';
    if (!formData.emergencyContactPhone.trim()) newErrors.emergencyContactPhone = 'Emergency contact phone is required';
    if (!formData.membershipType.trim()) newErrors.membershipType = 'Membership type is required';
    if (!formData.startDate.trim()) newErrors.startDate = 'Start date is required';
    if (!formData.amount.trim()) newErrors.amount = 'Amount is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);
      await api.post('/gym/members/create', formData);
      Alert.alert('Success', 'Member created successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error: any) {
      console.error('Error creating member:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to create member');
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
            <Text style={styles.title}>Add New Member</Text>
            <Text style={styles.subtitle}>Register a new gym member</Text>
          </View>

          {/* Personal Information */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon source="account" size={20} color="#3B82F6" />
              <Text style={styles.sectionTitle}>Personal Information</Text>
            </View>
            
            <View style={styles.formRow}>
              <View style={styles.formField}>
                <Text style={styles.label}>First Name *</Text>
                <TextInput
                  style={[styles.input, errors.firstName ? styles.inputError : {}]}
                  placeholder="First name"
                  value={formData.firstName}
                  onChangeText={(value) => handleInputChange('firstName', value)}
                />
                {errors.firstName && <Text style={styles.errorText}>{errors.firstName}</Text>}
              </View>
              
              <View style={styles.formField}>
                <Text style={styles.label}>Last Name *</Text>
                <TextInput
                  style={[styles.input, errors.lastName ? styles.inputError : {}]}
                  placeholder="Last name"
                  value={formData.lastName}
                  onChangeText={(value) => handleInputChange('lastName', value)}
                />
                {errors.lastName && <Text style={styles.errorText}>{errors.lastName}</Text>}
              </View>
            </View>

            <View style={styles.formRow}>
              <View style={styles.formField}>
                <Text style={styles.label}>Phone Number *</Text>
                <TextInput
                  style={[styles.input, errors.phone ? styles.inputError : undefined]}
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChangeText={(value) => handleInputChange('phone', value)}
                  keyboardType="phone-pad"
                />
                {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
              </View>
              
              <View style={styles.formField}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Email address"
                  value={formData.email}
                  onChangeText={(value) => handleInputChange('email', value)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={styles.formRow}>
              <View style={styles.formField}>
                <Text style={styles.label}>Date of Birth</Text>
                <TouchableOpacity 
                  style={styles.dateInput}
                  onPress={() => setShowDOBPicker(true)}
                >
                  <Icon source="calendar" size={20} color="#64748B" />
                  <Text style={styles.dateText}>
                    {formData.dateOfBirth || 'Select date'}
                  </Text>
                </TouchableOpacity>
                {showDOBPicker && (
                  <DateTimePicker
                    value={dob}
                    mode="date"
                    display="default"
                    onChange={handleDOBChange}
                    maximumDate={new Date('2005-12-31')}
                  />
                )}
              </View>
              
              <View style={styles.formField}>
                <Text style={styles.label}>Gender</Text>
                <View style={styles.radioGroup}>
                  <View style={styles.radioOption}>
                    <RadioButton
                      value="MALE"
                      status={formData.gender === 'MALE' ? 'checked' : 'unchecked'}
                      onPress={() => handleInputChange('gender', 'MALE')}
                    />
                    <Text style={styles.radioLabel}>Male</Text>
                  </View>
                  <View style={styles.radioOption}>
                    <RadioButton
                      value="FEMALE"
                      status={formData.gender === 'FEMALE' ? 'checked' : 'unchecked'}
                      onPress={() => handleInputChange('gender', 'FEMALE')}
                    />
                    <Text style={styles.radioLabel}>Female</Text>
                  </View>
                  <View style={styles.radioOption}>
                    <RadioButton
                      value="OTHER"
                      status={formData.gender === 'OTHER' ? 'checked' : 'unchecked'}
                      onPress={() => handleInputChange('gender', 'OTHER')}
                    />
                    <Text style={styles.radioLabel}>Other</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Address */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon source="map-marker" size={20} color="#10B981" />
              <Text style={styles.sectionTitle}>Address</Text>
            </View>
            
            <View style={styles.formField}>
              <Text style={styles.label}>Full Address *</Text>
              <TextInput
                style={[styles.input, styles.textArea, errors.address ? styles.inputError : {}]}
                placeholder="Complete address"
                value={formData.address}
                onChangeText={(value) => handleInputChange('address', value)}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
              {errors.address && <Text style={styles.errorText}>{errors.address}</Text>}
            </View>

            <View style={styles.formRow}>
              <View style={styles.formField}>
                <Text style={styles.label}>City</Text>
                <TextInput
                  style={styles.input}
                  placeholder="City"
                  value={formData.city}
                  onChangeText={(value) => handleInputChange('city', value)}
                />
              </View>
              
              <View style={styles.formField}>
                <Text style={styles.label}>State</Text>
                <TextInput
                  style={styles.input}
                  placeholder="State"
                  value={formData.state}
                  onChangeText={(value) => handleInputChange('state', value)}
                />
              </View>
            </View>

            <View style={styles.formField}>
              <Text style={styles.label}>Pincode</Text>
              <TextInput
                style={styles.input}
                placeholder="Pincode"
                value={formData.pincode}
                onChangeText={(value) => handleInputChange('pincode', value)}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Emergency Contact */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon source="account-alert" size={20} color="#F59E0B" />
              <Text style={styles.sectionTitle}>Emergency Contact</Text>
            </View>
            
            <View style={styles.formRow}>
              <View style={styles.formField}>
                <Text style={styles.label}>Contact Name *</Text>
                <TextInput
                  style={[styles.input, errors.emergencyContactName ? styles.inputError : undefined]}
                  placeholder="Emergency contact name"
                  value={formData.emergencyContactName}
                  onChangeText={(value) => handleInputChange('emergencyContactName', value)}
                />
                {errors.emergencyContactName && (
                  <Text style={styles.errorText}>{errors.emergencyContactName}</Text>
                )}
              </View>
              
              <View style={styles.formField}>
                <Text style={styles.label}>Contact Phone *</Text>
                <TextInput
                  style={[styles.input, errors.emergencyContactPhone ? styles.inputError : undefined]}
                  placeholder="+91 98765 43210"
                  value={formData.emergencyContactPhone}
                  onChangeText={(value) => handleInputChange('emergencyContactPhone', value)}
                  keyboardType="phone-pad"
                />
                {errors.emergencyContactPhone && (
                  <Text style={styles.errorText}>{errors.emergencyContactPhone}</Text>
                )}
              </View>
            </View>

            <View style={styles.formField}>
              <Text style={styles.label}>Relationship</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Spouse, Parent, Friend"
                value={formData.emergencyContactRelation}
                onChangeText={(value) => handleInputChange('emergencyContactRelation', value)}
              />
            </View>
          </View>

          {/* Membership Details */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon source="credit-card" size={20} color="#8B5CF6" />
              <Text style={styles.sectionTitle}>Membership Details</Text>
            </View>
            
            <View style={styles.formField}>
              <Text style={styles.label}>Membership Type *</Text>
              
              {/* Dropdown Button */}
              <TouchableOpacity 
                style={[styles.dropdownButton, errors.membershipType ? styles.inputError : {}]}
                onPress={() => setShowMembershipDropdown(true)}
              >
                <View style={styles.dropdownButtonContent}>
                  {formData.membershipType ? (
                    <View>
                      {(() => {
                        const selectedPlan = membershipPlans.find(p => p.name === formData.membershipType);
                        const monthlyPrice = selectedPlan ? Math.round(selectedPlan.price / selectedPlan.durationMonths) : 0;
                        return (
                          <>
                            <Text style={styles.dropdownSelectedText}>{formData.membershipType}</Text>
                            <Text style={styles.dropdownSelectedSubtext}>₹{monthlyPrice}/month</Text>
                          </>
                        );
                      })()}
                    </View>
                  ) : (
                    <Text style={styles.dropdownPlaceholder}>Select membership type</Text>
                  )}
                </View>
                <Icon 
                  source={showMembershipDropdown ? "chevron-up" : "chevron-down"} 
                  size={24} 
                  color="#64748B" 
                />
              </TouchableOpacity>

              {/* Dropdown Modal */}
              <Modal
                visible={showMembershipDropdown}
                transparent
                animationType="fade"
                onRequestClose={() => setShowMembershipDropdown(false)}
              >
                <Pressable 
                  style={styles.modalOverlay}
                  onPress={() => setShowMembershipDropdown(false)}
                >
                  <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                      <Text style={styles.modalTitle}>Select Membership Plan</Text>
                      <TouchableOpacity onPress={() => setShowMembershipDropdown(false)}>
                        <Icon source="close" size={24} color="#64748B" />
                      </TouchableOpacity>
                    </View>
                    
                    <ScrollView style={styles.modalList}>
                      {membershipPlans.map((plan) => {
                        const monthlyPrice = Math.round(plan.price / plan.durationMonths);
                        const isSelected = formData.membershipType === plan.name;
                        
                        return (
                          <TouchableOpacity
                            key={plan.id}
                            style={[
                              styles.dropdownItem,
                              isSelected && styles.dropdownItemSelected,
                            ]}
                            onPress={() => {
                              handleMembershipChange(plan.name);
                              setShowMembershipDropdown(false);
                            }}
                          >
                            <View style={styles.dropdownItemContent}>
                              <Text style={[
                                styles.dropdownItemName,
                                isSelected && styles.dropdownItemNameSelected,
                              ]}>
                                {plan.name}
                              </Text>
                              <Text style={styles.dropdownItemPrice}>
                                ₹{monthlyPrice}/month • {plan.durationMonths} months
                              </Text>
                              {plan.description && (
                                <Text style={styles.dropdownItemDesc} numberOfLines={2}>
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
                      
                      {membershipPlans.length === 0 && (
                        <View style={styles.noPlansContainer}>
                          <Text style={styles.noPlansText}>No active membership plans available</Text>
                        </View>
                      )}
                    </ScrollView>
                  </View>
                </Pressable>
              </Modal>
              
              {errors.membershipType && <Text style={styles.errorText}>{errors.membershipType}</Text>}
            </View>

            <View style={styles.formRow}>
              <View style={styles.formField}>
                <Text style={styles.label}>Start Date *</Text>
                <TouchableOpacity 
                  style={[styles.dateInput, errors.startDate ? styles.inputError : undefined]}
                  onPress={() => setShowStartDatePicker(true)}
                >
                  <Icon source="calendar" size={20} color="#64748B" />
                  <Text style={styles.dateText}>
                    {formData.startDate || 'Select date'}
                  </Text>
                </TouchableOpacity>
                {showStartDatePicker && (
                  <DateTimePicker
                    value={startDate}
                    mode="date"
                    display="default"
                    onChange={handleStartDateChange}
                    minimumDate={minDate}
                  />
                )}
                {errors.startDate && <Text style={styles.errorText}>{errors.startDate}</Text>}
              </View>
              
              <View style={styles.formField}>
                <Text style={styles.label}>Duration (months)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Duration"
                  value={formData.duration}
                  editable={false}
                />
              </View>
            </View>

            <View style={styles.formField}>
              <Text style={styles.label}>Amount (₹) *</Text>
              <TextInput
                style={[styles.input, errors.amount ? styles.inputError : {}]}
                placeholder="Amount"
                value={formData.amount}
                onChangeText={(value) => handleInputChange('amount', value)}
                keyboardType="numeric"
                editable={!formData.membershipType}
              />
              {errors.amount && <Text style={styles.errorText}>{errors.amount}</Text>}
            </View>

            {formData.startDate && formData.duration && (
              <View style={styles.infoBox}>
                <Icon source="information" size={20} color="#3B82F6" />
                <Text style={styles.infoText}>
                  Membership End Date: {calculateEndDate()}
                </Text>
              </View>
            )}
          </View>

          {/* Health Information */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon source="heart-pulse" size={20} color="#EF4444" />
              <Text style={styles.sectionTitle}>Health Information</Text>
            </View>
            
            <View style={styles.formField}>
              <Text style={styles.label}>Medical Conditions</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Any medical conditions?"
                value={formData.medicalConditions}
                onChangeText={(value) => handleInputChange('medicalConditions', value)}
                multiline
                numberOfLines={2}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.formField}>
              <Text style={styles.label}>Allergies</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Any allergies?"
                value={formData.allergies}
                onChangeText={(value) => handleInputChange('allergies', value)}
                multiline
                numberOfLines={2}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.formField}>
              <Text style={styles.label}>Fitness Goals</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="What are your fitness goals?"
                value={formData.fitnessGoals}
                onChangeText={(value) => handleInputChange('fitnessGoals', value)}
                multiline
                numberOfLines={2}
                textAlignVertical="top"
              />
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
                  <Text style={styles.submitButtonText}>Save Member</Text>
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
    marginBottom: 16,
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
  textArea: {
    minHeight: 60,
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
    // color: formData.dateOfBirth ? '#0F172A' : '#94A3B8',
  },
  radioGroup: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 4,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioLabel: {
    fontSize: 14,
    color: '#0F172A',
  },
  pickerContainer: {
    gap: 8,
  },
  pickerOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 12,
  },
  pickerOptionSelected: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  planInfo: {
    flex: 1,
  },
  planName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
  },
  planPrice: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 2,
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
  dropdownItem: {
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
  dropdownItemSelected: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  dropdownItemContent: {
    flex: 1,
    marginRight: 12,
  },
  dropdownItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
  },
  dropdownItemNameSelected: {
    color: '#3B82F6',
  },
  dropdownItemPrice: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
  },
  dropdownItemDesc: {
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
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#3B82F6',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#3B82F6',
    marginLeft: 8,
    fontWeight: '500',
  },
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

export default CreateMemberScreen;

