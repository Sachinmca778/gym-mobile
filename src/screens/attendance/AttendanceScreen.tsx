import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Platform,
  Pressable,
} from 'react-native';
import { Icon } from 'react-native-paper';
import api from '../../api/api';


const GYM_ID = 1;

const AttendanceScreen = () => {
  const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;
  const GYM_ID = typeof window !== 'undefined' ? localStorage.getItem('gymId') : null;
  const [loadingType, setLoadingType] =
    useState<'CHECK_IN' | 'CHECK_OUT' | null>(null);

  const [lastAction, setLastAction] = useState<{
    type: 'CHECK_IN' | 'CHECK_OUT';
    time: string;
  } | null>(null);

  // ================= CHECK IN =================
  const handleCheckIn = async () => {
    if (!userId) {
      Alert.alert('Validation Error', 'User not authenticated');
      return;
    }

    try {
      setLoadingType('CHECK_IN');

      await api.post(
        `/api/gyms/${GYM_ID}/attendance/check-in/${userId}`,
        { method: 'MANUAL' }
      );

      setLastAction({
        type: 'CHECK_IN',
        time: new Date().toLocaleTimeString(),
      });

      Alert.alert('Success', 'Checked in successfully');
    } catch (error: any) {
      Alert.alert(
        'Error',
        error?.response?.data?.message || 'Check-in failed'
      );
    } finally {
      setLoadingType(null);
    }
  };

  // ================= CHECK OUT =================
  const handleCheckOut = async () => {
    if (!userId) {
      Alert.alert('Validation Error', 'User not authenticated');
      return;
    }

    try {
      setLoadingType('CHECK_OUT');

      await api.post(
        `/api/gyms/${GYM_ID}/attendance/check-out/${userId}`
      );

      setLastAction({
        type: 'CHECK_OUT',
        time: new Date().toLocaleTimeString(),
      });

      Alert.alert('Success', 'Checked out successfully');
    } catch (error: any) {
      Alert.alert(
        'Error',
        error?.response?.data?.message || 'Check-out failed'
      );
    } finally {
      setLoadingType(null);
    }
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.title}>Gym Attendance</Text>
        <Text style={styles.subtitle}>
          Check-in / Check-out Members
        </Text>
      </View>

      {/* INPUT CARD */}
      <View style={styles.card}>
        {/* BUTTON ROW */}
        <View style={styles.buttonRow}>
          <Pressable
            style={[
              styles.button,
              styles.checkInBtn,
              loadingType && styles.disabledBtn,
            ]}
            onPress={handleCheckIn}
            disabled={loadingType !== null}
          >
            {loadingType === 'CHECK_IN' ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <Icon source="login" size={20} color="#FFF" />
                <Text style={styles.buttonText}>Check In</Text>
              </>
            )}
          </Pressable>

          <Pressable
            style={[
              styles.button,
              styles.checkOutBtn,
              loadingType && styles.disabledBtn,
            ]}
            onPress={handleCheckOut}
            disabled={loadingType !== null}
          >
            {loadingType === 'CHECK_OUT' ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <Icon source="logout" size={20} color="#FFF" />
                <Text style={styles.buttonText}>Check Out</Text>
              </>
            )}
          </Pressable>
        </View>
      </View>

      {/* LAST ACTION */}
      {lastAction && (
        <View style={styles.lastActionCard}>
          <Text style={styles.lastActionTitle}>Last Action</Text>
          <View style={styles.lastActionRow}>
            <Icon
              source={
                lastAction.type === 'CHECK_IN'
                  ? 'login'
                  : 'logout'
              }
              size={20}
              color={
                lastAction.type === 'CHECK_IN'
                  ? '#10B981'
                  : '#F59E0B'
              }
            />
            <Text style={styles.lastActionText}>
              {lastAction.type === 'CHECK_IN'
                ? 'Checked In'
                : 'Checked Out'}{' '}
              at {lastAction.time}
            </Text>
          </View>
        </View>
      )}

      {/* INFO */}
      <View style={styles.infoCard}>
        <Icon source="information" size={20} color="#1D4ED8" />
        <Text style={styles.infoText}>
          You can check-in or check-out yourself if you belong to this gym.
          Duplicate check-ins are automatically prevented.
        </Text>
      </View>
    </View>
  );
};

export default AttendanceScreen;

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: 16,
    paddingTop: Platform.OS === 'web' ? 20 : 40,
    maxWidth: Platform.OS === 'web' ? 500 : '100%',
    alignSelf: 'center',
  },

  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
  },

  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 24,
    elevation: 3,
  },

  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    marginHorizontal: 6,
  },
  checkInBtn: {
    backgroundColor: '#10B981',
  },
  checkOutBtn: {
    backgroundColor: '#F59E0B',
  },
  disabledBtn: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 6,
  },

  lastActionCard: {
    backgroundColor: '#FFF',
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  lastActionTitle: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 8,
    fontWeight: '600',
  },
  lastActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lastActionText: {
    fontSize: 15,
    color: '#0F172A',
    fontWeight: '500',
    marginLeft: 8,
  },

  infoCard: {
    flexDirection: 'row',
    marginTop: 24,
    backgroundColor: '#EFF6FF',
    padding: 14,
    borderRadius: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#1E40AF',
    lineHeight: 18,
    marginLeft: 8,
  },
});
