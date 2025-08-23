import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/context/AuthContext';
import { AudioProvider } from './src/context/AudioContext';
import AppNavigator from './src/navigation/AppNavigator';
export default function App() {
    return (<AuthProvider>
      <AudioProvider>
        <StatusBar style="auto"/>
        <AppNavigator />
      </AudioProvider>
    </AuthProvider>);
}
