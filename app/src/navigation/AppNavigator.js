import React, { useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { Loading } from '../components';

// Navigators
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const { isAuthenticated, loading } = useAuth();
  const [showSplash, setShowSplash] = useState(true);

  if (loading) {
    return <Loading fullScreen message="Initializing..." />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <Stack.Screen name="Main" component={MainNavigator} />
      ) : (
        <Stack.Screen name="Auth">
          {() => (
            <AuthNavigator
              showSplash={showSplash}
              onSplashFinish={() => setShowSplash(false)}
            />
          )}
        </Stack.Screen>
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;
