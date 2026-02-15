import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { DrawerContentScrollView, DrawerItemList, DrawerContentComponentProps } from '@react-navigation/drawer';
import { Icon } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { getRolePermissions } from '../utils/permissions';

interface MenuItem {
  name: string;
  label: string;
  icon: string;
  permission?: string;
}

const MenuItems: MenuItem[] = [
  { name: 'Dashboard', label: 'Dashboard', icon: 'view-dashboard', permission: 'canViewDashboard' },
  { name: 'Members', label: 'Members', icon: 'account-group', permission: 'canViewMembers' },
  { name: 'Attendance', label: 'Attendance', icon: 'check-circle', permission: 'canViewAttendance' },
  { name: 'Payments', label: 'Payments', icon: 'credit-card', permission: 'canViewPayments' },
  { name: 'Memberships', label: 'Memberships', icon: 'card-account-details', permission: 'canViewMemberships' },
  { name: 'Trainers', label: 'Trainers', icon: 'dumbbell', permission: 'canViewTrainers' },
  { name: 'Gyms', label: 'Gyms', icon: 'home-city', permission: 'canViewGyms' },
  { name: 'Profile', label: 'Profile', icon: 'account', permission: 'canViewProfile' },
  { name: 'Signup', label: 'Create User', icon: 'account-plus', permission: 'canManageUsers' },
];

const CustomSidebar = (props: DrawerContentComponentProps) => {
  const { user, logout } = useAuth();
  const permissions = getRolePermissions(user?.role || '');

  // Filter menu items based on permissions
  const filteredMenuItems = MenuItems.filter(item => {
    if (!item.permission) return true;
    return permissions[item.permission as keyof typeof permissions] === true;
  });

  const handleLogout = () => {
    logout();
    props.navigation.closeDrawer();
  };

  const getRoleLabel = (role: string) => {
    const roleLabels: Record<string, string> = {
      SUPER_USER: 'Super Admin',
      ADMIN: 'Admin',
      MANAGER: 'Manager',
      RECEPTIONIST: 'Receptionist',
      TRAINER: 'Trainer',
      MEMBER: 'Member',
      GUEST: 'Guest',
    };
    return roleLabels[role] || role;
  };

  return (
    <DrawerContentScrollView {...props} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Icon source="account" size={40} color="#3B82F6" />
        </View>
        <Text style={styles.userName}>{user?.firstName || user?.username || 'User'}</Text>
        <Text style={styles.userRole}>{getRoleLabel(user?.role || '')}</Text>
      </View>

      {/* Menu Items */}
      <View style={styles.menuContainer}>
        {filteredMenuItems.map((item) => {
          const isActive = props.state.routes[props.state.index]?.name === item.name;
          return (
            <TouchableOpacity
              key={item.name}
              style={[styles.menuItem, isActive && styles.menuItemActive]}
              onPress={() => props.navigation.navigate(item.name)}
            >
              <Icon 
                source={item.icon} 
                size={22} 
                color={isActive ? '#3B82F6' : '#64748B'} 
              />
              <Text style={[styles.menuLabel, isActive && styles.menuLabelActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Icon source="logout" size={22} color="#EF4444" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </DrawerContentScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    padding: 20,
    backgroundColor: '#3B82F6',
    marginBottom: 10,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  avatarContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 10,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  userRole: {
    fontSize: 14,
    color: '#E0E7FF',
    textAlign: 'center',
    marginTop: 4,
  },
  menuContainer: {
    paddingHorizontal: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 15,
    borderRadius: 12,
    marginBottom: 4,
  },
  menuItemActive: {
    backgroundColor: '#EFF6FF',
  },
  menuLabel: {
    fontSize: 15,
    color: '#64748B',
    marginLeft: 15,
    fontWeight: '500',
  },
  menuLabelActive: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 15,
    marginTop: 20,
    marginHorizontal: 10,
    borderRadius: 12,
    backgroundColor: '#FEF2F2',
  },
  logoutText: {
    fontSize: 15,
    color: '#EF4444',
    marginLeft: 15,
    fontWeight: '600',
  },
});

export default CustomSidebar;

