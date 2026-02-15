import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Icon } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { canAccessScreen, getRolePermissions } from '../utils/permissions';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import SignupScreen from '../screens/auth/SignupScreen';

// Main Screens
import DashboardScreen from '../screens/dashboard/DashboardScreen';
import MembersScreen from '../screens/members/MembersScreen';
import MemberDetailScreen from '../screens/members/MemberDetailScreen';
import CreateMemberScreen from '../screens/members/CreateMemberScreen';
import AssignMembershipScreen from '../screens/memberships/AssignMembershipScreen';
import CreateMembershipPlanScreen from '../screens/memberships/CreateMembershipPlanScreen';
import AttendanceScreen from '../screens/attendance/AttendanceScreen';
import MembershipsScreen from '../screens/memberships/MembershipsScreen';
import ProgressScreen from '../screens/progress/ProgressScreen';
import PaymentsScreen from '../screens/payments/PaymentsScreen';
import CreatePaymentScreen from '../screens/payments/CreatePaymentScreen';
import MyPaymentHistoryScreen from '../screens/payments/MyPaymentHistoryScreen';
import GymsScreen from '../screens/gyms/GymsScreen';
import CreateGymScreen from '../screens/gyms/CreateGymScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import TrainersScreen from '../screens/trainers/TrainersScreen';
import TrainerDetailScreen from '../screens/trainers/TrainerDetailScreen';
import CreateTrainerScreen from '../screens/trainers/CreateTrainerScreen';

import { RootStackParamList, DrawerParamList, BottomTabParamList } from './types';
import CustomSidebar from '../components/CustomSidebar';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Drawer = createDrawerNavigator<DrawerParamList>();
const BottomTab = createBottomTabNavigator<BottomTabParamList>();

// Drawer Navigator with permission-based menu items
const DrawerNavigator = () => {
  const { user } = useAuth();
  const permissions = getRolePermissions(user?.role || '');

  // Define menu items with their required permissions
  const menuItems = [
    { name: 'Dashboard', component: DashboardScreen, icon: 'view-dashboard', permission: 'canViewDashboard' },
    { name: 'Members', component: MembersScreen, icon: 'account-group', permission: 'canViewMembers' },
    { name: 'Attendance', component: AttendanceScreen, icon: 'check-circle', permission: 'canViewAttendance' },
    { name: 'Payments', component: PaymentsScreen, icon: 'credit-card', permission: 'canViewPayments' },
    { name: 'Memberships', component: MembershipsScreen, icon: 'card-account-details', permission: 'canViewMemberships' },
    { name: 'Trainers', component: TrainersScreen, icon: 'dumbbell', permission: 'canViewTrainers' },
    { name: 'Gyms', component: GymsScreen, icon: 'home-city', permission: 'canViewGyms' },
    { name: 'Profile', component: ProfileScreen, icon: 'account', permission: 'canViewProfile' },
  ];

  // Filter menu items based on permissions
  const allowedMenuItems = menuItems.filter(item => {
    if (!item.permission) return true;
    return permissions[item.permission as keyof typeof permissions] === true;
  });

  // If user can manage users, add Signup screen
  if (permissions.canManageUsers) {
    allowedMenuItems.push({ 
      name: 'Signup', 
      component: SignupScreen, 
      icon: 'account-plus', 
      permission: 'canManageUsers' 
    });
  }

  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomSidebar {...props} />}
      screenOptions={{
        headerStyle: {
          backgroundColor: '#3B82F6',
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        drawerActiveTintColor: '#3B82F6',
        drawerInactiveTintColor: '#64748B',
        drawerLabelStyle: {
          marginLeft: -20,
          fontSize: 15,
        },
      }}
    >
      {allowedMenuItems.map((item) => (
        <Drawer.Screen
          key={item.name}
          name={item.name as keyof DrawerParamList}
          component={item.component}
          options={{
            title: item.name === 'Signup' ? 'Create User' : item.name,
            drawerIcon: ({ focused, color, size }) => (
              <Icon source={item.icon} size={size} color={color} />
            ),
          }}
        />
      ))}
    </Drawer.Navigator>
  );
};

const AppNavigator = () => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return null; // Or show a loading screen
  }

  const renderStackScreen = (name: keyof RootStackParamList, component: any, options: any) => {
    if (canAccessScreen(user?.role || '', name)) {
      return (
        <Stack.Screen
          key={name}
          name={name}
          component={component}
          options={options}
        />
      );
    }
    return null;
  };

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#3B82F6',
          },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        {!isAuthenticated ? (
          <>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Signup"
              component={SignupScreen}
              options={{ headerShown: false }}
            />
          </>
        ) : (
          <>
            <Stack.Screen
              name="Main"
              component={DrawerNavigator}
              options={{ headerShown: false }}
            />
            {renderStackScreen('Signup', SignupScreen, { title: 'Signup' })}
            {renderStackScreen('MemberDetail', MemberDetailScreen, { title: 'Member Details' })}
            {renderStackScreen('CreateMember', CreateMemberScreen, { title: 'Add New Member' })}
            {renderStackScreen('AssignMembership', AssignMembershipScreen, { title: 'Assign Membership' })}
            {renderStackScreen('CreateMembershipPlan', CreateMembershipPlanScreen, { title: 'Create Plan' })}
            {renderStackScreen('Memberships', MembershipsScreen, { title: 'Memberships' })}
            {renderStackScreen('Progress', ProgressScreen, { title: 'Progress' })}
            {renderStackScreen('CreatePayment', CreatePaymentScreen, { title: 'Record Payment' })}
            {renderStackScreen('Gyms', GymsScreen, { title: 'Gyms' })}
            {renderStackScreen('CreateGym', CreateGymScreen, { title: 'Create Gym' })}
            {renderStackScreen('Profile', ProfileScreen, { title: 'Profile' })}
            {renderStackScreen('Trainers', TrainersScreen, { title: 'Trainers' })}
            {renderStackScreen('TrainerDetail', TrainerDetailScreen, { title: 'Trainer Details' })}
            {renderStackScreen('CreateTrainer', CreateTrainerScreen, { title: 'Create Trainer' })}
            {renderStackScreen('MyPaymentHistory', MyPaymentHistoryScreen, { title: 'My Payment History' })}
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;

