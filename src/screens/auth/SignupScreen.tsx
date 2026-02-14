import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import api from '../../api/api';
import { Gym } from '../../types';

const SignupScreen = () => {
  const navigation = useNavigation<any>();
  const [isLoading, setIsLoading] = useState(false);
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [selectedRole, setSelectedRole] = useState('MEMBER');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    gymId: '',
  });

  useEffect(() => {
    const fetchGyms = async () => {
      try {
        const response = await api.get('/gym/gyms/active');
        setGyms(response.data);
      } catch (error) {
        console.error('Error fetching gyms:', error);
      }
    };

    fetchGyms();
  }, []);

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSignup = async () => {
    if (!formData.username || !formData.email || !formData.password || !formData.firstName || !formData.lastName || !formData.phone || !selectedRole) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      const requestData: any = {
        username: formData.username,
        email: formData.email,
        passwordHash: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        role: selectedRole,
      };

      if (formData.gymId) {
        requestData.gymId = parseInt(formData.gymId);
      }

      const response = await api.post('/gym/auth/register', requestData);

      Alert.alert('Success', 'Registration successful! Please login.', [
        { text: 'OK', onPress: () => navigation.navigate('Login') },
      ]);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Registration failed. Please try again.';
      Alert.alert('Error', message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join Gym CRM today</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <Text style={styles.label}>First Name *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="First Name"
                  value={formData.firstName}
                  onChangeText={(value) => handleChange('firstName', value)}
                />
              </View>
              <View style={styles.halfWidth}>
                <Text style={styles.label}>Last Name *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChangeText={(value) => handleChange('lastName', value)}
                />
              </View>
            </View>

            <Text style={styles.label}>Username *</Text>
            <TextInput
              style={styles.input}
              placeholder="Choose a username"
              value={formData.username}
              onChangeText={(value) => handleChange('username', value)}
              autoCapitalize="none"
            />

            <Text style={styles.label}>Email *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              value={formData.email}
              onChangeText={(value) => handleChange('email', value)}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={styles.label}>Phone *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your phone number"
              value={formData.phone}
              onChangeText={(value) => handleChange('phone', value)}
              keyboardType="phone-pad"
            />

            <Text style={styles.label}>Role *</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedRole}
                onValueChange={(value) => setSelectedRole(value)}
                style={styles.picker}
              >
                <Picker.Item label="SUPER_USER" value="SUPER_USER" />
                <Picker.Item label="ADMIN" value="ADMIN" />
                <Picker.Item label="RECEPTIONIST" value="RECEPTIONIST" />
                <Picker.Item label="TRAINER" value="TRAINER" />
                <Picker.Item label="MEMBER" value="MEMBER" />
              </Picker>
            </View>

            <Text style={styles.label}>Password *</Text>
            <TextInput
              style={styles.input}
              placeholder="Create a password"
              value={formData.password}
              onChangeText={(value) => handleChange('password', value)}
              secureTextEntry
            />

            <Text style={styles.label}>Confirm Password *</Text>
            <TextInput
              style={styles.input}
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChangeText={(value) => handleChange('confirmPassword', value)}
              secureTextEntry
            />

            <Text style={styles.label}>Select Gym (Optional)</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.gymId}
                onValueChange={(value) => handleChange('gymId', value)}
                style={styles.picker}
              >
                <Picker.Item label="Select a gym (optional)" value="" />
                {gyms.map((gym) => (
                  <Picker.Item key={gym.id} label={gym.name} value={gym.id.toString()} />
                ))}
              </Picker>
            </View>

            <TouchableOpacity
              style={styles.signupButton}
              onPress={handleSignup}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.signupButtonText}>Create Account</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.loginButton}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.loginText}>
                Already have an account? <Text style={styles.loginLink}>Sign In</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#3B82F6',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
  },
  form: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 8,
    marginTop: 8,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  signupButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 24,
  },
  signupButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loginButton: {
    alignItems: 'center',
    marginTop: 16,
  },
  loginText: {
    color: '#64748B',
    fontSize: 14,
  },
  loginLink: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  pickerContainer: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    marginBottom: 8,
  },
  picker: {
    height: 50,
    color: '#0F172A',
  },
});

export default SignupScreen;

