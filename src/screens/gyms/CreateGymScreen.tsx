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
  Switch,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Icon } from 'react-native-paper';
import api from '../../api/api';
import { GymForm } from '../../types';

const CreateGymScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const gymId = route.params?.gymId;

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<GymForm>({
    gymCode: '',
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    openingTime: '06:00',
    closingTime: '22:00',
    isActive: true,
  });

  useEffect(() => {
    if (gymId) {
      fetchGymData();
    }
  }, [gymId]);

  const fetchGymData = async () => {
    try {
      setLoading(true);
      const response = await api.get(GYM_ENDPOINTS.GET_BY_ID(gymId));
      const gym = response.data;
      setFormData({
        gymCode: gym.gymCode || '',
        name: gym.name || '',
        email: gym.email || '',
        phone: gym.phone || '',
        address: gym.address || '',
        city: gym.city || '',
        state: gym.state || '',
        pincode: gym.pincode || '',
        openingTime: gym.openingTime || '06:00',
        closingTime: gym.closingTime || '22:00',
        isActive: gym.isActive !== false,
      });
    } catch (error) {
      console.error('Error fetching gym:', error);
      Alert.alert('Error', 'Failed to load gym data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.gymCode.trim()) {
      newErrors.gymCode = 'Gym code is required';
    }
    if (!formData.name.trim()) {
      newErrors.name = 'Gym name is required';
    }
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      
      if (gymId) {
        // Update existing gym
        await api.put(GYM_ENDPOINTS.UPDATE(gymId), formData);
        Alert.alert('Success', 'Gym updated successfully!', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        // Create new gym
        await api.post(GYM_ENDPOINTS.CREATE, formData);
        Alert.alert('Success', 'Gym created successfully!', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }
    } catch (error: any) {
      console.error('Error saving gym:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to save gym'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

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
              <Text style={styles.title}>{gymId ? 'Edit Gym' : 'Create Gym'}</Text>
              <Text style={styles.subtitle}>
                {gymId ? 'Update gym details' : 'Add a new gym location'}
              </Text>
            </View>
          </View>

          {/* Form Card */}
          <View style={styles.formCard}>
            {/* Gym Code */}
            <View style={styles.formField}>
              <Text style={styles.label}>Gym Code *</Text>
              <View style={[styles.inputContainer, errors.gymCode && styles.inputError]}>
                <Icon source="identifier" size={20} color="#64748B" />
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g., GYM001"
                  value={formData.gymCode}
                  onChangeText={(value) => handleInputChange('gymCode', value)}
                  autoCapitalize="characters"
                />
              </View>
              {errors.gymCode && <Text style={styles.errorText}>{errors.gymCode}</Text>}
            </View>

            {/* Gym Name */}
            <View style={styles.formField}>
              <Text style={styles.label}>Gym Name *</Text>
              <View style={[styles.inputContainer, errors.name && styles.inputError]}>
                <Icon source="dumbbell" size={20} color="#64748B" />
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g., Fitness First Gym"
                  value={formData.name}
                  onChangeText={(value) => handleInputChange('name', value)}
                />
              </View>
              {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
            </View>

            {/* Email */}
            <View style={styles.formField}>
              <Text style={styles.label}>Email</Text>
              <View style={[styles.inputContainer, errors.email && styles.inputError]}>
                <Icon source="email" size={20} color="#64748B" />
                <TextInput
                  style={styles.textInput}
                  placeholder="gym@example.com"
                  value={formData.email}
                  onChangeText={(value) => handleInputChange('email', value)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>

            {/* Phone */}
            <View style={styles.formField}>
              <Text style={styles.label}>Phone</Text>
              <View style={styles.inputContainer}>
                <Icon source="phone" size={20} color="#64748B" />
                <TextInput
                  style={styles.textInput}
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChangeText={(value) => handleInputChange('phone', value)}
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            {/* Address */}
            <View style={styles.formField}>
              <Text style={styles.label}>Address</Text>
              <View style={[styles.inputContainer, styles.textArea]}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Full address..."
                  value={formData.address}
                  onChangeText={(value) => handleInputChange('address', value)}
                  multiline
                  numberOfLines={2}
                  textAlignVertical="top"
                />
              </View>
            </View>

            {/* City & State Row */}
            <View style={styles.formRow}>
              <View style={[styles.formField, styles.halfWidth]}>
                <Text style={styles.label}>City</Text>
                <View style={styles.inputContainer}>
                  <Icon source="city" size={20} color="#64748B" />
                  <TextInput
                    style={styles.textInput}
                    placeholder="City"
                    value={formData.city}
                    onChangeText={(value) => handleInputChange('city', value)}
                  />
                </View>
              </View>

              <View style={[styles.formField, styles.halfWidth]}>
                <Text style={styles.label}>State</Text>
                <View style={styles.inputContainer}>
                  <Icon source="map-marker" size={20} color="#64748B" />
                  <TextInput
                    style={styles.textInput}
                    placeholder="State"
                    value={formData.state}
                    onChangeText={(value) => handleInputChange('state', value)}
                  />
                </View>
              </View>
            </View>

            {/* Pincode */}
            <View style={styles.formField}>
              <Text style={styles.label}>Pincode</Text>
              <View style={styles.inputContainer}>
                <Icon source="map-marker-radius" size={20} color="#64748B" />
                <TextInput
                  style={styles.textInput}
                  placeholder="123456"
                  value={formData.pincode}
                  onChangeText={(value) => handleInputChange('pincode', value)}
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* Opening & Closing Time Row */}
            <View style={styles.formRow}>
              <View style={[styles.formField, styles.halfWidth]}>
                <Text style={styles.label}>Opening Time</Text>
                <View style={styles.inputContainer}>
                  <Icon source="clock-outline" size={20} color="#64748B" />
                  <TextInput
                    style={styles.textInput}
                    placeholder="06:00"
                    value={formData.openingTime}
                    onChangeText={(value) => handleInputChange('openingTime', value)}
                  />
                </View>
              </View>

              <View style={[styles.formField, styles.halfWidth]}>
                <Text style={styles.label}>Closing Time</Text>
                <View style={styles.inputContainer}>
                  <Icon source="clock-check" size={20} color="#64748B" />
                  <TextInput
                    style={styles.textInput}
                    placeholder="22:00"
                    value={formData.closingTime}
                    onChangeText={(value) => handleInputChange('closingTime', value)}
                  />
                </View>
              </View>
            </View>

            {/* Is Active Toggle */}
            <View style={styles.toggleContainer}>
              <View style={styles.toggleLabel}>
                <Icon
                  source={formData.isActive ? 'power' : 'power-off'}
                  size={20}
                  color={formData.isActive ? '#10B981' : '#EF4444'}
                />
                <Text style={styles.toggleLabelText}>Active Status</Text>
              </View>
              <Switch
                value={formData.isActive}
                onValueChange={(value) => handleInputChange('isActive', value)}
                trackColor={{ false: '#EF4444', true: '#10B981' }}
                thumbColor="#FFFFFF"
              />
            </View>
            <Text style={styles.toggleStatus}>
              {formData.isActive ? 'Gym will be visible to users' : 'Gym will be hidden from users'}
            </Text>
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
                  <Icon source={gymId ? 'check' : 'plus'} size={20} color="#FFFFFF" />
                  <Text style={styles.submitButtonText}>
                    {gymId ? 'Update Gym' : 'Create Gym'}
                  </Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  formRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  formField: {
    marginBottom: 16,
  },
  halfWidth: {
    width: '48%',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 8,
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
  textArea: {
    minHeight: 80,
    alignItems: 'flex-start',
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 6,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
  },
  toggleLabel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleLabelText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#0F172A',
    marginLeft: 10,
  },
  toggleStatus: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 8,
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

export default CreateGymScreen;

