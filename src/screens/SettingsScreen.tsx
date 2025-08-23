import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../types';

const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [notifications, setNotifications] = useState(true);
  const [autoPlay, setAutoPlay] = useState(false);
  const [highQuality, setHighQuality] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const navigateToScreen = (screenName: keyof RootStackParamList) => {
    navigation.navigate(screenName as any);
  };

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'This will clear all cached audio files. Are you sure?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Success', 'Cache cleared successfully');
          },
        },
      ]
    );
  };

  const handleResetSettings = () => {
    Alert.alert(
      'Reset Settings',
      'This will reset all settings to default. Are you sure?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            setNotifications(true);
            setAutoPlay(false);
            setHighQuality(true);
            setDarkMode(false);
            Alert.alert('Success', 'Settings reset to default');
          },
        },
      ]
    );
  };

  const settingsSections = [
    {
      title: 'Audio Settings',
      items: [
        {
          title: 'Auto-play audio',
          subtitle: 'Automatically play audio when selected',
          type: 'switch',
          value: autoPlay,
          onValueChange: setAutoPlay,
        },
        {
          title: 'High quality audio',
          subtitle: 'Use high quality audio (uses more data)',
          type: 'switch',
          value: highQuality,
          onValueChange: setHighQuality,
        },
      ],
    },
    {
      title: 'App Settings',
      items: [
        {
          title: 'Push notifications',
          subtitle: 'Receive notifications about new audio',
          type: 'switch',
          value: notifications,
          onValueChange: setNotifications,
        },
        {
          title: 'Dark mode',
          subtitle: 'Use dark theme (coming soon)',
          type: 'switch',
          value: darkMode,
          onValueChange: setDarkMode,
          disabled: true,
        },
      ],
    },
    {
      title: 'Data & Storage',
      items: [
        {
          title: 'Clear cache',
          subtitle: 'Free up storage space',
          type: 'button',
          onPress: handleClearCache,
        },
        {
          title: 'Download quality',
          subtitle: 'Choose audio download quality',
          type: 'navigation',
          onPress: () => Alert.alert('Info', 'Download quality settings coming soon'),
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          title: 'Help & Support',
          subtitle: 'Get help with the app',
          type: 'navigation',
          onPress: () => navigateToScreen('Help'),
        },
        {
          title: 'Contact Us',
          subtitle: 'Get in touch with our team',
          type: 'navigation',
          onPress: () => navigateToScreen('ContactUs'),
        },
        {
          title: 'Send Feedback',
          subtitle: 'Help us improve the app',
          type: 'navigation',
          onPress: () => navigateToScreen('Feedback'),
        },
      ],
    },
    {
      title: 'Legal',
      items: [
        {
          title: 'Privacy Policy',
          subtitle: 'Read our privacy policy',
          type: 'navigation',
          onPress: () => navigateToScreen('PrivacyPolicy'),
        },
        {
          title: 'Terms of Service',
          subtitle: 'Read our terms of service',
          type: 'navigation',
          onPress: () => navigateToScreen('TermsOfService'),
        },
      ],
    },
  ];

  const renderSettingItem = (item: any, index: number) => {
    switch (item.type) {
      case 'switch':
        return (
          <View key={index} style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>{item.title}</Text>
              <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
            </View>
            <Switch
              value={item.value}
              onValueChange={item.onValueChange}
              trackColor={{ false: '#e0e0e0', true: '#6200ee' }}
              thumbColor={item.disabled ? '#ccc' : '#fff'}
              disabled={item.disabled}
            />
          </View>
        );
      case 'button':
        return (
          <TouchableOpacity key={index} style={styles.settingItem} onPress={item.onPress}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>{item.title}</Text>
              <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>
        );
      case 'navigation':
        return (
          <TouchableOpacity key={index} style={styles.settingItem} onPress={item.onPress}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>{item.title}</Text>
              <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>
        );
      default:
        return null;
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
        <Text style={styles.headerSubtitle}>Customize your app experience</Text>
      </View>

      {settingsSections.map((section, sectionIndex) => (
        <View key={sectionIndex} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <View style={styles.sectionContainer}>
            {section.items.map((item, itemIndex) => renderSettingItem(item, itemIndex))}
          </View>
        </View>
      ))}

      <TouchableOpacity style={styles.resetButton} onPress={handleResetSettings}>
        <Ionicons name="refresh-outline" size={24} color="#e74c3c" />
        <Text style={styles.resetButtonText}>Reset All Settings</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>AudioShare v1.0.0</Text>
        <Text style={styles.footerSubtext}>Made with ❤️ for audio lovers</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
    marginLeft: 20,
  },
  sectionContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 15,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingInfo: {
    flex: 1,
    marginRight: 15,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 3,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    marginTop: 20,
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#e74c3c',
  },
  resetButtonText: {
    fontSize: 16,
    color: '#e74c3c',
    fontWeight: '600',
    marginLeft: 10,
  },
  footer: {
    alignItems: 'center',
    padding: 30,
    marginTop: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#888',
    marginBottom: 5,
  },
  footerSubtext: {
    fontSize: 12,
    color: '#aaa',
  },
});

export default SettingsScreen;
