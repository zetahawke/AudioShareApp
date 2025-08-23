import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAudio } from '../context/AudioContext';
import { AudioFile } from '../types';
import { Audio } from 'expo-av';
import * as Sharing from 'expo-sharing';
import * as Linking from 'expo-linking';

const HomeScreen: React.FC = () => {
  const { audioFiles, loadAudioFiles, toggleFavorite, incrementPlayCount, incrementShareCount, isLoading } = useAudio();
  const [refreshing, setRefreshing] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  useEffect(() => {
    loadAudioFiles();
  }, []);

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAudioFiles();
    setRefreshing(false);
  };

  const handlePlayAudio = async (audio: AudioFile) => {
    try {
      incrementPlayCount(audio.id);
      
      if (sound) {
        await sound.unloadAsync();
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: audio.url },
        { shouldPlay: true }
      );
      setSound(newSound);
    } catch (error) {
      Alert.alert('Error', 'Failed to play audio');
    }
  };

  const handleShareAudio = async (audio: AudioFile) => {
    try {
      incrementShareCount(audio.id);
      
      // Create WhatsApp share URL
      const message = `Check out this audio: ${audio.title} by ${audio.author}\n\n${audio.description}`;
      const whatsappUrl = `whatsapp://send?text=${encodeURIComponent(message)}`;
      
      // Check if WhatsApp is installed
      const canOpen = await Linking.canOpenURL(whatsappUrl);
      
      if (canOpen) {
        await Linking.openURL(whatsappUrl);
      } else {
        // Fallback to general sharing
        await Sharing.shareAsync(audio.url, {
          mimeType: 'audio/mpeg',
          dialogTitle: `Share ${audio.title}`,
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to share audio');
    }
  };

  const handleToggleFavorite = (audioId: string) => {
    toggleFavorite(audioId);
  };

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const renderAudioItem = ({ item }: { item: AudioFile }) => (
    <View style={styles.audioItem}>
      <View style={styles.audioInfo}>
        <Text style={styles.audioTitle}>{item.title}</Text>
        <Text style={styles.audioAuthor}>by {item.author}</Text>
        <Text style={styles.audioDescription}>{item.description}</Text>
        <View style={styles.audioStats}>
          <Text style={styles.statText}>Duration: {formatDuration(item.duration)}</Text>
          <Text style={styles.statText}>Plays: {item.playCount}</Text>
          <Text style={styles.statText}>Shares: {item.shareCount}</Text>
        </View>
        <View style={styles.tagsContainer}>
          {item.tags.map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      </View>
      
      <View style={styles.audioActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handlePlayAudio(item)}
        >
          <Ionicons name="play" size={24} color="#6200ee" />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleShareAudio(item)}
        >
          <Ionicons name="share-social" size={24} color="#6200ee" />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleToggleFavorite(item.id)}
        >
          <Ionicons
            name={item.isFavorite ? "heart" : "heart-outline"}
            size={24}
            color={item.isFavorite ? "#e91e63" : "#6200ee"}
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (isLoading && audioFiles.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
        <Text style={styles.loadingText}>Loading audio files...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Discover Audio</Text>
        <Text style={styles.headerSubtitle}>Find and share amazing audio content</Text>
      </View>
      
      <FlatList
        data={audioFiles}
        renderItem={renderAudioItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
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
  listContainer: {
    padding: 15,
  },
  audioItem: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  audioInfo: {
    marginBottom: 15,
  },
  audioTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  audioAuthor: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  audioDescription: {
    fontSize: 14,
    color: '#555',
    marginBottom: 10,
    lineHeight: 20,
  },
  audioStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  statText: {
    fontSize: 12,
    color: '#888',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  tag: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 5,
  },
  tagText: {
    fontSize: 12,
    color: '#1976d2',
  },
  audioActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 15,
  },
  actionButton: {
    padding: 10,
    borderRadius: 25,
    backgroundColor: '#f8f9fa',
    minWidth: 50,
    alignItems: 'center',
  },
});

export default HomeScreen;
