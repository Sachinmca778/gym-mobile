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
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Icon } from 'react-native-paper';
import api from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import { TRAINER_ENDPOINTS } from '../../utils/constants';

const CreateTrainerScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { user } = useAuth();
  const { trainer } = route.params || {};

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form fields
  const [firstName, setFirstName] = useState(trainer?.firstName || '');
  const [lastName, setLastName] = useState(trainer?.lastName || '');
  const [email, setEmail] = useState(trainer?.email || '');
  const [phone, setPhone] = useState(trainer?.phone || '');
  const [specialization, setSpecialization] = useState(trainer?.specialization || '');
  const [experienceYears, setExperienceYears] = useState(trainer?.experienceYears?.toString() || '');
  const [hourlyRate, setHourlyRate] = useState(trainer?.hourlyRate?.toString() || '');
  const [bio, setBio] = useState(trainer?.bio || '');
  const [location, setLocation] = useState(trainer?.location || '');
  const [certifications, setCertifications] = useState(() => {
    if (trainer?.certifications) {
      // If certifications is already a JSON string from backend, parse it
      try {
        const parsed = JSON.parse(trainer.certifications);
        return Array.isArray(parsed) ? parsed.join(', ') : trainer.certifications;
      } catch {
        return trainer.certifications;
      }
    }
    return '';
  });

  // Schedule state
  const [schedule, setSchedule] = useState({
    Monday: trainer?.schedule?.Monday || '',
    Tuesday: trainer?.schedule?.Tuesday || '',
    Wednesday: trainer?.schedule?.Wednesday || '',
    Thursday: trainer?.schedule?.Thursday || '',
    Friday: trainer?.schedule?.Friday || '',
    Saturday: trainer?.schedule?.Saturday || '',
    Sunday: trainer?.schedule?.Sunday || '',
  });

  const isEditing = !!trainer;

  const validateForm = () => {
    if (!firstName.trim()) {
      Alert.alert('Error', 'First name is required');
      return false;
    }
    if (!lastName.trim()) {
      Alert.alert('Error', 'Last name is required');
      return false;
    }
    if (!email.trim()) {
      Alert.alert('Error', 'Email is required');
      return false;
    }
    if (!phone.trim()) {
      Alert.alert('Error', 'Phone is required');
      return false;
    }
    if (!specialization.trim()) {
      Alert.alert('Error', 'Specialization is required');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      const trainerData = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        specialization: specialization.trim(),
        experienceYears: parseInt(experienceYears) || 0,
        hourlyRate: parseFloat(hourlyRate) || 0,
        bio: bio.trim(),
        location: location.trim(),
        certifications: JSON.stringify(certifications.split(',').map((cert: string) => cert.trim()).filter((cert: string) => cert)),
        schedule: JSON.stringify(Object.fromEntries(
          Object.entries(schedule).filter(([_, time]) => time.trim() !== '')
        )),
      };

      if (isEditing) {
        await api.put(TRAINER_ENDPOINTS.UPDATE(trainer.id), trainerData);
        Alert.alert('Success', 'Trainer updated successfully');
      } else {
        await api.post(TRAINER_ENDPOINTS.CREATE, trainerData);
        Alert.alert('Success', 'Trainer created successfully');
      }

      navigation.goBack();
    } catch (error: any) {
      console.error('Error saving trainer:', error);
      const message = error.response?.data?.message || 'Failed to save trainer';
      Alert.alert('Error', message);
    } finally {
      setSaving(false);
    }
  };

  const updateSchedule = (day: string, time: string) => {
    setSchedule(prev => ({
      ...prev,
      [day]: time,
    }));
  };

  const specializationOptions = [
    'Personal Training',
    'Group Fitness',
    'Yoga',
    'Pilates',
    'CrossFit',
    'Cardio',
    'Strength Training',
    'Nutrition',
    'Sports Training',
    'Rehabilitation',
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {isEditing ? 'Edit Trainer' : 'Create New Trainer'}
        </Text>
        <Text style={styles.subtitle}>
          {isEditing ? 'Update trainer information' : 'Add a new trainer to your gym'}
        </Text>
      </View>

      {/* Basic Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Basic Information</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>First Name *</Text>
          <TextInput
            style={styles.input}
            value={firstName}
            onChangeText={setFirstName}
            placeholder="Enter first name"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Last Name *</Text>
          <TextInput
            style={styles.input}
            value={lastName}
            onChangeText={setLastName}
            placeholder="Enter last name"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email *</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Enter email address"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Phone *</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="Enter phone number"
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Location</Text>
          <TextInput
            style={styles.input}
            value={location}
            onChangeText={setLocation}
            placeholder="Enter location"
          />
        </View>
      </View>

      {/* Professional Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Professional Information</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Specialization *</Text>
          <TextInput
            style={styles.input}
            value={specialization}
            onChangeText={setSpecialization}
            placeholder="e.g., Personal Training, Yoga, CrossFit"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Experience (Years)</Text>
          <TextInput
            style={styles.input}
            value={experienceYears}
            onChangeText={setExperienceYears}
            placeholder="Enter years of experience"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Hourly Rate (₹)</Text>
          <TextInput
            style={styles.input}
            value={hourlyRate}
            onChangeText={setHourlyRate}
            placeholder="Enter hourly rate"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Bio</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={bio}
            onChangeText={setBio}
            placeholder="Enter trainer bio/description"
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Certifications</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={certifications}
            onChangeText={setCertifications}
            placeholder="Enter certifications (comma separated)"
            multiline
            numberOfLines={2}
          />
        </View>
      </View>

      {/* Schedule */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Weekly Schedule</Text>
        {Object.entries(schedule).map(([day, time]) => (
          <View key={day} style={styles.scheduleItem}>
            <Text style={styles.dayLabel}>{day}</Text>
            <TextInput
              style={styles.timeInput}
              value={time}
              onChangeText={(value) => updateSchedule(day, value)}
              placeholder="e.g., 9:00 AM - 6:00 PM"
            />
          </View>
        ))}
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
          disabled={saving}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.saveButton, saving && styles.disabledButton]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <>
              <Icon source="content-save" size={20} color="#FFFFFF" />
              <Text style={styles.saveButtonText}>
                {isEditing ? 'Update Trainer' : 'Create Trainer'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
  },
  section: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  dayLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    width: 100,
  },
  timeInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  actions: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  saveButton: {
    flex: 2,
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
});

export default CreateTrainerScreen;
