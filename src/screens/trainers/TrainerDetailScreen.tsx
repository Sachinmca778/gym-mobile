import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Icon } from 'react-native-paper';
import api from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import { Trainer } from '../../types';
import { TRAINER_ENDPOINTS } from '../../utils/constants';

const TrainerDetailScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { user } = useAuth();
  const { trainerId } = route.params;

  const [trainer, setTrainer] = useState<Trainer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrainerDetails();
  }, [trainerId]);

  const fetchTrainerDetails = async () => {
    try {
      const response = await api.get(TRAINER_ENDPOINTS.GET_BY_ID(trainerId));
      setTrainer(response.data);
    } catch (error) {
      console.error('Error fetching trainer details:', error);
      Alert.alert('Error', 'Failed to fetch trainer details');
    } finally {
      setLoading(false);
    }
  };

  const handleEditTrainer = () => {
    navigation.navigate('CreateTrainer', { trainer });
  };

  const handleDeleteTrainer = () => {
    Alert.alert(
      'Delete Trainer',
      'Are you sure you want to delete this trainer?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(TRAINER_ENDPOINTS.DELETE(trainerId));
              Alert.alert('Success', 'Trainer deleted successfully');
              navigation.goBack();
            } catch (error) {
              console.error('Error deleting trainer:', error);
              Alert.alert('Error', 'Failed to delete trainer');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (!trainer) {
    return (
      <View style={styles.errorContainer}>
        <Icon source="alert-circle" size={48} color="#EF4444" />
        <Text style={styles.errorText}>Trainer not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {trainer.firstName.charAt(0)}
            {trainer.lastName.charAt(0)}
          </Text>
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.trainerName}>
            {trainer.firstName} {trainer.lastName}
          </Text>
          <View style={styles.specializationBadge}>
            <Text style={styles.specializationText}>{trainer.specialization}</Text>
          </View>
        </View>
      </View>

      {/* Stats Section */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Icon source="star" size={24} color="#F59E0B" />
          <Text style={styles.statValue}>{trainer.experienceYears}</Text>
          <Text style={styles.statLabel}>Years Exp.</Text>
        </View>
        <View style={styles.statItem}>
          <Icon source="currency-inr" size={24} color="#10B981" />
          <Text style={styles.statValue}>₹{trainer.hourlyRate}</Text>
          <Text style={styles.statLabel}>Per Hour</Text>
        </View>
      </View>

      {/* Bio Section */}
      {trainer.bio && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.bioText}>{trainer.bio}</Text>
        </View>
      )}

      {/* Certifications Section */}
      {trainer.certifications && trainer.certifications.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Certifications</Text>
          {trainer.certifications.map((cert, index) => (
            <View key={index} style={styles.certificationItem}>
              <Icon source="certificate" size={20} color="#3B82F6" />
              <Text style={styles.certificationText}>{cert}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Schedule Section */}
      {trainer.schedule && Object.keys(trainer.schedule).length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Schedule</Text>
          {Object.entries(trainer.schedule).map(([day, time]) => (
            <View key={day} style={styles.scheduleItem}>
              <Text style={styles.dayText}>{day}</Text>
              <Text style={styles.timeText}>{time}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Contact Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact Information</Text>
        <View style={styles.contactItem}>
          <Icon source="email" size={20} color="#64748B" />
          <Text style={styles.contactText}>{trainer.email || 'Not provided'}</Text>
        </View>
        <View style={styles.contactItem}>
          <Icon source="phone" size={20} color="#64748B" />
          <Text style={styles.contactText}>{trainer.phone || 'Not provided'}</Text>
        </View>
        <View style={styles.contactItem}>
          <Icon source="map-marker" size={20} color="#64748B" />
          <Text style={styles.contactText}>{trainer.location || 'Not provided'}</Text>
        </View>
      </View>

      {/* Action Buttons for Admin/Manager */}
      {(user?.role === 'ADMIN' || user?.role === 'MANAGER') && (
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.editButton} onPress={handleEditTrainer}>
            <Icon source="pencil" size={20} color="#FFFFFF" />
            <Text style={styles.editButtonText}>Edit Trainer</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteTrainer}>
            <Icon source="delete" size={20} color="#FFFFFF" />
            <Text style={styles.deleteButtonText}>Delete Trainer</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#64748B',
    marginTop: 12,
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '600',
  },
  headerInfo: {
    flex: 1,
    marginLeft: 16,
  },
  trainerName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 8,
  },
  specializationBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  specializationText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
  },
  statsContainer: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0F172A',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
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
    marginBottom: 12,
  },
  bioText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
  },
  certificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  certificationText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 12,
  },
  scheduleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  dayText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#0F172A',
  },
  timeText: {
    fontSize: 14,
    color: '#64748B',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  contactText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 12,
  },
  actionsContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  editButton: {
    flex: 1,
    backgroundColor: '#3B82F6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#EF4444',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default TrainerDetailScreen;
