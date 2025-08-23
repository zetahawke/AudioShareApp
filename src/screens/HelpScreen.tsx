import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const HelpScreen: React.FC = () => {
  const helpSections = [
    {
      title: 'Getting Started',
      items: [
        {
          question: 'How do I create an account?',
          answer: 'Tap the "Register" button on the login screen and fill in your details to create a new account.',
        },
        {
          question: 'How do I find audio files?',
          answer: 'Audio files are displayed on the Home screen. You can browse through them and use the search function to find specific content.',
        },
        {
          question: 'How do I play audio?',
          answer: 'Tap the play button on any audio file to start playback. The audio will play through your device speakers or headphones.',
        },
      ],
    },
    {
      title: 'Audio Features',
      items: [
        {
          question: 'How do I add audio to favorites?',
          answer: 'Tap the heart icon on any audio file to add it to your favorites. You can view all your favorite audio files in the Favorites tab.',
        },
        {
          question: 'How do I share audio via WhatsApp?',
          answer: 'Tap the share button on any audio file. If WhatsApp is installed, it will open directly. Otherwise, you can use the general sharing options.',
        },
        {
          question: 'Can I download audio files?',
          answer: 'Currently, audio files are streamed only. Download functionality will be available in future updates.',
        },
      ],
    },
    {
      title: 'Account & Settings',
      items: [
        {
          question: 'How do I change my password?',
          answer: 'Go to Settings > Account > Change Password to update your password.',
        },
        {
          question: 'How do I update my profile?',
          answer: 'Navigate to Profile tab and tap on the edit button to modify your information.',
        },
        {
          question: 'How do I logout?',
          answer: 'Go to the Profile tab and tap the logout button at the bottom of the screen.',
        },
      ],
    },
    {
      title: 'Troubleshooting',
      items: [
        {
          question: 'Audio is not playing',
          answer: 'Check your device volume, ensure you have a stable internet connection, and try restarting the app.',
        },
        {
          question: 'App is crashing',
          answer: 'Try closing the app completely and reopening it. If the issue persists, restart your device.',
        },
        {
          question: 'Can\'t share to WhatsApp',
          answer: 'Make sure WhatsApp is installed on your device. If not, you can use the general sharing options.',
        },
      ],
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <Text style={styles.headerSubtitle}>Find answers to common questions</Text>
      </View>

      {helpSections.map((section, sectionIndex) => (
        <View key={sectionIndex} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <View style={styles.sectionContainer}>
            {section.items.map((item, itemIndex) => (
              <View key={itemIndex} style={styles.helpItem}>
                <View style={styles.questionContainer}>
                  <Ionicons name="help-circle-outline" size={20} color="#6200ee" />
                  <Text style={styles.question}>{item.question}</Text>
                </View>
                <Text style={styles.answer}>{item.answer}</Text>
              </View>
            ))}
          </View>
        </View>
      ))}

      <View style={styles.contactSection}>
        <Text style={styles.contactTitle}>Still need help?</Text>
        <Text style={styles.contactSubtitle}>
          If you couldn't find the answer you're looking for, please contact our support team.
        </Text>
        <TouchableOpacity style={styles.contactButton}>
          <Ionicons name="mail-outline" size={20} color="#fff" />
          <Text style={styles.contactButtonText}>Contact Support</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>AudioShare Support</Text>
        <Text style={styles.footerSubtext}>We're here to help you enjoy the best audio experience</Text>
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
  helpItem: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  questionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  question: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 10,
    flex: 1,
  },
  answer: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginLeft: 30,
  },
  contactSection: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  contactSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6200ee',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  contactButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  footer: {
    alignItems: 'center',
    padding: 30,
    marginTop: 20,
  },
  footerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  footerSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default HelpScreen;
