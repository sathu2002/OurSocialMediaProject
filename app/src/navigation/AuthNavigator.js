import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Screens
import SplashScreen from '../screens/auth/SplashScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

const Stack = createNativeStackNavigator();

const AuthNavigator = ({ showSplash, onSplashFinish }) => {
  return (
    <Stack.Navigator
      initialRouteName={showSplash ? 'Splash' : 'Login'}
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#0a1628' },
      }}
    >
      {showSplash && (
        <Stack.Screen name="Splash">
          {() => <SplashScreen onFinish={onSplashFinish} />}
        </Stack.Screen>
      )}
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
};

export default AuthNavigator;
