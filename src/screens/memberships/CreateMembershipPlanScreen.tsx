import React, { useState } from 'react';
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
import { useNavigation } from '@react-navigation/native';
import { Icon } from 'react-native-paper';
import api from '../../api/api';
import { MembershipPlanForm } from '../../types';

const CreateMembershipPlanScreen = () => {
  const navigation = useNavigation<any>();
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<MembershipPlanForm>({
    name: '',
    description: '',
    durationMonths: '',
    price: '',
    features: '',
    isActive: true,
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) newErrors.name = 'Plan name is required';
    if (!formData.durationMonths.trim()) newErrors.durationMonths = 'Duration is required';
    if (!formData.price.trim()) newErrors.price = 'Price is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      
      // Prepare the data - convert features to comma-separated string
      let featuresString: string = '';
      // if (formData.features.trim()) {
      //   try {
      //     // If it's already valid JSON array, use it as-is
      //     const parsed = JSON.parse(formData.features);
      //     if (Array.isArray(parsed)) {
      //       featuresString = formData.features;
      //     } else {
      //       featuresString = formData.features;
      //     }
      //   } catch {
      //     // If not valid JSON, assume comma-separated format
      //     featuresString = formData.features;
      //   }
      // }

      const payload = {
        name: formData.name,
        description: formData.description,
        durationMonths: parseInt(formData.durationMonths),
        price: parseFloat(formData.price),
        features: formData.features,
        isActive: formData.isActive,
      };

      await api.post('/gym/membership_plans/create', payload);
      
      Alert.alert('Success', 'Membership plan created successfully!', [
        { 
          text: 'OK', 
          onPress: () => {
            // Reset form and go back
            setFormData({
              name: '',
              description: '',
              durationMonths: '',
              price: '',
              features: '',
              isActive: true,
            });
            navigation.goBack();
          }
        }
      ]);
    } catch (error: any) {
      console.error('Error creating membership plan:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to create membership plan');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Icon source="arrow-left" size={24} color="#3B82F6" />
            </TouchableOpacity>
            <View style={styles.headerContent}>
              <Text style={styles.title}>Create Membership Plan</Text>
              <Text style={styles.subtitle}>Create a new membership plan</Text>
            </View>
          </View>

          {/* Form Card */}
          <View style={styles.formCard}>
            {/* Plan Name */}
            <View style={styles.formField}>
              <Text style={styles.label}>Plan Name *</Text>
            <TextInput
                style={[styles.input, errors.name ? styles.inputError : undefined]}
                placeholder="e.g., Gold Membership"
                value={formData.name}
                onChangeText={(value) => handleInputChange('name', value)}
              />
              {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
            </View>

            {/* Description */}
            <View style={styles.formField}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Enter plan description..."
                value={formData.description}
                onChangeText={(value) => handleInputChange('description', value)}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            {/* Duration and Price Row */}
            <View style={styles.formRow}>
              <View style={[styles.formField, styles.halfWidth]}>
                <Text style={styles.label}>Duration (Months) *</Text>
                <TextInput
                  style={[styles.input, errors.durationMonths && styles.inputError]}
                  placeholder="e.g., 12"
                  value={formData.durationMonths}
                  onChangeText={(value) => handleInputChange('durationMonths', value)}
                  keyboardType="numeric"
                />
                {errors.durationMonths && (
                  <Text style={styles.errorText}>{errors.durationMonths}</Text>
                )}
              </View>
              
              <View style={[styles.formField, styles.halfWidth]}>
                <Text style={styles.label}>Price (₹) *</Text>
                <TextInput
                  style={[styles.input, errors.price && styles.inputError]}
                  placeholder="e.g., 12000"
                  value={formData.price}
                  onChangeText={(value) => handleInputChange('price', value)}
                  keyboardType="numeric"
                />
                {errors.price && <Text style={styles.errorText}>{errors.price}</Text>}
              </View>
            </View>

            {/* Monthly Price Calculation */}
            {formData.durationMonths && formData.price && (
              <View style={styles.infoBox}>
                <Icon source="calculator" size={20} color="#10B981" />
                <Text style={styles.infoText}>
                  ₹{Math.round(parseFloat(formData.price) / parseInt(formData.durationMonths))}/month
                </Text>
              </View>
            )}

            {/* Features */}
            <View style={styles.formField}>
              <Text style={styles.label}>Features</Text>
              <Text style={styles.helperText}>
                Enter as JSON array or comma-separated list
              </Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder='["Gym Access", "Pool", "Sauna"]'
                value={formData.features}
                onChangeText={(value) => handleInputChange('features', value)}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            {/* Features Preview */}
            {formData.features.trim() && (
              <View style={styles.featuresPreview}>
                <Text style={styles.featuresPreviewTitle}>Preview:</Text>
                <View style={styles.featuresList}>
                  {(() => {
                    let featuresList: string[] = [];
                    try {
                      featuresList = JSON.parse(formData.features);
                    } catch {
                      featuresList = formData.features.split(',').map(f => f.trim());
                    }
                    return featuresList.map((feature: string, index: number) => (
                      <View key={index} style={styles.featureChip}>
                        <Icon source="check" size={14} color="#10B981" />
                        <Text style={styles.featureChipText}>{feature}</Text>
                      </View>
                    ));
                  })()}
                </View>
              </View>
            )}

            {/* Active Toggle */}
            <View style={styles.toggleContainer}>
              <View style={styles.toggleLabel}>
                <Icon source="power" size={20} color={formData.isActive ? '#10B981' : '#EF4444'} />
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
              {formData.isActive ? 'Plan will be visible to members' : 'Plan will be hidden from members'}
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
                  <Icon source="check" size={20} color="#FFFFFF" />
                  <Text style={styles.submitButtonText}>Create Plan</Text>
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
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#0F172A',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  textArea: {
    minHeight: 80,
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
  },
  helperText: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 6,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#10B981',
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
  },
  infoText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10B981',
    marginLeft: 10,
  },
  featuresPreview: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
  },
  featuresPreviewTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  featuresList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  featureChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  featureChipText: {
    fontSize: 12,
    color: '#0F172A',
    marginLeft: 4,
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
    marginBottom: 16,
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

export default CreateMembershipPlanScreen;

