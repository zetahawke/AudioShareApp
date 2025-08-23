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
import { useAudioPlayer, useAudioPlayerStatus, setAudioModeAsync } from 'expo-audio';
import * as Sharing from 'expo-sharing';
import * as Linking from 'expo-linking';
import * as FileSystem from 'expo-file-system';

type AudioPlayerScreenRouteProp = RouteProp<RootStackParamList, 'AudioPlayer'>;

const AudioPlayerScreen: React.FC = () => {
  const route = useRoute<AudioPlayerScreenRouteProp>();
  const { audio } = route.params;
  const { toggleFavorite, incrementPlayCount, incrementShareCount } = useAudio();
  
  const player = useAudioPlayer(audio.url);
  const status = useAudioPlayerStatus(player);
  
  // Use status from the hook instead of local state
  const isPlaying = status.playing || false;
  const position = status.currentTime || 0;
  const duration = status.duration || audio.duration || 0; // Use status duration or fallback to audio.duration

  // Configure audio mode and update duration when it becomes available
  useEffect(() => {
    const configureAudio = async () => {
      try {
        // Set audio mode for proper playback
        await setAudioModeAsync({
          playsInSilentMode: true,
          allowsRecording: false,
        });
        console.log('Audio mode configured successfully');
      } catch (error) {
        console.error('Failed to configure audio mode:', error);
      }
    };

    configureAudio();
  }, []);

  useEffect(() => {
    if (status.duration && status.duration > 0 && status.duration !== audio.duration) {
      console.log('Audio duration updated:', status.duration, 'seconds');
      // You could update the audio context here if you want to persist the duration
    }
  }, [status.duration, audio.duration]);


  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = async () => {
    try {
      console.log('Play/Pause requested. Current state:', { isPlaying, audioTitle: audio.title });
      console.log('Audio URL type:', typeof audio.url, 'URL:', audio.url);
      console.log('Player status:', status);
      
      if (isPlaying) {
        console.log('Pausing audio...');
        player.pause();
        console.log('Audio paused successfully');
      } else {
        console.log('Playing audio...');
        // Stop any other audio that might be playing
        try {
          // This will stop the current player and start fresh
          player.pause();
        } catch (pauseError) {
          console.log('No previous audio to pause');
        }
        
        // Small delay to ensure clean start
        setTimeout(() => {
          player.play();
          incrementPlayCount(audio.id);
          console.log('Audio play command sent successfully');
        }, 100);
      }
    } catch (error) {
      console.error('Audio playback error:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        audio: {
          title: audio.title,
          urlType: typeof audio.url,
          url: audio.url,
        },
        playerStatus: status
      });
      Alert.alert('Error', 'Failed to play audio. Please check if the file exists and is supported.');
    }
  };

  const handleSeek = async (value: number) => {
    try {
      player.seekTo(value);
    } catch (error) {
      console.error('Seek error:', error);
    }
  };

  const handleShare = async () => {
    try {
      console.log('Starting share process for:', audio.title);
      console.log('Audio URL type:', typeof audio.url);
      console.log('Audio URL:', audio.url);
      
      incrementShareCount(audio.id);
      
      // Create share message
      const message = `Check out this audio: ${audio.title} by ${audio.author}\n\n${audio.description}\n\nListen now on AudioShare!`;
      
      // Check if sharing is available
      const isAvailable = await Sharing.isAvailableAsync();
      console.log('Sharing available:', isAvailable);
      
      if (!isAvailable) {
        Alert.alert('Sharing Not Available', 'Sharing is not available on this device.');
        return;
      }
      
      // For asset modules (require() results), copy to documents and share
      if (typeof audio.url === 'number') {
        console.log('Sharing asset module - copying to documents first');
        try {
          // Copy asset to documents directory for sharing
          const assetUri = audio.url;
          const filename = `${audio.title.replace(/\s+/g, '_')}.mp3`;
          const destUri = `${FileSystem.documentDirectory}${filename}`;
          
          // Copy the asset file
          await FileSystem.copyAsync({
            from: assetUri,
            to: destUri
          });
          
          console.log('Asset copied to:', destUri);
          
          // Now share the copied file
          await Sharing.shareAsync(destUri, {
            mimeType: 'audio/mpeg',
            dialogTitle: `Share ${audio.title}`,
          });
          console.log('Asset file sharing completed successfully');
        } catch (copyError) {
          console.log('Failed to copy asset, falling back to text sharing:', copyError);
          // Fallback to text sharing
          await Sharing.shareAsync(message, {
            mimeType: 'text/plain',
            dialogTitle: `Share ${audio.title}`,
          });
        }
      } else if (typeof audio.url === 'string') {
        // For remote URLs, try to share the file
        if (audio.url.startsWith('http')) {
          console.log('Sharing remote URL:', audio.url);
          try {
            // Determine MIME type based on URL extension
            let mimeType = 'audio/mpeg'; // default
            if (audio.url.includes('.mp3')) mimeType = 'audio/mpeg';
            else if (audio.url.includes('.wav')) mimeType = 'audio/wav';
            else if (audio.url.includes('.m4a')) mimeType = 'audio/mp4';
            else if (audio.url.includes('.aac')) mimeType = 'audio/aac';
            
            await Sharing.shareAsync(audio.url, {
              mimeType: mimeType,
              dialogTitle: `Share ${audio.title}`,
            });
            console.log('Remote file sharing completed successfully');
          } catch (shareError) {
            console.log('Remote file sharing failed, falling back to text sharing:', shareError);
            // If file sharing fails, fallback to text sharing
            await Sharing.shareAsync(message, {
              mimeType: 'text/plain',
              dialogTitle: `Share ${audio.title}`,
            });
            console.log('Fallback text sharing completed');
          }
        } else {
          console.log('Sharing local file path (text only):', audio.url);
          // Local file paths can't be shared, so share text
          await Sharing.shareAsync(message, {
            mimeType: 'text/plain',
            dialogTitle: `Share ${audio.title}`,
          });
          console.log('Local file text sharing completed');
        }
      } else {
        console.log('Unknown URL type, sharing text only');
        // Unknown type, share text
        await Sharing.shareAsync(message, {
          mimeType: 'text/plain',
          dialogTitle: `Share ${audio.title}`,
        });
        console.log('Unknown type text sharing completed');
      }
      
      console.log('Share process completed successfully');
    } catch (error) {
      console.error('Share error:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        audio: {
          title: audio.title,
          urlType: typeof audio.url,
          url: audio.url,
        }
      });
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
