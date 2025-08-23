import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import * as FileSystem from 'expo-file-system';

const SettingsScreen: React.FC = () => {
  const { logout, user } = useAuth();
  const [crashLogs, setCrashLogs] = useState<string>('');
  // Get app version from package.json safely
  const [appVersion, setAppVersion] = useState<string>('1.0.0');
  
  useEffect(() => {
    try {
      // Try to get version from package.json, fallback to default
      const packageInfo = require('../../package.json');
      setAppVersion(packageInfo.version || '1.0.0');
    } catch (error) {
      console.log('Could not load package.json, using default version');
      setAppVersion('1.0.0');
    }
  }, []);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', onPress: logout },
      ]
    );
  };

  const viewCrashLogs = async () => {
    try {
      if (!FileSystem.documentDirectory) {
        setCrashLogs('Document directory not available');
        return;
      }
      
      const logPath = `${FileSystem.documentDirectory}error_log.txt`;
      console.log('Attempting to read from:', logPath);
      
      // Check if file exists first
      const fileInfo = await FileSystem.getInfoAsync(logPath);
      console.log('File info:', fileInfo);
      
      if (!fileInfo.exists) {
        setCrashLogs('No crash logs found');
        return;
      }
      
      const logs = await FileSystem.readAsStringAsync(logPath);
      setCrashLogs(logs || 'No crash logs found');
    } catch (error) {
      console.error('Error reading crash logs:', error);
      setCrashLogs(`Error reading crash logs: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const clearCrashLogs = async () => {
    try {
      if (!FileSystem.documentDirectory) {
        Alert.alert('Error', 'Document directory not available');
        return;
      }
      
      const logPath = `${FileSystem.documentDirectory}error_log.txt`;
      
      // Check if file exists first
      const fileInfo = await FileSystem.getInfoAsync(logPath);
      if (!fileInfo.exists) {
        setCrashLogs('No crash logs to clear');
        return;
      }
      
      await FileSystem.deleteAsync(logPath);
      setCrashLogs('Crash logs cleared');
    } catch (error) {
      console.error('Error clearing crash logs:', error);
      Alert.alert('Error', `Failed to clear crash logs: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const testErrorBoundary = () => {
    // This will trigger the ErrorBoundary
    throw new Error('Test error to trigger ErrorBoundary');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Email</Text>
          <Text style={styles.settingValue}>{user?.email}</Text>
        </View>
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Username</Text>
          <Text style={styles.settingValue}>{user?.username}</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Debug & Development</Text>
        
        <TouchableOpacity style={styles.debugButton} onPress={viewCrashLogs}>
          <Text style={styles.debugButtonText}>View Crash Logs</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.debugButton} onPress={clearCrashLogs}>
          <Text style={styles.debugButtonText}>Clear Crash Logs</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.debugButton} onPress={testErrorBoundary}>
          <Text style={styles.debugButtonText}>Test Error Boundary</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.debugButton} onPress={() => {
          const dir = FileSystem.documentDirectory;
          const cacheDir = FileSystem.cacheDirectory;
          console.log('Document directory:', dir);
          console.log('Cache directory:', cacheDir);
          setCrashLogs(`Document dir: ${dir}\nCache dir: ${cacheDir}`);
        }}>
          <Text style={styles.debugButtonText}>Check FileSystem Paths</Text>
        </TouchableOpacity>

        {crashLogs ? (
          <View style={styles.logsContainer}>
            <Text style={styles.logsTitle}>Crash Logs:</Text>
            <Text style={styles.logsText}>{crashLogs}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App Information</Text>
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Builder</Text>
          <Text style={styles.settingValue}>Expo Go</Text>
        </View>
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Version</Text>
          <Text style={styles.settingValue}>{appVersion}</Text>
        </View>
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Developer</Text>
          <Text style={styles.settingValue}>{"Michel Szinavel"}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>System Information</Text>
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Platform</Text>
          <Text style={styles.settingValue}>{Platform.OS}</Text>
        </View>
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Version</Text>
          <Text style={styles.settingValue}>{Platform.Version}</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  section: {
    backgroundColor: '#fff',
    marginVertical: 10,
    padding: 20,
    borderRadius: 10,
    marginHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingLabel: {
    fontSize: 16,
    color: '#666',
  },
  settingValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  logoutButton: {
    backgroundColor: '#ff6b6b',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  debugButton: {
    backgroundColor: '#6200ee',
    padding: 12,
    borderRadius: 6,
    marginVertical: 5,
    alignItems: 'center',
  },
  debugButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  logsContainer: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginTop: 15,
  },
  logsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  logsText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#666',
  },
});

export default SettingsScreen;
