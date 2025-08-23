import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const AboutScreen: React.FC = () => {
  const handleOpenLink = (url: string) => {
    Linking.openURL(url);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>🎵</Text>
          <Text style={styles.appName}>AudioShare</Text>
          <Text style={styles.version}>Version 1.0.0</Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About AudioShare</Text>
          <Text style={styles.description}>
            AudioShare is a mobile application designed to help you discover, play, and share amazing audio content. 
            Whether you're looking for motivation, relaxation, or productivity tips, we've got you covered.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Features</Text>
          <View style={styles.featureList}>
            <View style={styles.featureItem}>
              <Ionicons name="play-circle-outline" size={20} color="#6200ee" />
              <Text style={styles.featureText}>Stream high-quality audio content</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="heart-outline" size={20} color="#6200ee" />
              <Text style={styles.featureText}>Create personalized favorites lists</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="share-social-outline" size={20} color="#6200ee" />
              <Text style={styles.featureText}>Share audio via WhatsApp and other platforms</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="stats-chart-outline" size={20} color="#6200ee" />
              <Text style={styles.featureText}>Track play and share statistics</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact & Support</Text>
          <TouchableOpacity 
            style={styles.contactItem}
            onPress={() => handleOpenLink('mailto:support@audioshare.com')}
          >
            <Ionicons name="mail-outline" size={20} color="#6200ee" />
            <Text style={styles.contactText}>support@audioshare.com</Text>
            <Ionicons name="open-outline" size={16} color="#ccc" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.contactItem}
            onPress={() => handleOpenLink('https://audioshare.com')}
          >
            <Ionicons name="globe-outline" size={20} color="#6200ee" />
            <Text style={styles.contactText}>www.audioshare.com</Text>
            <Ionicons name="open-outline" size={16} color="#ccc" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Legal</Text>
          <Text style={styles.legalText}>
            AudioShare respects your privacy and is committed to protecting your personal information. 
            Our app complies with all applicable data protection regulations.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Acknowledgments</Text>
          <Text style={styles.acknowledgmentText}>
            Built with React Native and Expo. Special thanks to all the contributors and the open-source community.
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>© 2024 AudioShare. All rights reserved.</Text>
        <Text style={styles.footerSubtext}>Made with ❤️ for audio enthusiasts worldwide</Text>
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
    alignItems: 'center',
    padding: 40,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logo: {
    fontSize: 80,
    marginBottom: 15,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#6200ee',
    marginBottom: 5,
  },
  version: {
    fontSize: 16,
    color: '#666',
  },
  content: {
    padding: 20,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
  featureList: {
    gap: 15,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 15,
    flex: 1,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  contactText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 15,
    flex: 1,
  },
  legalText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
  acknowledgmentText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
  footer: {
    alignItems: 'center',
    padding: 30,
    marginTop: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  footerSubtext: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
  },
});

export default AboutScreen;
