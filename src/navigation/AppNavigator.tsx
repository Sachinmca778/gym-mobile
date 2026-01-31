import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Icon } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { canAccessScreen } from '../utils/permissions';

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

import { RootStackParamList, BottomTabParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<BottomTabParamList>();

const TabNavigator = () => {
  const { user } = useAuth();

  const renderTabScreen = (name: string, component: any, options: any) => {
    if (canAccessScreen(user?.role || '', name)) {
      return (
        <Tab.Screen
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
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string = '';

          switch (route.name) {
            case 'Dashboard':
              iconName = focused ? 'view-dashboard' : 'view-dashboard-outline';
              break;
            case 'Members':
              iconName = focused ? 'account-group' : 'account-group-outline';
              break;
            case 'Attendance':
              iconName = focused ? 'check-circle' : 'check-circle-outline';
              break;
            case 'Payments':
              iconName = focused ? 'credit-card' : 'credit-card-outline';
              break;
            case 'Profile':
              iconName = focused ? 'account' : 'account-outline';
              break;
          }

          return <Icon source={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#3B82F6',
        tabBarInactiveTintColor: '#64748B',
        headerStyle: {
          backgroundColor: '#3B82F6',
        },
        headerTintColor: '#FFFFFF',
      })}
    >
      {renderTabScreen('Dashboard', DashboardScreen, { title: 'Dashboard' })}
      {renderTabScreen('Members', MembersScreen, { title: 'Members' })}
      {renderTabScreen('Attendance', AttendanceScreen, { title: 'Attendance' })}
      {renderTabScreen('Payments', PaymentsScreen, { title: 'Payments' })}
      {renderTabScreen('Profile', ProfileScreen, { title: 'Profile' })}
    </Tab.Navigator>
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
              component={TabNavigator}
              options={{ headerShown: false }}
            />
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

