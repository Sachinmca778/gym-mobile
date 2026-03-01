
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
import { Member, MemberMembership } from '../../types';

const MemberDetailScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const memberId = (route.params as { memberId?: string })?.memberId;
  
  const [member, setMember] = useState<Member | null>(null);
  const [memberships, setMemberships] = useState<MemberMembership[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (memberId) {
      fetchMemberDetails();
      fetchMemberships();
    }
  }, [memberId]);

  const fetchMemberDetails = async () => {
    try {
      const response = await api.get(`/gym/members/${memberId}`);
      setMember(response.data);
    } catch (error) {
      console.error('Error fetching member details:', error);
      Alert.alert('Error', 'Failed to fetch member details');
    }
  };

  const fetchMemberships = async () => {
    try {
      const response = await api.get(`/gym/memberships/member/${memberId}`);
      setMemberships(response.data);
    } catch (error) {
      console.error('Error fetching memberships:', error);
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

  const activeMembership = memberships.find(m => m.status === 'ACTIVE');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return '#10B981';
      case 'EXPIRED': return '#EF4444';
      case 'CANCELLED': return '#F59E0B';
      case 'SUSPENDED': return '#8B5CF6';
      default: return '#64748B';
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarLarge}>
          <Text style={styles.avatarText}>
            {member.firstName.charAt(0)}{member.lastName.charAt(0)}
          </Text>
        </View>
        <Text style={styles.memberName}>{member.firstName} {member.lastName}</Text>
        <View style={[styles.statusBadge, { backgroundColor: member.status === 'ACTIVE' ? '#10B98120' : '#F59E0B20' }]}>
          <Text style={[styles.statusText, { color: member.status === 'ACTIVE' ? '#10B981' : '#F59E0B' }]}>
            {member.status}
          </Text>
        </View>
      </View>

      <View style={styles.membershipSection}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Membership</Text>
          <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('AssignMembership')}>
            <Icon source="plus" size={16} color="#FFFFFF" />
            <Text style={styles.addButtonText}>Assign</Text>
          </TouchableOpacity>
        </View>
        
        {activeMembership ? (
          <View style={styles.membershipCard}>
            <View style={styles.membershipHeader}>
              <View style={styles.membershipBadge}><Text style={styles.membershipBadgeText}>ACTIVE</Text></View>
              <Text style={styles.membershipAmount}>₹{activeMembership.amountPaid}</Text>
            </View>
            <View style={styles.membershipDetails}>
              <View style={styles.membershipRow}>
                <Icon source="calendar" size={18} color="#64748B" />
                <Text style={styles.membershipLabel}>Start:</Text>
                <Text style={styles.membershipValue}>{activeMembership.startDate}</Text>
              </View>
              <View style={styles.membershipRow}>
                <Icon source="calendar-clock" size={18} color="#64748B" />
                <Text style={styles.membershipLabel}>End:</Text>
                <Text style={styles.membershipValue}>{activeMembership.endDate}</Text>
              </View>
              {activeMembership.autoRenewal && (
                <View style={styles.membershipRow}>
                  <Icon source="refresh" size={18} color="#10B981" />
                  <Text style={[styles.membershipValue, { color: '#10B981' }]}>Auto Renewal</Text>
                </View>
              )}
            </View>
          </View>
        ) : (
          <View style={styles.noMembershipCard}>
            <Icon source="card-off" size={40} color="#94A3B8" />
            <Text style={styles.noMembershipText}>No active membership</Text>
            <TouchableOpacity style={styles.assignButton} onPress={() => navigation.navigate('AssignMembership')}>
              <Text style={styles.assignButtonText}>Assign Membership</Text>
            </TouchableOpacity>
          </View>
        )}

        {memberships.length > 1 && (
          <View style={styles.historySection}>
            <Text style={styles.historyTitle}>History</Text>
            {memberships.map((m) => (
              <View key={m.id} style={styles.historyItem}>
                <View style={styles.historyLeft}>
                  <View style={[styles.historyStatusDot, { backgroundColor: getStatusColor(m.status) }]} />
                  <Text style={styles.historyStatus}>{m.status}</Text>
                </View>
                <Text style={styles.historyDates}>{m.startDate} - {m.endDate}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personal Info</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}><Icon source="identifier" size={20} color="#64748B" /><Text style={styles.infoValue}>{member.memberCode}</Text></View>
          <View style={styles.infoRow}><Icon source="account" size={20} color="#64748B" /><Text style={styles.infoValue}>{member.firstName} {member.lastName}</Text></View>
          <View style={styles.infoRow}><Icon source="phone" size={20} color="#64748B" /><Text style={styles.infoValue}>{member.phone}</Text></View>
          <View style={styles.infoRow}><Icon source="email" size={20} color="#64748B" /><Text style={styles.infoValue}>{member.email || 'N/A'}</Text></View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Address</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}><Icon source="map-marker" size={20} color="#64748B" /><Text style={styles.infoValue}>{member.address || 'N/A'}</Text></View>
          <View style={styles.infoRow}><Icon source="city" size={20} color="#64748B" /><Text style={styles.infoValue}>{member.city || 'N/A'}</Text></View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Emergency Contact</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}><Icon source="account-alert" size={20} color="#64748B" /><Text style={styles.infoValue}>{member.emergencyContactName || 'N/A'}</Text></View>
          <View style={styles.infoRow}><Icon source="phone-alert" size={20} color="#64748B" /><Text style={styles.infoValue}>{member.emergencyContactPhone || 'N/A'}</Text></View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: 16, color: '#EF4444' },
  header: { backgroundColor: '#FFFFFF', padding: 24, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  avatarLarge: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#3B82F6', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  avatarText: { color: '#FFFFFF', fontSize: 28, fontWeight: '600' },
  memberName: { fontSize: 24, fontWeight: 'bold', color: '#0F172A', marginBottom: 8 },
  statusBadge: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20 },
  statusText: { fontSize: 14, fontWeight: '600' },
  membershipSection: { padding: 16 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#0F172A', marginBottom: 12 },
  addButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#3B82F6', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  addButtonText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600', marginLeft: 4 },
  membershipCard: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#10B981' },
  membershipHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  membershipBadge: { backgroundColor: '#10B98120', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  membershipBadgeText: { color: '#10B981', fontSize: 12, fontWeight: '600' },
  membershipAmount: { fontSize: 24, fontWeight: 'bold', color: '#0F172A' },
  membershipDetails: {},
  membershipRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  membershipLabel: { fontSize: 14, color: '#64748B', marginLeft: 8, marginRight: 4 },
  membershipValue: { fontSize: 14, fontWeight: '500', color: '#0F172A' },
  noMembershipCard: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0', borderStyle: 'dashed' },
  noMembershipText: { fontSize: 14, color: '#64748B', marginTop: 8, marginBottom: 16 },
  assignButton: { backgroundColor: '#3B82F6', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  assignButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  historySection: { marginTop: 16 },
  historyTitle: { fontSize: 14, fontWeight: '600', color: '#64748B', marginBottom: 8 },
  historyItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 12, borderRadius: 8, marginBottom: 8 },
  historyLeft: { flexDirection: 'row', alignItems: 'center' },
  historyStatusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  historyStatus: { fontSize: 14, fontWeight: '500', color: '#0F172A' },
  historyDates: { fontSize: 12, color: '#64748B' },
  section: { padding: 16 },
  infoCard: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16 },
  infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  infoValue: { fontSize: 14, color: '#0F172A', marginLeft: 12 },
});

export default MemberDetailScreen;

