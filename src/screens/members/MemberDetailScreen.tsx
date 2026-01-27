import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { RouteProp } from '@react-navigation/native-stack';
import { Icon } from 'react-native-paper';
import api from '../../api/api';
import { Member } from '../../types';


type MemberDetailScreenProps = {
  route: RouteProp<any, 'MemberDetail'>;
};

const MemberDetailScreen: React.FC<MemberDetailScreenProps> = ({ route }) => {
  const { memberId } = route.params;
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMemberDetails();
  }, [memberId]);

  const fetchMemberDetails = async () => {
    try {
      const response = await api.get(`/gym/members/${memberId}`);
      setMember(response.data);
    } catch (error) {
      console.error('Error fetching member details:', error);
      Alert.alert('Error', 'Failed to fetch member details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (!member) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Member not found</Text>
      </View>
    );
  }

  const infoSections = [
    {
      title: 'Personal Information',
      items: [
        { label: 'Member ID', value: member.memberCode, icon: 'identifier' },
        { label: 'Full Name', value: `${member.firstName} ${member.lastName}`, icon: 'account' },
        { label: 'Email', value: member.email || 'N/A', icon: 'email' },
        { label: 'Phone', value: member.phone, icon: 'phone' },
        { label: 'Date of Birth', value: member.dateOfBirth || 'N/A', icon: 'calendar' },
        { label: 'Gender', value: member.gender || 'N/A', icon: 'gender-male-female' },
      ],
    },
    {
      title: 'Address',
      items: [
        { label: 'Address', value: member.address || 'N/A', icon: 'map-marker' },
        { label: 'City', value: member.city || 'N/A', icon: 'city' },
        { label: 'State', value: member.state || 'N/A', icon: 'map' },
        { label: 'Pincode', value: member.pincode || 'N/A', icon: 'pin' },
      ],
    },
    {
      title: 'Emergency Contact',
      items: [
        { label: 'Contact Name', value: member.emergencyContactName || 'N/A', icon: 'account-alert' },
        { label: 'Phone', value: member.emergencyContactPhone || 'N/A', icon: 'phone-alert' },
        { label: 'Relation', value: member.emergencyContactRelation || 'N/A', icon: 'account-multiple' },
      ],
    },
    {
      title: 'Health Information',
      items: [
        { label: 'Medical Conditions', value: member.medicalConditions || 'None', icon: 'medical-bag' },
        { label: 'Allergies', value: member.allergies || 'None', icon: 'alert-circle' },
        { label: 'Fitness Goals', value: member.fitnessGoals || 'Not set', icon: 'target' },
      ],
    },
    {
      title: 'Membership Status',
      items: [
        { label: 'Status', value: member.status, icon: 'check-circle' },
        { label: 'Join Date', value: member.joinDate || 'N/A', icon: 'calendar-plus' },
      ],
    },
  ];

  const getIconName = (icon: string) => {
    return icon;
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatarLarge}>
          <Text style={styles.avatarText}>
            {member.firstName.charAt(0)}
            {member.lastName.charAt(0)}
          </Text>
        </View>
        <Text style={styles.memberName}>
          {member.firstName} {member.lastName}
        </Text>
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor:
                member.status === 'ACTIVE'
                  ? '#10B98120'
                  : member.status === 'EXPIRED'
                  ? '#EF444420'
                  : '#F59E0B20',
            },
          ]}
        >
          <Text
            style={[
              styles.statusText,
              {
                color:
                  member.status === 'ACTIVE'
                    ? '#10B981'
                    : member.status === 'EXPIRED'
                    ? '#EF4444'
                    : '#F59E0B',
              },
            ]}
          >
            {member.status}
          </Text>
        </View>
      </View>

      {/* Info Sections */}
      {infoSections.map((section, index) => (
        <View key={index} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <View style={styles.infoCard}>
            {section.items.map((item, itemIndex) => (
              <View key={itemIndex} style={styles.infoRow}>
                <View style={styles.infoIcon}>
                  <Icon source={getIconName(item.icon) as any} size={20} color="#64748B" />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>{item.label}</Text>
                  <Text style={styles.infoValue}>{item.value}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      ))}
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
    color: '#EF4444',
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  avatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '600',
  },
  memberName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '500',
  },
});

export default MemberDetailScreen;

