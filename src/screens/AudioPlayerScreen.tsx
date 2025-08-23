import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../types';
import { useAudio } from '../context/AudioContext';
import { Audio } from 'expo-audio';
import * as Sharing from 'expo-sharing';
import * as Linking from 'expo-linking';

type AudioPlayerScreenRouteProp = RouteProp<RootStackParamList, 'AudioPlayer'>;

const AudioPlayerScreen: React.FC = () => {
  const route = useRoute<AudioPlayerScreenRouteProp>();
  const { audio } = route.params;
  const { toggleFavorite, incrementPlayCount, incrementShareCount } = useAudio();
  
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = async () => {
    try {
      if (sound) {
        if (isPlaying) {
          await sound.pauseAsync();
          setIsPlaying(false);
        } else {
          await sound.playAsync();
          setIsPlaying(true);
        }
      } else {
        // Handle local file paths properly
        let audioUri = audio.url;
        
        // Convert local file paths to proper URIs
        if (audio.url.startsWith('src/')) {
          // For local repository files, we need to use asset module or copy to documents
          audioUri = audio.url; // This will need to be handled differently
        }
        
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: audioUri },
          { shouldPlay: true },
          onPlaybackStatusUpdate
        );
        setSound(newSound);
        setIsPlaying(true);
        incrementPlayCount(audio.id);
      }
    } catch (error) {
      console.error('Audio playback error:', error);
      Alert.alert('Error', 'Failed to play audio. Please check if the file exists and is supported.');
    }
  };

  const onPlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded) {
      setIsPlaying(status.isPlaying);
      setPosition(status.positionMillis / 1000);
      setDuration(status.durationMillis / 1000);
    }
  };

  const handleSeek = async (value: number) => {
    if (sound) {
      await sound.setPositionAsync(value * 1000);
    }
  };

  const handleShare = async () => {
    try {
      incrementShareCount(audio.id);
      
      // Create share message
      const message = `Check out this audio: ${audio.title} by ${audio.author}\n\n${audio.description}\n\nListen now on AudioShare!`;
      
      // For local files, we can't share the file directly, so we share the message
      if (audio.url.startsWith('file://') || audio.url.startsWith('src/')) {
        // Share text message instead of file
        await Sharing.shareAsync(message, {
          mimeType: 'text/plain',
          dialogTitle: `Share ${audio.title}`,
        });
      } else {
        // For remote URLs, try to share the file
        try {
          await Sharing.shareAsync(audio.url, {
            mimeType: 'audio/mpeg',
            dialogTitle: `Share ${audio.title}`,
          });
        } catch (shareError) {
          // If file sharing fails, fallback to text sharing
          await Sharing.shareAsync(message, {
            mimeType: 'text/plain',
            dialogTitle: `Share ${audio.title}`,
          });
        }
      }
    } catch (error) {
      console.error('Share error:', error);
      Alert.alert('Error', 'Failed to share audio. Please try again.');
    }
  };

  const handleToggleFavorite = () => {
    toggleFavorite(audio.id);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.audioInfo}>
          <Text style={styles.audioTitle}>{audio.title}</Text>
          <Text style={styles.audioAuthor}>by {audio.author}</Text>
          <Text style={styles.audioDescription}>{audio.description}</Text>
        </View>
      </View>

      <View style={styles.playerContainer}>
        <View style={styles.controls}>
          <TouchableOpacity style={styles.controlButton} onPress={handlePlayPause}>
            <Ionicons
              name={isPlaying ? "pause" : "play"}
              size={40}
              color="#6200ee"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.progressContainer}>
          <Text style={styles.timeText}>{formatTime(position)}</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${(position / duration) * 100}%` }]} />
          </View>
          <Text style={styles.timeText}>{formatTime(duration)}</Text>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton} onPress={handleToggleFavorite}>
            <Ionicons
              name={audio.isFavorite ? "heart" : "heart-outline"}
              size={24}
              color={audio.isFavorite ? "#e91e63" : "#6200ee"}
            />
            <Text style={styles.actionButtonText}>
              {audio.isFavorite ? "Favorited" : "Favorite"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
            <Ionicons name="share-social" size={24} color="#6200ee" />
            <Text style={styles.actionButtonText}>Share</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.detailsContainer}>
        <View style={styles.detailSection}>
          <Text style={styles.sectionTitle}>Audio Details</Text>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Duration:</Text>
            <Text style={styles.detailValue}>{formatTime(audio.duration)}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Category:</Text>
            <Text style={styles.detailValue}>{audio.category}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Plays:</Text>
            <Text style={styles.detailValue}>{audio.playCount}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Shares:</Text>
            <Text style={styles.detailValue}>{audio.shareCount}</Text>
          </View>
        </View>

        <View style={styles.detailSection}>
          <Text style={styles.sectionTitle}>Tags</Text>
          <View style={styles.tagsContainer}>
            {audio.tags.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
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
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  audioInfo: {
    alignItems: 'center',
  },
  audioTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  audioAuthor: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  audioDescription: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    lineHeight: 20,
  },
  playerContainer: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 20,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  controls: {
    alignItems: 'center',
    marginBottom: 30,
  },
  controlButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  timeText: {
    fontSize: 14,
    color: '#666',
    width: 50,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    marginHorizontal: 15,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6200ee',
    borderRadius: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  detailsContainer: {
    padding: 20,
  },
  detailSection: {
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
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  tag: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  tagText: {
    fontSize: 12,
    color: '#1976d2',
  },
});

export default AudioPlayerScreen;
