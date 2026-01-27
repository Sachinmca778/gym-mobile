import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Icon } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import SignupScreen from '../screens/auth/SignupScreen';

// Main Screens
import DashboardScreen from '../screens/dashboard/DashboardScreen';
import MembersScreen from '../screens/members/MembersScreen';
import MemberDetailScreen from '../screens/members/MemberDetailScreen';
import AttendanceScreen from '../screens/attendance/AttendanceScreen';
import MembershipsScreen from '../screens/memberships/MembershipsScreen';
import ProgressScreen from '../screens/progress/ProgressScreen';
import PaymentsScreen from '../screens/payments/PaymentsScreen';
import TrainersScreen from '../screens/trainers/TrainersScreen';

import { RootStackParamList, BottomTabParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<BottomTabParamList>();

const TabNavigator = () => {
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
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen}
        options={{ title: 'Dashboard' }}
      />
      <Tab.Screen 
        name="Members" 
        component={MembersScreen}
        options={{ title: 'Members' }}
      />
      <Tab.Screen 
        name="Attendance" 
        component={AttendanceScreen}
        options={{ title: 'Attendance' }}
      />
      <Tab.Screen 
        name="Payments" 
        component={PaymentsScreen}
        options={{ title: 'Payments' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={TrainersScreen}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null; // Or show a loading screen
  }

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
            <Stack.Screen 
              name="MemberDetail" 
              component={MemberDetailScreen}
              options={{ title: 'Member Details' }}
            />
            <Stack.Screen 
              name="Memberships" 
              component={MembershipsScreen}
              options={{ title: 'Memberships' }}
            />
            <Stack.Screen 
              name="Progress" 
              component={ProgressScreen}
              options={{ title: 'Progress' }}
            />
            <Stack.Screen 
              name="Trainers" 
              component={TrainersScreen}
              options={{ title: 'Trainers' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;

