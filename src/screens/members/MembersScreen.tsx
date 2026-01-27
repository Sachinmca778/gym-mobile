import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Icon } from 'react-native-paper';
import api from '../../api/api';
import { Member } from '../../types';

const MembersScreen = () => {
  const navigation = useNavigation<any>();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);

  useEffect(() => {
    fetchMembers();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = members.filter(
        (member) =>
          member.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          member.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          member.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          member.phone?.includes(searchTerm)
      );
      setFilteredMembers(filtered);
    } else {
      setFilteredMembers(members);
    }
  }, [searchTerm, members]);

  const fetchMembers = async () => {
    try {
      const response = await api.get('/gym/members/all');
      setMembers(response.data);
      setFilteredMembers(response.data);
    } catch (error) {
      console.error('Error fetching members:', error);
      Alert.alert('Error', 'Failed to fetch members');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchMembers();
    setRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return '#10B981';
      case 'EXPIRED':
        return '#EF4444';
      case 'INACTIVE':
        return '#F59E0B';
      default:
        return '#64748B';
    }
  };

  const renderMemberItem = ({ item }: { item: Member }) => (
    <TouchableOpacity
      style={styles.memberCard}
      onPress={() => navigation.navigate('MemberDetail', { memberId: item.id })}
    >
      <View style={styles.avatarContainer}>
        <Text style={styles.avatarText}>
          {item.firstName.charAt(0)}
          {item.lastName.charAt(0)}
        </Text>
      </View>
      <View style={styles.memberInfo}>
        <Text style={styles.memberName}>
          {item.firstName} {item.lastName}
        </Text>
        <Text style={styles.memberEmail}>{item.email || 'No email'}</Text>
        <Text style={styles.memberPhone}>{item.phone}</Text>
      </View>
      <View style={styles.statusContainer}>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: `${getStatusColor(item.status)}20` },
          ]}
        >
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {item.status}
          </Text>
        </View>
        <Icon source="chevron-right" size={20} color="#64748B" />
      </View>
    </TouchableOpacity>
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
        <Text style={styles.title}>Members</Text>
        <Text style={styles.subtitle}>
          {filteredMembers.length} members found
        </Text>
      </View>

      <View style={styles.searchContainer}>
        <Icon source="magnify" size={20} color="#64748B" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search members..."
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
      </View>

      <FlatList
        data={filteredMembers}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderMemberItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon source="account-search" size={48} color="#64748B" />
            <Text style={styles.emptyText}>No members found</Text>
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    fontSize: 16,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  memberInfo: {
    flex: 1,
    marginLeft: 12,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
  },
  memberEmail: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 2,
  },
  memberPhone: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
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

export default MembersScreen;

