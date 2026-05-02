import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { colors } from '../styles/theme';

import DashboardScreen from '../screens/main/DashboardScreen';
import UsersScreen from '../screens/main/UsersScreen';
import ClientsScreen from '../screens/main/ClientsScreen';
import TasksScreen from '../screens/main/TasksScreen';
import TaskCalendarScreen from '../screens/main/TaskCalendarScreen';
import PackageManagementScreen from '../screens/main/PackageManagementScreen';
import FeedbackHistoryScreen from '../screens/main/FeedbackHistoryScreen';
import PaymentsScreen from '../screens/main/PaymentsScreen';
import AnalyticsScreen from '../screens/main/AnalyticsScreen';
import AIInsightsScreen from '../screens/main/AIInsightsScreen';
import ProfileScreen from '../screens/main/ProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const iconMap = {
  Dashboard: { outline: 'grid-outline', filled: 'grid' },
  Users: { outline: 'people-outline', filled: 'people' },
  Clients: { outline: 'briefcase-outline', filled: 'briefcase' },
  Packages: { outline: 'cube-outline', filled: 'cube' },
  Tasks: { outline: 'checkmark-done-outline', filled: 'checkmark-done' },
  TaskCalendar: { outline: 'calendar-outline', filled: 'calendar' },
  Analytics: { outline: 'bar-chart-outline', filled: 'bar-chart' },
  Payments: { outline: 'card-outline', filled: 'card' },
  Feedback: { outline: 'chatbubbles-outline', filled: 'chatbubbles' },
  'AI Insights': { outline: 'sparkles-outline', filled: 'sparkles' },
  Profile: { outline: 'person-outline', filled: 'person' },
};

const TabIcon = ({ routeName, focused, color }) => {
  const icon = iconMap[routeName];

  return (
    <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
      <Ionicons
        name={focused ? icon.filled : icon.outline}
        size={18}
        color={color}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainerActive: {
    backgroundColor: 'rgba(59, 130, 246, 0.14)',
  },
});

const MainTabNavigator = () => {
  const { hasRole } = useAuth();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          backgroundColor: colors.navy,
          borderTopWidth: 1,
          borderTopColor: 'rgba(148, 163, 184, 0.14)',
          paddingBottom: 8,
          paddingTop: 8,
          height: 64,
        },
        tabBarShowLabel: false,
        tabBarItemStyle: {
          paddingHorizontal: 0,
        },
        tabBarActiveTintColor: colors.primaryLight,
        tabBarInactiveTintColor: colors.gray400,
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon routeName="Dashboard" focused={focused} color={color} />
          ),
        }}
      />

      {hasRole(['Admin']) && (
        <Tab.Screen
          name="Users"
          component={UsersScreen}
          options={{
            tabBarIcon: ({ focused, color }) => (
              <TabIcon routeName="Users" focused={focused} color={color} />
            ),
          }}
        />
      )}

      {hasRole(['Admin', 'Manager']) && (
        <Tab.Screen
          name="Clients"
          component={ClientsScreen}
          options={{
            tabBarIcon: ({ focused, color }) => (
              <TabIcon routeName="Clients" focused={focused} color={color} />
            ),
          }}
        />
      )}

      {hasRole(['Admin', 'Manager']) && (
        <Tab.Screen
          name="Packages"
          component={PackageManagementScreen}
          options={{
            tabBarIcon: ({ focused, color }) => (
              <TabIcon routeName="Packages" focused={focused} color={color} />
            ),
          }}
        />
      )}

      <Tab.Screen
        name="Tasks"
        component={TasksScreen}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon routeName="Tasks" focused={focused} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="TaskCalendar"
        component={TaskCalendarScreen}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon routeName="TaskCalendar" focused={focused} color={color} />
          ),
        }}
      />

      {hasRole(['Admin', 'Manager']) && (
        <Tab.Screen
          name="Analytics"
          component={AnalyticsScreen}
          options={{
            tabBarIcon: ({ focused, color }) => (
              <TabIcon routeName="Analytics" focused={focused} color={color} />
            ),
          }}
        />
      )}

      {hasRole(['Admin', 'Manager']) && (
        <Tab.Screen
          name="Payments"
          component={PaymentsScreen}
          options={{
            tabBarIcon: ({ focused, color }) => (
              <TabIcon routeName="Payments" focused={focused} color={color} />
            ),
          }}
        />
      )}

      {hasRole(['Admin', 'Manager', 'Staff', 'Client']) && (
        <Tab.Screen
          name="Feedback"
          component={FeedbackHistoryScreen}
          options={{
            tabBarIcon: ({ focused, color }) => (
              <TabIcon routeName="Feedback" focused={focused} color={color} />
            ),
          }}
        />
      )}

      {hasRole(['Admin', 'Manager']) && (
        <Tab.Screen
          name="AI Insights"
          component={AIInsightsScreen}
          options={{
            tabBarIcon: ({ focused, color }) => (
              <TabIcon routeName="AI Insights" focused={focused} color={color} />
            ),
          }}
        />
      )}

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon routeName="Profile" focused={focused} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const MainNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabNavigator} />
    </Stack.Navigator>
  );
};

export default MainNavigator;
