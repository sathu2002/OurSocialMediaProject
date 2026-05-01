import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text, View, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { colors, typography } from '../styles/theme';

// Main Tab Screens
import HomeScreen from '../screens/main/HomeScreen';
import UsersScreen from '../screens/main/UsersScreen';
import ClientsScreen from '../screens/main/ClientsScreen';
import TasksScreen from '../screens/main/TasksScreen';
import AnalyticsScreen from '../screens/main/AnalyticsScreen';
import PaymentsScreen from '../screens/main/PaymentsScreen';
import FeedbackScreen from '../screens/main/FeedbackScreen';
import AIChatScreen from '../screens/main/AIChatScreen';
import AIInsightsScreen from '../screens/main/AIInsightsScreen';
import ProfileScreen from '../screens/main/ProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Simple icon component
const TabIcon = ({ label, focused }) => (
  <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
    <Text style={[styles.iconText, focused && styles.iconTextActive]}>
      {label.charAt(0)}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.gray700,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainerActive: {
    backgroundColor: colors.primary,
  },
  iconText: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.bold,
    color: colors.gray400,
  },
  iconTextActive: {
    color: colors.white,
  },
  tabBarLabel: {
    fontSize: typography.fontSizes.xs,
    color: colors.gray400,
  },
  tabBarLabelActive: {
    color: colors.primary,
  },
});

// Tab Navigator based on user role
const MainTabNavigator = () => {
  const { user, hasRole } = useAuth();

  const getTabBarLabel = (label, focused) => (
    <Text style={[styles.tabBarLabel, focused && styles.tabBarLabelActive]}>
      {label}
    </Text>
  );

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.navy,
          borderTopWidth: 0,
          paddingBottom: 8,
          paddingTop: 8,
          height: 70,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.gray400,
      }}
    >
      {/* Home - Available to all roles */}
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="H" focused={focused} />,
          tabBarLabel: ({ focused }) => getTabBarLabel('Home', focused),
        }}
      />

      {/* Users - Admin only */}
      {hasRole(['Admin']) && (
        <Tab.Screen
          name="Users"
          component={UsersScreen}
          options={{
            tabBarIcon: ({ focused }) => <TabIcon label="U" focused={focused} />,
            tabBarLabel: ({ focused }) => getTabBarLabel('Users', focused),
          }}
        />
      )}

      {/* Clients - Admin, Manager */}
      {hasRole(['Admin', 'Manager']) && (
        <Tab.Screen
          name="Clients"
          component={ClientsScreen}
          options={{
            tabBarIcon: ({ focused }) => <TabIcon label="C" focused={focused} />,
            tabBarLabel: ({ focused }) => getTabBarLabel('Clients', focused),
          }}
        />
      )}

      {/* Tasks - All roles */}
      <Tab.Screen
        name="Tasks"
        component={TasksScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="T" focused={focused} />,
          tabBarLabel: ({ focused }) => getTabBarLabel('Tasks', focused),
        }}
      />

      {/* Analytics - Admin, Manager */}
      {hasRole(['Admin', 'Manager']) && (
        <Tab.Screen
          name="Analytics"
          component={AnalyticsScreen}
          options={{
            tabBarIcon: ({ focused }) => <TabIcon label="A" focused={focused} />,
            tabBarLabel: ({ focused }) => getTabBarLabel('Analytics', focused),
          }}
        />
      )}

      {/* Payments - Admin, Manager */}
      {hasRole(['Admin', 'Manager']) && (
        <Tab.Screen
          name="Payments"
          component={PaymentsScreen}
          options={{
            tabBarIcon: ({ focused }) => <TabIcon label="P" focused={focused} />,
            tabBarLabel: ({ focused }) => getTabBarLabel('Payments', focused),
          }}
        />
      )}

      {/* Feedback - Admin, Manager, Client */}
      {hasRole(['Admin', 'Manager', 'Client']) && (
        <Tab.Screen
          name="Feedback"
          component={FeedbackScreen}
          options={{
            tabBarIcon: ({ focused }) => <TabIcon label="F" focused={focused} />,
            tabBarLabel: ({ focused }) => getTabBarLabel('Feedback', focused),
          }}
        />
      )}

      {/* AI Insights - Admin, Manager */}
      {hasRole(['Admin', 'Manager']) && (
        <Tab.Screen
          name="AI Insights"
          component={AIInsightsScreen}
          options={{
            tabBarIcon: ({ focused }) => <TabIcon label="AI" focused={focused} />,
            tabBarLabel: ({ focused }) => getTabBarLabel('Insights', focused),
          }}
        />
      )}

      {/* Profile - Available to all */}
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="Me" focused={focused} />,
          tabBarLabel: ({ focused }) => getTabBarLabel('Profile', focused),
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
