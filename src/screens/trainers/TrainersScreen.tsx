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
import { Trainer } from '../../types';

const TrainersScreen = () => {
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchTrainers();
  }, []);

  const fetchTrainers = async () => {
    try {
      const response = await api.get('/gym/trainers/all');
      setTrainers(response.data);
    } catch (error) {
      console.error('Error fetching trainers:', error);
      Alert.alert('Error', 'Failed to fetch trainers');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTrainers();
    setRefreshing(false);
  };

  const renderTrainerItem = ({ item }: { item: Trainer }) => (
    <View style={styles.trainerCard}>
      <View style={styles.avatarContainer}>
        <Text style={styles.avatarText}>
          {item.firstName.charAt(0)}
          {item.lastName.charAt(0)}
        </Text>
      </View>

      <View style={styles.trainerInfo}>
        <Text style={styles.trainerName}>
          {item.firstName} {item.lastName}
        </Text>
        <View style={styles.specializationBadge}>
          <Text style={styles.specializationText}>{item.specialization}</Text>
        </View>

        <View style={styles.detailsContainer}>
          <View style={styles.detailItem}>
            <Icon source="star" size={16} color="#F59E0B" />
            <Text style={styles.detailText}>{item.experienceYears} years exp.</Text>
          </View>
          <View style={styles.detailItem}>
            <Icon source="currency-inr" size={16} color="#10B981" />
            <Text style={styles.detailText}>₹{item.hourlyRate}/hr</Text>
          </View>
        </View>

        <View style={styles.contactRow}>
          <Icon source="email" size={14} color="#64748B" />
          <Text style={styles.contactText}>{item.email || 'N/A'}</Text>
        </View>
        <View style={styles.contactRow}>
          <Icon source="phone" size={14} color="#64748B" />
          <Text style={styles.contactText}>{item.phone || 'N/A'}</Text>
        </View>
      </View>
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
        <Text style={styles.title}>Trainers</Text>
        <Text style={styles.subtitle}>{trainers.length} trainers</Text>
      </View>

      <FlatList
        data={trainers}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderTrainerItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon source="dumbbell" size={48} color="#64748B" />
            <Text style={styles.emptyText}>No trainers found</Text>
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
  trainerCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
  },
  trainerInfo: {
    flex: 1,
    marginLeft: 16,
  },
  trainerName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 6,
  },
  specializationBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  specializationText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3B82F6',
  },
  detailsContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 12,
    color: '#64748B',
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  contactText: {
    fontSize: 12,
    color: '#64748B',
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

export default TrainersScreen;

