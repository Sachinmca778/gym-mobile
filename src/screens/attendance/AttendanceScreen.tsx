import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { Icon } from 'react-native-paper';
import api from '../../api/api';

const AttendanceScreen = () => {
  const [memberId, setMemberId] = useState('');
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [lastAction, setLastAction] = useState<{ type: string; time: string } | null>(null);

  const handleCheckIn = async () => {
    if (!memberId) {
      Alert.alert('Error', 'Please enter member ID');
      return;
    }

    setIsCheckingIn(true);
    try {
      const response = await api.post('/gym/attendance/checkin', {
        memberId: parseInt(memberId),
        method: 'MANUAL',
        notes: 'Checked in via mobile app',
      });

      setLastAction({
        type: 'CHECK_IN',
        time: new Date().toLocaleTimeString(),
      });
      Alert.alert('Success', 'Member checked in successfully!');
      setMemberId('');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Check-in failed';
      Alert.alert('Error', message);
    } finally {
      setIsCheckingIn(false);
    }
  };

  const handleCheckOut = async () => {
    if (!memberId) {
      Alert.alert('Error', 'Please enter member ID');
      return;
    }

    setIsCheckingOut(true);
    try {
      const response = await api.post('/gym/attendance/checkout', {
        memberId: parseInt(memberId),
        notes: 'Checked out via mobile app',
      });

      setLastAction({
        type: 'CHECK_OUT',
        time: new Date().toLocaleTimeString(),
      });
      Alert.alert('Success', 'Member checked out successfully!');
      setMemberId('');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Check-out failed';
      Alert.alert('Error', message);
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Attendance</Text>
        <Text style={styles.subtitle}>Check in/out members</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.inputContainer}>
          <Icon source="account-check" size={24} color="#3B82F6" />
          <TextInput
            style={styles.input}
            placeholder="Enter Member ID"
            value={memberId}
            onChangeText={setMemberId}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.checkInButton]}
            onPress={handleCheckIn}
            disabled={isCheckingIn || isCheckingOut}
          >
            {isCheckingIn ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Icon source="login" size={24} color="#FFFFFF" />
                <Text style={styles.buttonText}>Check In</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.checkOutButton]}
            onPress={handleCheckOut}
            disabled={isCheckingIn || isCheckingOut}
          >
            {isCheckingOut ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Icon source="logout" size={24} color="#FFFFFF" />
                <Text style={styles.buttonText}>Check Out</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {lastAction && (
        <View style={styles.lastActionCard}>
          <Text style={styles.lastActionTitle}>Last Action</Text>
          <View style={styles.lastActionContent}>
            <Icon
              source={lastAction.type === 'CHECK_IN' ? 'login' : 'logout'}
              size={24}
              color={lastAction.type === 'CHECK_IN' ? '#10B981' : '#F59E0B'}
            />
            <Text style={styles.lastActionText}>
              {lastAction.type === 'CHECK_IN' ? 'Checked In' : 'Checked Out'} at {lastAction.time}
            </Text>
          </View>
        </View>
      )}

      <View style={styles.infoCard}>
        <Icon source="information" size={24} color="#3B82F6" />
        <Text style={styles.infoText}>
          Enter the member's ID number to quickly check them in or out. The attendance will be recorded automatically.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: 16,
    paddingTop: 40,
  },
  header: {
    marginBottom: 24,
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
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 12,
    fontSize: 18,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  checkInButton: {
    backgroundColor: '#10B981',
  },
  checkOutButton: {
    backgroundColor: '#F59E0B',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  lastActionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  lastActionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 8,
  },
  lastActionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  lastActionText: {
    fontSize: 16,
    color: '#0F172A',
    fontWeight: '500',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#1E40AF',
    lineHeight: 20,
  },
});

export default AttendanceScreen;

