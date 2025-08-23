import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { Platform, LogBox } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { enableScreens } from 'react-native-screens';
import { AuthProvider } from './src/context/AuthContext';
import { AudioProvider } from './src/context/AudioContext';
import AppNavigator from './src/navigation/AppNavigator';
import ErrorBoundary from './src/components/ErrorBoundary';

// Enable screens for better performance
enableScreens();

// Import polyfills for React Navigation v7 on web
if (Platform.OS === 'web') {
  require('react-native-gesture-handler');
  require('react-native-reanimated');
}

// Ignore specific warnings that might cause issues
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
  'AsyncStorage has been extracted from react-native',
]);

export default function App() {
  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <AuthProvider>
            <AudioProvider>
              <StatusBar style="auto" />
              <AppNavigator />
            </AudioProvider>
          </AuthProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
