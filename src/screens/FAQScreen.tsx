import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface FAQItem {
  question: string;
  answer: string;
}

const FAQScreen: React.FC = () => {
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  const faqData: FAQItem[] = [
    {
      question: 'How do I create an account?',
      answer: 'To create an account, tap the "Register" button on the login screen and fill in your details including name, email, username, and password. Make sure your password is at least 6 characters long.',
    },
    {
      question: 'How do I play audio files?',
      answer: 'Simply tap the play button on any audio file to start playback. The audio will play through your device speakers or headphones. You can also control playback using the audio controls.',
    },
    {
      question: 'How do I add audio to my favorites?',
      answer: 'Tap the heart icon on any audio file to add it to your favorites. The heart will turn red when the audio is in your favorites. You can view all your favorite audio files in the Favorites tab.',
    },
    {
      question: 'Can I share audio files via WhatsApp?',
      answer: 'Yes! Tap the share button on any audio file. If WhatsApp is installed on your device, it will open directly. If not, you can use the general sharing options available on your device.',
    },
    {
      question: 'How do I change my password?',
      answer: 'Go to the Settings tab, then navigate to Account settings. You\'ll find an option to change your password there. You\'ll need to enter your current password and then create a new one.',
    },
    {
      question: 'What audio formats are supported?',
      answer: 'AudioShare supports most common audio formats including MP3, WAV, AAC, and M4A. The app will automatically detect and play supported formats.',
    },
    {
      question: 'How do I report a problem?',
      answer: 'You can report problems by going to the Profile tab and selecting "Feedback". Choose "Bug Report" as the feedback type and describe the issue you\'re experiencing.',
    },
    {
      question: 'Can I download audio files for offline listening?',
      answer: 'Currently, audio files are streamed only. Download functionality will be available in future updates. Make sure you have a stable internet connection for the best listening experience.',
    },
    {
      question: 'How do I logout of my account?',
      answer: 'Go to the Profile tab and scroll down to find the logout button. Tap it and confirm that you want to logout. You\'ll be returned to the login screen.',
    },
    {
      question: 'Is my data secure?',
      answer: 'Yes, we take data security seriously. Your personal information is encrypted and stored securely. We never share your data with third parties without your consent.',
    },
  ];

  const toggleItem = (index: number) => {
    const newExpandedItems = new Set(expandedItems);
    if (newExpandedItems.has(index)) {
      newExpandedItems.delete(index);
    } else {
      newExpandedItems.add(index);
    }
    setExpandedItems(newExpandedItems);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Frequently Asked Questions</Text>
        <Text style={styles.headerSubtitle}>Find quick answers to common questions</Text>
      </View>

      <View style={styles.content}>
        {faqData.map((item, index) => (
          <View key={index} style={styles.faqItem}>
            <TouchableOpacity
              style={styles.questionContainer}
              onPress={() => toggleItem(index)}
              activeOpacity={0.7}
            >
              <Text style={styles.question}>{item.question}</Text>
              <Ionicons
                name={expandedItems.has(index) ? "chevron-up" : "chevron-down"}
                size={20}
                color="#6200ee"
              />
            </TouchableOpacity>
            
            {expandedItems.has(index) && (
              <View style={styles.answerContainer}>
                <Text style={styles.answer}>{item.answer}</Text>
              </View>
            )}
          </View>
        ))}
      </View>

      <View style={styles.contactSection}>
        <Text style={styles.contactTitle}>Still have questions?</Text>
        <Text style={styles.contactSubtitle}>
          If you couldn't find the answer you're looking for, please contact our support team.
        </Text>
        <TouchableOpacity style={styles.contactButton}>
          <Ionicons name="mail-outline" size={20} color="#fff" />
          <Text style={styles.contactButtonText}>Contact Support</Text>
        </TouchableOpacity>
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
  content: {
    padding: 20,
  },
  faqItem: {
    backgroundColor: '#fff',
    borderRadius: 15,
    marginBottom: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  questionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  question: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 15,
  },
  answerContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  answer: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
    marginTop: 15,
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
});

export default FAQScreen;
