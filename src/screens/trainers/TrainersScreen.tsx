import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Icon } from 'react-native-paper';
import api from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import { Trainer } from '../../types';
import { TRAINER_ENDPOINTS } from '../../utils/constants';

const TrainersScreen = () => {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [filteredTrainers, setFilteredTrainers] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'experience' | 'rate'>('experience');

  useEffect(() => {
    fetchTrainers();
  }, []);

  useEffect(() => {
    filterAndSortTrainers();
  }, [trainers, searchQuery, selectedSpecialization, sortBy]);

  const fetchTrainers = async () => {
    try {
      const response = await api.get(TRAINER_ENDPOINTS.GET_ALL);
      setTrainers(response.data);
    } catch (error) {
      console.error('Error fetching trainers:', error);
      Alert.alert('Error', 'Failed to fetch trainers');
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortTrainers = () => {
    let filtered = [...trainers];

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(trainer =>
        trainer.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trainer.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trainer.specialization.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by specialization
    if (selectedSpecialization) {
      filtered = filtered.filter(trainer => trainer.specialization === selectedSpecialization);
    }

    // Sort trainers
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'experience':
          return (b.experienceYears || 0) - (a.experienceYears || 0);
        case 'rate':
          return (b.hourlyRate || 0) - (a.hourlyRate || 0);
        default:
          return 0;
      }
    });

    setFilteredTrainers(filtered);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTrainers();
    setRefreshing(false);
  };

  const getUniqueSpecializations = () => {
    const specializations = trainers.map(trainer => trainer.specialization).filter(Boolean);
    return [...new Set(specializations)];
  };

  const handleTrainerPress = (trainer: Trainer) => {
    navigation.navigate('TrainerDetail', { trainerId: trainer.id });
  };

  const handleCreateTrainer = () => {
    navigation.navigate('CreateTrainer');
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
        <View style={styles.headerContent}>
          <Text style={styles.title}>Trainers</Text>
          <Text style={styles.subtitle}>{filteredTrainers.length} trainers</Text>
        </View>
        {(user?.role === 'ADMIN' || user?.role === 'MANAGER') && (
          <TouchableOpacity style={styles.addButton} onPress={handleCreateTrainer}>
            <Icon source="plus" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={filteredTrainers}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderTrainerItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon source="dumbbell" size={48} color="#64748B" />
            <Text style={styles.emptyText}>
              {trainers.length === 0 ? 'No trainers found' : 'No trainers match your filters'}
            </Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  addButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 24,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
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

