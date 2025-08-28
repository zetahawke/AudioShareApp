import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../types';
import { useAudio } from '../context/AudioContext';
import { useAudioPlayer, useAudioPlayerStatus, setAudioModeAsync } from 'expo-audio';
import * as Sharing from 'expo-sharing';
import * as Linking from 'expo-linking';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { AudioDebugger } from '../utils/audioDebugger';
import SharingService from '../services/sharingService';

type AudioPlayerScreenRouteProp = RouteProp<RootStackParamList, 'AudioPlayer'>;

const AudioPlayerScreen: React.FC = () => {
  const route = useRoute<AudioPlayerScreenRouteProp>();
  const { audio } = route.params;
  const { toggleFavorite, incrementPlayCount, incrementShareCount } = useAudio();
  
  // Create audio player using expo-audio
  const player = useAudioPlayer(audio.url);
  const status = useAudioPlayerStatus(player);
  
  // Validate audio URL and track errors
  const [playerError, setPlayerError] = useState<string | null>(null);
  
  useEffect(() => {
    try {
      console.log('🎵 Audio player created with URL:', audio.url);
      console.log('🎵 URL type:', typeof audio.url);
      
      if (!audio.url) {
        const errorMsg = 'Audio URL is undefined or null';
        console.error('❌', errorMsg);
        setPlayerError(errorMsg);
        return;
      }

      setPlayerError(null);
      console.log('✅ Audio player created successfully');
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error('❌ Failed to create audio player:', errorMsg);
      setPlayerError(errorMsg);
    }
  }, [audio.url]);
  
  // Use status from the hook
  const isPlaying = status.playing || false;
  const position = status.currentTime || 0;
  const duration = status.duration || audio.duration || 0;

  // Configure audio mode
  useEffect(() => {
    const configureAudio = async () => {
      try {
        await setAudioModeAsync({
          playsInSilentMode: true,
          allowsRecording: false,
        });
        console.log('✅ Audio mode configured successfully for', Platform.OS);
      } catch (error) {
        console.error('❌ Failed to configure audio mode:', error);
      }
    };

    configureAudio();
  }, []);

  // Monitor audio status changes for debugging
  useEffect(() => {
    if (status) {
      console.log('🎵 Audio status changed:', {
        playing: status.playing,
        currentTime: status.currentTime,
        duration: status.duration,
        isLoaded: status.isLoaded,
        isBuffering: status.isBuffering,
        timestamp: new Date().toISOString()
      });
      
      // Check if audio has completed
      if (status.isLoaded && !status.playing && status.currentTime >= status.duration && status.duration > 0) {
        console.log('🎵 Audio playback completed');
        
        // Log completion to file
        try {
          const logEntry = `[${new Date().toISOString()}] Audio Playback Completed\nAudio: ${audio.title}\nDuration: ${status.duration}s\nFinal Position: ${status.currentTime}s\nPlatform: ${Platform.OS}\n\n`;
          const logPath = `${FileSystem.documentDirectory}audio_playback_errors.log`;
          
          FileSystem.getInfoAsync(logPath).then(fileInfo => {
            if (fileInfo.exists) {
              FileSystem.readAsStringAsync(logPath).then(existingContent => {
                FileSystem.writeAsStringAsync(logPath, existingContent + logEntry);
              });
            } else {
              FileSystem.writeAsStringAsync(logPath, logEntry);
            }
          });
        } catch (logError) {
          console.error('Failed to log audio completion:', logError);
        }
      }
      
      // Log silent failures - check if audio should be playing but isn't
      if (status.isLoaded && !status.playing && status.currentTime === 0) {
        console.warn('⚠️ Potential silent failure detected:', {
          isLoaded: status.isLoaded,
          playing: status.playing,
          currentTime: status.currentTime,
          duration: status.duration
        });
        
        // Log to file
        try {
          const logEntry = `[${new Date().toISOString()}] Silent Failure Detected\nAudio: ${audio.title}\nStatus: ${JSON.stringify(status)}\nPlatform: ${Platform.OS}\n\n`;
          const logPath = `${FileSystem.documentDirectory}silent_audio_failures.log`;
          
          FileSystem.getInfoAsync(logPath).then(fileInfo => {
            if (fileInfo.exists) {
              FileSystem.readAsStringAsync(logPath).then(existingContent => {
                FileSystem.writeAsStringAsync(logPath, existingContent + logEntry);
              });
            } else {
              FileSystem.writeAsStringAsync(logPath, logEntry);
            }
          });
        } catch (logError) {
          console.error('Failed to log silent failure:', logError);
        }
      }
    }
  }, [status, audio.title]);

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
      console.log('🎵 Play/Pause requested. Current state:', { isPlaying, audioTitle: audio.title });
      console.log('🎵 Audio URL type:', typeof audio.url, 'URL:', audio.url);
      console.log('🎵 Player status:', status);
      console.log('🎵 Platform:', Platform.OS);
      console.log('🎵 Audio session state before play:', {
        isPlaying,
        position,
        duration,
        playerReady: !!player
      });
      
      // Check if player is available
      if (!player) {
        const errorMsg = 'Audio player is not available';
        console.error('❌', errorMsg);
        
        if (playerError) {
          Alert.alert('Audio Player Error', `Failed to create audio player: ${playerError}\n\nPlease try restarting the app.`);
        } else {
          Alert.alert('Audio Player Error', 'Audio player is not ready. Please wait a moment and try again.');
        }
        return;
      }
      
      if (isPlaying) {
        console.log('⏸️ Pausing audio...');
        try {
          await player.pause();
          console.log('✅ Audio paused successfully');
        } catch (pauseError) {
          console.error('❌ Failed to pause audio:', pauseError);
        }
      } else {
        console.log('▶️ Playing audio...');
        
        // iOS-specific: Ensure audio session is properly configured
        if (Platform.OS === 'ios') {
          try {
            console.log('🔧 Configuring iOS audio mode...');
            await setAudioModeAsync({
              playsInSilentMode: true,
              allowsRecording: false,
            });
            console.log('✅ iOS audio mode refreshed');
          } catch (audioModeError) {
            console.warn('⚠️ Failed to refresh iOS audio mode:', audioModeError);
          }
        }
        
        // Check if we need to reset to beginning
        if (position >= duration || position > 0) {
          console.log('🔄 Audio near end or not at beginning, resetting to start...');
          try {
            await player.setPosition(0);
            console.log('✅ Audio reset to beginning');
          } catch (seekError) {
            console.warn('⚠️ Failed to reset audio position:', seekError);
          }
        }
        
        // Stop any other audio that might be playing
        try {
          console.log('🛑 Stopping any previous audio...');
          await player.pause();
          // Small delay to ensure clean stop
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (pauseError) {
          console.log('ℹ️ No previous audio to pause');
        }
        
        // Start playback
        try {
          console.log('🚀 Attempting to start playback...');
          console.log('🎵 Player state before play:', {
            playerExists: !!player,
            playerMethods: Object.getOwnPropertyNames(player),
            statusBeforePlay: status
          });
          
          await player.play();
          console.log('✅ Audio play command sent successfully');
          
          // Wait a bit and check if audio actually started
          setTimeout(() => {
            const newStatus = status;
            console.log('🎵 Audio status after play attempt:', newStatus);
            console.log('🎵 Is actually playing:', newStatus.playing);
            console.log('🎵 Current time:', newStatus.currentTime);
            
            if (!newStatus.playing) {
              console.warn('⚠️ Audio play command sent but not actually playing');
              console.warn('⚠️ This might indicate a silent failure');
              
              // Log to file for debugging
              try {
                const logEntry = `[${new Date().toISOString()}] Silent Audio Failure\nAudio: ${audio.title}\nPlatform: ${Platform.OS}\nPlayer Status: ${JSON.stringify(newStatus)}\n\n`;
                const logPath = `${FileSystem.documentDirectory}silent_audio_failures.log`;
                
                FileSystem.getInfoAsync(logPath).then(fileInfo => {
                  if (fileInfo.exists) {
                    FileSystem.readAsStringAsync(logPath).then(existingContent => {
                      FileSystem.writeAsStringAsync(logPath, existingContent + logEntry);
                    });
                  } else {
                    FileSystem.writeAsStringAsync(logPath, logEntry);
                  }
                });
                
                console.log('📝 Silent failure logged to file:', logPath);
              } catch (logError) {
                console.error('Failed to log silent failure:', logError);
              }
            }
          }, 1000);
          
          incrementPlayCount(audio.id);
        } catch (playError) {
          console.error('❌ Failed to start playback:', playError);
          console.error('❌ Play error details:', {
            message: playError instanceof Error ? playError.message : String(playError),
            stack: playError instanceof Error ? playError.stack : undefined,
            playerState: {
              playerExists: !!player,
              playerMethods: Object.getOwnPropertyNames(player)
            }
          });
          
          Alert.alert('Playback Error', 'Failed to start audio playback. Please try again.');
        }
      }
    } catch (error) {
      console.error('❌ Audio playback error:', error);
      console.error('❌ Error details:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        audio: {
          title: audio.title,
          urlType: typeof audio.url,
          url: audio.url,
        },
        playerStatus: status,
        platform: Platform.OS,
        timestamp: new Date().toISOString()
      });
      
      // Log to file for debugging
      try {
        const logEntry = `[${new Date().toISOString()}] Audio Playback Error\nAudio: ${audio.title}\nPlatform: ${Platform.OS}\nError: ${error instanceof Error ? error.message : String(error)}\nPlayer Status: ${JSON.stringify(status)}\n\n`;
        const logPath = `${FileSystem.documentDirectory}audio_playback_errors.log`;
        
        const fileInfo = await FileSystem.getInfoAsync(logPath);
        if (fileInfo.exists) {
          const existingContent = await FileSystem.readAsStringAsync(logPath);
          await FileSystem.writeAsStringAsync(logPath, existingContent + logEntry);
        } else {
          await FileSystem.writeAsStringAsync(logPath, logEntry);
        }
        
        console.log('📝 Audio error logged to file:', logPath);
      } catch (logError) {
        console.error('Failed to log audio error:', logError);
      }
      
      let errorMessage = 'Failed to play audio. Please check if the file exists and is supported.';
      if (Platform.OS === 'ios') {
        errorMessage += ' On iOS, make sure your device is not on silent mode and try again.';
      }
      
      Alert.alert('Error', errorMessage);
    }
  };

  const handleSeek = async (value: number) => {
    try {
      await player?.setPosition(value * 1000);
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
      
      // Use the sharing service
      const sharingService = SharingService.getInstance();
      const result = await sharingService.shareAudio(audio.url, {
        title: audio.title,
        mimeType: 'audio/mpeg'
      });
      
      if (result.success) {
        console.log('Share completed successfully:', result.details);
      } else {
        console.error('Share failed:', result.error);
        Alert.alert('Share Error', result.error || 'Failed to share audio');
      }
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error('Share error:', errorMsg);
      
      // Log to file for debugging
      try {
        const logEntry = `[${new Date().toISOString()}] Share Error: ${errorMsg}\nAudio: ${audio.title} (${typeof audio.url})\nPlatform: ${Platform.OS}\n\n`;
        const logPath = `${FileSystem.documentDirectory}share_errors.log`;
        
        const fileInfo = await FileSystem.getInfoAsync(logPath);
        if (fileInfo.exists) {
          const existingContent = await FileSystem.readAsStringAsync(logPath);
          await FileSystem.writeAsStringAsync(logPath, existingContent + logEntry);
        } else {
          await FileSystem.writeAsStringAsync(logPath, logEntry);
        }
        
        console.log('📝 Share error logged to file:', logPath);
      } catch (logError) {
        console.error('Failed to log share error to file:', logError);
      }
      
      Alert.alert('Share Error', `Failed to share audio: ${errorMsg}\n\nCheck console logs for details.`);
    }
  };

  const handleToggleFavorite = () => {
    toggleFavorite(audio.id);
  };

  const handleDebug = async () => {
    try {
      console.log('🔍 Starting debug process...');
      
      // Run audio diagnosis
      const diagnosis = await AudioDebugger.diagnoseAudioIssues();
      console.log('Diagnosis result:', diagnosis);
      
      // Test current audio file
      const audioTest = await AudioDebugger.testAudioFile(audio.url);
      console.log('Audio file test:', audioTest);
      
      // Get platform-specific tips
      const tips = AudioDebugger.getPlatformSpecificTips();
      
      let debugMessage = `Platform: ${Platform.OS}\n`;
      debugMessage += `Audio Mode: ${diagnosis.success ? '✅ Configured' : '❌ Failed'}\n`;
      debugMessage += `File System: ${diagnosis.fileSystemAccess ? '✅ Accessible' : '❌ Failed'}\n`;
      debugMessage += `Sharing: ${diagnosis.sharingAvailable ? '✅ Available' : '❌ Failed'}\n`;
      debugMessage += `Audio File: ${audioTest.valid ? '✅ Valid' : '❌ Invalid'}\n`;
      debugMessage += `\nTips:\n${tips.map(tip => `• ${tip}`).join('\n')}`;
      
      Alert.alert('Debug Info', debugMessage);
      
    } catch (error) {
      console.error('Debug failed:', error);
      Alert.alert('Debug Error', 'Failed to run debug diagnostics.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.audioInfo}>
          <Text style={styles.audioTitle}>{audio.title}</Text>
          <Text style={styles.audioAuthor}>by {audio.author}</Text>
          <Text style={styles.audioDescription}>{audio.description}</Text>
          
          {/* Display audio player errors */}
          {playerError && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>⚠️ Audio Player Error: {playerError}</Text>
              <Text style={styles.errorSubtext}>Please try restarting the app</Text>
            </View>
          )}
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
          
          {/* Add reset button for debugging */}
          <TouchableOpacity 
            style={[styles.controlButton, styles.resetButton]} 
            onPress={async () => {
              try {
                if (player) {
                  console.log('🔄 Manual reset requested...');
                  await player.setPosition(0);
                  console.log('✅ Audio manually reset to beginning');
                  Alert.alert('Reset', 'Audio reset to beginning');
                }
              } catch (error) {
                console.error('❌ Failed to reset audio:', error);
                Alert.alert('Reset Error', 'Failed to reset audio position');
              }
            }}
          >
            <Ionicons name="refresh" size={24} color="#ff9800" />
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

          <TouchableOpacity style={styles.actionButton} onPress={handleDebug}>
            <Ionicons name="bug" size={24} color="#ff9800" />
            <Text style={styles.actionButtonText}>Debug</Text>
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
  resetButton: {
    backgroundColor: '#fff3e0', // A light orange background
    borderWidth: 1,
    borderColor: '#ff9800',
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
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#d32f2f',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  errorSubtext: {
    fontSize: 12,
    color: '#78909c',
    marginTop: 5,
    textAlign: 'center',
  },
});

export default AudioPlayerScreen;
