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
import { useAuth } from '../../context/AuthContext';
import api from '../../api/api';
import { Gym } from '../../types';

const LoginScreen = () => {
  const navigation = useNavigation<any>();
  const { login, isLoading, error, clearError } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [signupLoading, setSignupLoading] = useState(false);
  const [signupForm, setSignupForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    gymId: '',
  });
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [gymsLoading, setGymsLoading] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Error', 'Please enter username and password');
      return;
    }

    clearError();
    try {
      await login({ username, password });
    } catch (err) {
      // Error is handled by context
    }
  };

  const handleSignup = async () => {
    if (!signupForm.username || !signupForm.email || !signupForm.password || !signupForm.firstName || !signupForm.lastName || !signupForm.gymId) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    if (signupForm.password !== signupForm.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (signupForm.password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setSignupLoading(true);

    try {
      const response = await api.post('/gym/auth/register', {
        username: signupForm.username,
        email: signupForm.email,
        passwordHash: signupForm.password,
        firstName: signupForm.firstName,
        lastName: signupForm.lastName,
        role: 'MEMBER',
        gym: { id: parseInt(signupForm.gymId) },
      });

      Alert.alert('Success', 'Registration successful! Please login.', [
        { text: 'OK', onPress: () => {
          setIsSignup(false);
          setSignupForm({
            username: '',
            email: '',
            password: '',
            confirmPassword: '',
            firstName: '',
            lastName: '',
            gymId: '',
          });
        }},
      ]);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Registration failed. Please try again.';
      Alert.alert('Error', message);
    } finally {
      setSignupLoading(false);
    }
  };

  const handleSignupChange = (field: string, value: string) => {
    setSignupForm({ ...signupForm, [field]: value });
  };

  const fetchGyms = async () => {
    setGymsLoading(true);
    try {
      const response = await api.get('/gym/gyms/active');
      setGyms(response.data);
    } catch (error) {
      console.error('Failed to fetch gyms:', error);
      Alert.alert('Error', 'Failed to load gyms. Please try again.');
    } finally {
      setGymsLoading(false);
    }
  };

  useEffect(() => {
    if (isSignup) {
      fetchGyms();
    }
  }, [isSignup]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Gym CRM</Text>
          <Text style={styles.subtitle}>
            {isSignup ? 'Create your account' : 'Sign in to your account'}
          </Text>
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[styles.toggleButton, !isSignup && styles.activeToggle]}
              onPress={() => setIsSignup(false)}
            >
              <Text style={[styles.toggleText, !isSignup && styles.activeToggleText]}>
                Sign In
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleButton, isSignup && styles.activeToggle]}
              onPress={() => setIsSignup(true)}
            >
              <Text style={[styles.toggleText, isSignup && styles.activeToggleText]}>
                Sign Up
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.form}>
            {isSignup ? (
              <>
                <View style={styles.row}>
                  <View style={styles.halfWidth}>
                    <Text style={styles.label}>First Name</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter first name"
                      value={signupForm.firstName}
                      onChangeText={(value) => handleSignupChange('firstName', value)}
                    />
                  </View>
                  <View style={styles.halfWidth}>
                    <Text style={styles.label}>Last Name</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter last name"
                      value={signupForm.lastName}
                      onChangeText={(value) => handleSignupChange('lastName', value)}
                    />
                  </View>
                </View>

                <Text style={styles.label}>Username</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter username"
                  value={signupForm.username}
                  onChangeText={(value) => handleSignupChange('username', value)}
                  autoCapitalize="none"
                />

                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter email"
                  value={signupForm.email}
                  onChangeText={(value) => handleSignupChange('email', value)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />

                <Text style={styles.label}>Password</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Enter password"
                    value={signupForm.password}
                    onChangeText={(value) => handleSignupChange('password', value)}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity
                    style={styles.showPasswordButton}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Text style={styles.showPasswordText}>
                      {showPassword ? 'Hide' : 'Show'}
                    </Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.label}>Confirm Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Confirm password"
                  value={signupForm.confirmPassword}
                  onChangeText={(value) => handleSignupChange('confirmPassword', value)}
                  secureTextEntry={!showPassword}
                />

                <Text style={styles.label}>Select Gym</Text>
                <View style={styles.pickerContainer}>
                  {gymsLoading ? (
                    <ActivityIndicator size="small" color="#3B82F6" />
                  ) : (
                    <Picker
                      selectedValue={signupForm.gymId}
                      onValueChange={(value) => handleSignupChange('gymId', value)}
                      style={styles.picker}
                    >
                      <Picker.Item label="Select a gym" value="" />
                      {gyms.map((gym) => (
                        <Picker.Item key={gym.id} label={gym.name} value={gym.id.toString()} />
                      ))}
                    </Picker>
                  )}
                </View>

                <TouchableOpacity
                  style={styles.signupButton}
                  onPress={handleSignup}
                  disabled={signupLoading}
                >
                  {signupLoading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.signupButtonText}>Sign Up</Text>
                  )}
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.label}>Username</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your username"
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                />

                <Text style={styles.label}>Password</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Enter your password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity
                    style={styles.showPasswordButton}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Text style={styles.showPasswordText}>
                      {showPassword ? 'Hide' : 'Show'}
                    </Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={styles.loginButton}
                  onPress={handleLogin}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.loginButtonText}>Sign In</Text>
                  )}
                </TouchableOpacity>
              </>
            )}
          </View>
        </ScrollView>
      </View>
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
  errorContainer: {
    backgroundColor: '#FEE2E2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
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
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    marginBottom: 24,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  showPasswordButton: {
    paddingHorizontal: 16,
  },
  showPasswordText: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  loginButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  signupText: {
    color: '#64748B',
    fontSize: 14,
  },
  signupLink: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    padding: 4,
    marginTop: 16,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeToggle: {
    backgroundColor: '#3B82F6',
  },
  toggleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
  },
  activeToggleText: {
    color: '#FFFFFF',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
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
  pickerContainer: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    marginBottom: 16,
  },
  picker: {
    height: 50,
    color: '#0F172A',
  },
});

export default LoginScreen;

