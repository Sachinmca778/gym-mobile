import React, { useState, useEffect, useRef } from 'react';
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


const AttendanceScreen = () => {
  const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;
  const GYM_ID = typeof window !== 'undefined' ? localStorage.getItem('gymId') : null;
  const [loadingType, setLoadingType] =
    useState<'CHECK_IN' | 'CHECK_OUT' | null>(null);

  // Attendance state
  // isCompleted means both check-in and check-out are done
  const [isCompleted, setIsCompleted] = useState(false);
  const [todayAttendance, setTodayAttendance] = useState<any>(null);
  const [currentAttendance, setCurrentAttendance] = useState<any>(null);
  const [elapsedTime, setElapsedTime] = useState<string>('00:00:00');
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // ================= FETCH ATTENDANCE STATUS =================
  const fetchAttendanceStatus = async () => {
    if (!userId || !GYM_ID) return;

    // Step 1: Check for today's completed attendance
    try {
      const todayResponse = await api.get(
        `/api/gyms/${GYM_ID}/attendance/today/${userId}`
      );
      setTodayAttendance(todayResponse.data);
      setCurrentAttendance(null);
      setIsCompleted(true);
      return;
    } catch {
      // No completed attendance today - continue to check for open attendance
      setTodayAttendance(null);
    }

    // Step 2: Check for current open attendance (checked in but not out)
    try {
      const currentResponse = await api.get(
        `/api/gyms/${GYM_ID}/attendance/current/${userId}`
      );
      setCurrentAttendance(currentResponse.data);
      setIsCompleted(false);
    } catch {
      // No open attendance
      setCurrentAttendance(null);
      setIsCompleted(false);
    }
  };

  // ================= TIMER FUNCTIONS =================
  const formatElapsedTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDuration = (minutes: number): string => {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins} minutes`;
  };

  const startTimer = (checkInTime: string) => {
    const checkInDate = new Date(checkInTime);
    const updateTimer = () => {
      const now = new Date();
      const elapsedSeconds = Math.floor((now.getTime() - checkInDate.getTime()) / 1000);
      setElapsedTime(formatElapsedTime(elapsedSeconds));
    };

    updateTimer(); // Initial update
    timerRef.current = setInterval(updateTimer, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // ================= USE EFFECTS =================
  useEffect(() => {
    fetchAttendanceStatus();
  }, [userId, GYM_ID]);

  useEffect(() => {
    if (currentAttendance?.checkIn && !isCompleted) {
      startTimer(currentAttendance.checkIn);
    } else {
      stopTimer();
      setElapsedTime('00:00:00');
    }

    return () => stopTimer();
  }, [currentAttendance, isCompleted]);

  // ================= CHECK IN =================
  const handleCheckIn = async () => {
    if (!userId) {
      Alert.alert('Validation Error', 'User not authenticated');
      return;
    }

    try {
      setLoadingType('CHECK_IN');

      const response = await api.post(
        `/api/gyms/${GYM_ID}/attendance/check-in/${userId}`,
        { method: 'MANUAL' }
      );

      setCurrentAttendance(response.data);
      setTodayAttendance(null);
      setIsCompleted(false);

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
    if (Platform.OS === 'web') {
      window.alert('User not authenticated');
    } else {
      Alert.alert('Validation Error', 'User not authenticated');
    }
    return;
  }

  const proceedCheckOut = async () => {
    try {
      setLoadingType('CHECK_OUT');

      const response = await api.post(
        `/api/gyms/${GYM_ID}/attendance/check-out/${userId}`
      );

      setTodayAttendance(response.data);
      setCurrentAttendance(null);
      setIsCompleted(true);
      stopTimer();

      if (Platform.OS === 'web') {
        window.alert('Checked out successfully');
      } else {
        Alert.alert('Success', 'Checked out successfully');
      }
    } catch (error: any) {
      const message =
        error?.response?.data?.message || 'Check-out failed';

      if (Platform.OS === 'web') {
        window.alert(message);
      } else {
        Alert.alert('Error', message);
      }
    } finally {
      setLoadingType(null);
    }
  };

  // 🔹 Confirmation (Web vs Mobile)
  if (Platform.OS === 'web') {
    const confirmed = window.confirm(
      'Are you sure you want to check out? Your session duration will be recorded.'
    );
    if (confirmed) {
      await proceedCheckOut();
    }
  } else {
    Alert.alert(
      'Confirm Check-out',
      'Are you sure you want to check out? Your session duration will be recorded.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Check Out',
          style: 'destructive',
          onPress: proceedCheckOut,
        },
      ]
    );
  }
};


  // ================= RENDER ATTENDANCE SUMMARY =================
  const renderAttendanceSummary = () => {
    if (!todayAttendance) return null;

    const checkInTime = new Date(todayAttendance.checkIn).toLocaleTimeString();
    const checkOutTime = new Date(todayAttendance.checkOut).toLocaleTimeString();
    const duration = formatDuration(todayAttendance.durationMinutes);

    return (
      <View style={styles.summaryCard}>
        <View style={styles.summaryHeader}>
          <Icon source="check-circle" size={24} color="#10B981" />
          <Text style={styles.summaryTitle}>Today's Session Complete</Text>
        </View>
        
        <View style={styles.summaryRow}>
          <Icon source="login" size={18} color="#10B981" />
          <Text style={styles.summaryText}>
            Check-in: <Text style={styles.summaryValue}>{checkInTime}</Text>
          </Text>
        </View>
        
        <View style={styles.summaryRow}>
          <Icon source="logout" size={18} color="#F59E0B" />
          <Text style={styles.summaryText}>
            Check-out: <Text style={styles.summaryValue}>{checkOutTime}</Text>
          </Text>
        </View>
        
        <View style={styles.summaryRow}>
          <Icon source="clock-outline" size={18} color="#6366F1" />
          <Text style={styles.summaryText}>
            Total Duration: <Text style={styles.summaryValue}>{duration}</Text>
          </Text>
        </View>
      </View>
    );
  };

  // ================= RENDER =================
  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.title}>Gym Attendance</Text>
        <Text style={styles.subtitle}>
          Check-in / Check-out Members
        </Text>
      </View>

      {/* ATTENDANCE SUMMARY (After check-in and check-out) */}
      {isCompleted && renderAttendanceSummary()}

      {/* CURRENT SESSION TIMER (While checked in but not completed) */}
      {currentAttendance && !isCompleted && (
        <View style={styles.timerCard}>
          <Text style={styles.timerTitle}>Current Session</Text>
          <Text style={styles.timerDisplay}>{elapsedTime}</Text>
          <Text style={styles.timerSubtitle}>
            Checked in at {new Date(currentAttendance.checkIn).toLocaleTimeString()}
          </Text>
        </View>
      )}

      {/* ACTION BUTTONS CARD */}
      <View style={styles.card}>
        {!isCompleted ? (
          <>
            {/* CHECK IN BUTTON */}
            <Pressable
              style={[
                styles.button,
                styles.checkInBtn,
                (loadingType !== null || currentAttendance) && styles.disabledBtn,
              ]}
              onPress={handleCheckIn}
              disabled={loadingType !== null || currentAttendance}
            >
              {loadingType === 'CHECK_IN' ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <>
                  <Icon source="login" size={20} color="#FFF" />
                  <Text style={styles.buttonText}>
                    {currentAttendance ? 'Already Checked In' : 'Check In'}
                  </Text>
                </>
              )}
            </Pressable>

            {/* CHECK OUT BUTTON */}
            <Pressable
              style={[
                styles.button,
                styles.checkOutBtn,
                (loadingType !== null || !currentAttendance) && styles.disabledBtn,
              ]}
              onPress={handleCheckOut}
              disabled={loadingType !== null || !currentAttendance}
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
          </>
        ) : (
          /* ALREADY COMPLETED TODAY MESSAGE */
          <View style={styles.completedMessage}>
            <Icon source="check-all" size={32} color="#10B981" />
            <Text style={styles.completedText}>
              You've completed your attendance for today!
            </Text>
            <Text style={styles.completedSubtext}>
              Come back tomorrow to check in again.
            </Text>
          </View>
        )}
      </View>

      {/* INFO */}
      <View style={styles.infoCard}>
        <Icon source="information" size={20} color="#1D4ED8" />
        <Text style={styles.infoText}>
          You can check-in once per day. After check-in, you can check out when you're done.
          Your session duration will be recorded.
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
    opacity: 0.5,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 6,
  },

  timerCard: {
    backgroundColor: '#FFF',
    marginBottom: 20,
    padding: 20,
    borderRadius: 16,
    elevation: 3,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#10B981',
  },
  timerTitle: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 8,
    fontWeight: '600',
  },
  timerDisplay: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#10B981',
    marginBottom: 4,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  timerSubtitle: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
  },

  summaryCard: {
    backgroundColor: '#FFF',
    marginBottom: 20,
    padding: 20,
    borderRadius: 16,
    elevation: 3,
    borderWidth: 2,
    borderColor: '#10B981',
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10B981',
    marginLeft: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryText: {
    fontSize: 14,
    color: '#64748B',
    marginLeft: 8,
    flex: 1,
  },
  summaryValue: {
    fontWeight: '600',
    color: '#0F172A',
  },

  completedMessage: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  completedText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10B981',
    marginTop: 12,
    textAlign: 'center',
  },
  completedSubtext: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
    textAlign: 'center',
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

