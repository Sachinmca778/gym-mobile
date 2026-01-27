import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Icon } from 'react-native-paper';
import api from '../../api/api';
import { ProgressTracking } from '../../types';

const ProgressScreen = () => {
  const [progress, setProgress] = useState<ProgressTracking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchProgressData();
  }, []);

  const fetchProgressData = async () => {
    try {
      const response = await api.get('/gym/progress');
      setProgress(response.data);
    } catch (error) {
      console.error('Error fetching progress data:', error);
      Alert.alert('Error', 'Failed to fetch progress data');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProgressData();
    setRefreshing(false);
  };

  const renderProgressItem = ({ item }: { item: ProgressTracking }) => (
    <View style={styles.progressCard}>
      <View style={styles.progressHeader}>
        <Text style={styles.date}>
          {new Date(item.measurementDate).toLocaleDateString()}
        </Text>
        <Icon source="chart-line" size={20} color="#3B82F6" />
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Weight</Text>
          <Text style={styles.statValue}>{item.weight} kg</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Height</Text>
          <Text style={styles.statValue}>{item.height} cm</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Body Fat</Text>
          <Text style={styles.statValue}>{item.bodyFat}%</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Muscle Mass</Text>
          <Text style={styles.statValue}>{item.muscleMass} kg</Text>
        </View>
      </View>

      {item.notes && (
        <View style={styles.notesContainer}>
          <Text style={styles.notesLabel}>Notes:</Text>
          <Text style={styles.notesText}>{item.notes}</Text>
        </View>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Progress Tracking</Text>
        <Text style={styles.subtitle}>Monitor member fitness progress</Text>
      </View>

      <FlatList
        data={progress}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderProgressItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon source="chart-timeline-variant" size={48} color="#64748B" />
            <Text style={styles.emptyText}>No progress records found</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    padding: 16,
    paddingTop: 40,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
  },
  progressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  date: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#3B82F6',
  },
  notesContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  notesLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14,
    color: '#0F172A',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    color: '#64748B',
    marginTop: 12,
  },
});

export default ProgressScreen;

