import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  TextInput,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import * as FileSystem from 'expo-file-system';
import { Audio } from 'expo-av';
import { AudioDebugger } from '../utils/audioDebugger';
import { audioManifest, audioModules } from '../config/audioManifest';
import SharingService from '../services/sharingService';
import AssetMapper from '../services/assetMapper';
import { Ionicons } from '@expo/vector-icons';

const SettingsScreen: React.FC = () => {
  const { logout, user } = useAuth();
  const [crashLogs, setCrashLogs] = useState<string>('');
  const [debugMessage, setDebugMessage] = useState<string>('');
  // Get app version from package.json safely
  const [appVersion, setAppVersion] = useState<string>('1.0.0');
  
  // Create test audio player using expo-av
  const [testAudioPlayer, setTestAudioPlayer] = useState<Audio.Sound | null>(null);
  
  useEffect(() => {
    try {
      // Try to get version from package.json, fallback to default
      const packageInfo = require('../../package.json');
      setAppVersion(packageInfo.version || '1.0.0');
    } catch (error) {
      console.log('Could not load package.json, using default version');
      setAppVersion('1.0.0');
    }
    
    // Initialize logging system at startup
    initializeLoggingSystem();
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
      
      const logFiles = [
        'error_log.txt',
        'share_errors.log',
        'audio_playback_errors.log',
        'silent_audio_failures.log',
        'audio_test_errors.log'
      ];
      
      let allLogs = '=== AUDIO SHARE APP LOGS ===\n\n';
      let hasAnyLogs = false;
      
      for (const logFile of logFiles) {
        const logPath = `${FileSystem.documentDirectory}${logFile}`;
        console.log('Attempting to read from:', logPath);
        
        // Check if file exists first
        const fileInfo = await FileSystem.getInfoAsync(logPath);
        console.log('File info for', logFile, ':', fileInfo);
        
        if (fileInfo.exists) {
          try {
            const logs = await FileSystem.readAsStringAsync(logPath);
            if (logs && logs.trim().length > 0) {
              allLogs += `=== ${logFile.toUpperCase()} ===\n${logs}\n\n`;
              hasAnyLogs = true;
            } else {
              allLogs += `=== ${logFile.toUpperCase()} ===\n(File exists but empty)\n\n`;
            }
          } catch (readError) {
            allLogs += `=== ${logFile.toUpperCase()} ===\nError reading file: ${readError}\n\n`;
          }
        } else {
          allLogs += `=== ${logFile.toUpperCase()} ===\n(File not found)\n\n`;
        }
      }
      
      if (!hasAnyLogs) {
        allLogs += 'No log files found or all files are empty.\n\n';
        allLogs += 'To generate logs:\n';
        allLogs += '1. Use the "Initialize Logging System" button\n';
        allLogs += '2. Try using the app (audio, sharing, etc.)\n';
        allLogs += '3. Check console logs for real-time information\n';
      }
      
      setCrashLogs(allLogs);
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
      if (fileInfo.exists) {
        await FileSystem.deleteAsync(logPath);
        setCrashLogs('Crash logs cleared');
      } else {
        setCrashLogs('No crash logs to clear');
      }
    } catch (error) {
      console.error('Error clearing crash logs:', error);
      Alert.alert('Error', `Failed to clear crash logs: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const initializeLoggingSystem = async () => {
    try {
      console.log('🔧 Initializing logging system...');
      
      if (!FileSystem.documentDirectory) {
        console.error('❌ Document directory not available');
        return false;
      }
      
      const logFiles = [
        'error_log.txt',
        'share_errors.log',
        'audio_playback_errors.log',
        'silent_audio_failures.log',
        'audio_test_errors.log'
      ];
      
      for (const logFile of logFiles) {
        const logPath = `${FileSystem.documentDirectory}${logFile}`;
        const fileInfo = await FileSystem.getInfoAsync(logPath);
        
        if (!fileInfo.exists) {
          // Create empty log file
          await FileSystem.writeAsStringAsync(logPath, `# ${logFile} - Created on ${new Date().toISOString()}\n\n`);
          console.log(`✅ Created log file: ${logFile}`);
        } else {
          console.log(`ℹ️ Log file exists: ${logFile}`);
        }
      }
      
      console.log('✅ Logging system initialized');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize logging system:', error);
      return false;
    }
  };

  const testErrorBoundary = () => {
    // This will trigger the ErrorBoundary
    throw new Error('Test error to trigger ErrorBoundary');
  };

  const testAudio = async () => {
    try {
      console.log('🎵 Testing audio functionality...');
      
      // First run audio diagnosis
      const diagnosis = await AudioDebugger.diagnoseAudioIssues();
      console.log('Audio diagnosis result:', diagnosis);
      
      if (!diagnosis.success) {
        console.error('❌ Audio diagnosis failed:', diagnosis.error);
        Alert.alert('Diagnosis Failed', `Audio system check failed: ${diagnosis.error}\n\nPlease check the console logs for details.`);
        return;
      }
      
      // Configure audio mode
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          allowsRecordingIOS: false,
        });
        console.log('✅ Audio mode configured for test');
      } catch (audioModeError) {
        console.error('❌ Failed to configure audio mode:', audioModeError);
        throw new Error(`Audio mode configuration failed: ${audioModeError instanceof Error ? audioModeError.message : String(audioModeError)}`);
      }
      
      // Use the component-level test audio player
      if (testAudioPlayer) {
        console.log('🎵 Test audio player available, attempting to play...');
        
        try {
          console.log('🚀 Starting playback...');
          
          // Always reset to beginning for consistent testing
          try {
            await testAudioPlayer.seekTo(0);
            console.log('🔄 Reset to beginning');
          } catch (seekError) {
            console.log('ℹ️ Could not reset position, continuing...');
          }
          
          // Simple play - let it play completely
          await testAudioPlayer.play();
          console.log('✅ Test audio started playing');
          
          Alert.alert('Audio Test', 'Test audio should be playing now!\n\nLet it play completely, then try the button again.\n\nIf no audio, check:\n• Device volume\n• Silent mode\n• Console logs');
          
        } catch (playError) {
          console.error('❌ Failed to play test audio:', playError);
          throw new Error(`Test audio play failed: ${playError instanceof Error ? playError.message : String(playError)}`);
        }
      } else {
        throw new Error('Test audio player is not available');
      }
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error('❌ Audio test failed:', errorMsg);
      
      // Log to file for debugging
      try {
        const logEntry = `[${new Date().toISOString()}] Audio Test Error: ${errorMsg}\nPlatform: ${Platform.OS}\n\n`;
        const logPath = `${FileSystem.documentDirectory}audio_test_errors.log`;
        
        const fileInfo = await FileSystem.getInfoAsync(logPath);
        if (fileInfo.exists) {
          const existingContent = await FileSystem.readAsStringAsync(logPath);
          await FileSystem.writeAsStringAsync(logPath, existingContent + logEntry);
        } else {
          await FileSystem.writeAsStringAsync(logPath, logEntry);
        }
        
        console.log('📝 Audio test error logged to file:', logPath);
      } catch (logError) {
        console.error('Failed to log audio test error to file:', logError);
      }
      
      Alert.alert('Audio Test Failed', `Failed to test audio: ${errorMsg}\n\nCheck console logs for details.\n\nAvailable audio files:\n• test-audio.mp3\n• te_pego_hasta_que_adelgaci.mp3`);
    }
  };

  const runAudioDiagnostics = async () => {
    try {
      console.log('🔍 Running comprehensive audio diagnostics...');
      
      const diagnosis = await AudioDebugger.diagnoseAudioIssues();
      console.log('Full diagnosis result:', diagnosis);
      
      let diagnosticMessage = `Platform: ${Platform.OS}\n`;
      diagnosticMessage += `Audio Mode: ${diagnosis.success ? '✅ Configured' : '❌ Failed'}\n`;
      diagnosticMessage += `File System: ${diagnosis.fileSystemAccess ? '✅ Accessible' : '❌ Failed'}\n`;
      diagnosticMessage += `Sharing: ${diagnosis.sharingAvailable ? '✅ Available' : '❌ Failed'}\n`;
      
      if (diagnosis.error) {
        diagnosticMessage += `\nError: ${diagnosis.error}`;
      }
      
      const tips = AudioDebugger.getPlatformSpecificTips();
      diagnosticMessage += `\n\nTips:\n${tips.map(tip => `• ${tip}`).join('\n')}`;
      
      Alert.alert('Audio Diagnostics', diagnosticMessage);
      
    } catch (error) {
      console.error('Audio diagnostics failed:', error);
      Alert.alert('Diagnostics Error', 'Failed to run audio diagnostics.');
    }
  };

  const testSharing = async () => {
    try {
      setDebugMessage('🧪 Testing sharing service...');
      
      const sharingService = SharingService.getInstance();
      const results = await sharingService.testSharing();
      
      let message = '📱 Sharing Service Test Results:\n\n';
      message += `✅ Sharing Available: ${results.sharingAvailable}\n`;
      message += `📁 File System Access: ${results.fileSystemAccess}\n`;
      message += `🧪 Test Results: ${results.testResults.length}\n`;
      
      if (results.testResults.length > 0) {
        results.testResults.forEach((result, index) => {
          message += `\nTest ${index + 1}:\n`;
          message += `  Success: ${result.success}\n`;
          if (result.error) message += `  Error: ${result.error}\n`;
          if (result.details) {
            message += `  Method: ${result.details.method}\n`;
            if (result.details.fileSize) message += `  File Size: ${result.details.fileSize} bytes\n`;
          }
        });
      }
      
      message += '\n📋 Debug Logs:\n';
      results.debugLogs.slice(-10).forEach(log => {
        message += `  ${log}\n`;
      });
      
      setDebugMessage(message);
      
      // Also show alert with summary
      Alert.alert(
        'Sharing Service Test Results',
        `Sharing Available: ${results.sharingAvailable}\nFile System Access: ${results.fileSystemAccess}\nTests Run: ${results.testResults.length}`,
        [{ text: 'OK' }]
      );
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      setDebugMessage(`❌ Sharing service test failed: ${errorMsg}`);
      Alert.alert('Test Failed', `Sharing service test failed: ${errorMsg}`);
    }
  };

  const viewSharingLogs = async () => {
    try {
      setDebugMessage('📋 Loading sharing service logs...');
      
      const sharingService = SharingService.getInstance();
      const logs = sharingService.getDebugLogs();
      
      if (logs.length === 0) {
        setDebugMessage('📋 No sharing service logs available. Try using the share button first.');
        return;
      }
      
      let message = '📋 Sharing Service Debug Logs:\n\n';
      logs.forEach((log, index) => {
        message += `${index + 1}. ${log}\n`;
      });
      
      setDebugMessage(message);
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      setDebugMessage(`❌ Failed to load sharing logs: ${errorMsg}`);
    }
  };

  const clearSharingLogs = async () => {
    try {
      const sharingService = SharingService.getInstance();
      sharingService.clearDebugLogs();
      setDebugMessage('🧹 Sharing service logs cleared');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      setDebugMessage(`❌ Failed to clear sharing logs: ${errorMsg}`);
    }
  };

  const exportSharingLogs = async () => {
    try {
      setDebugMessage('📤 Exporting sharing service logs...');
      
      const sharingService = SharingService.getInstance();
      const logPath = await sharingService.exportDebugLogs();
      
      setDebugMessage(`📤 Sharing service logs exported to:\n${logPath}`);
      Alert.alert('Export Successful', `Logs exported to:\n${logPath}`);
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      setDebugMessage(`❌ Failed to export sharing logs: ${errorMsg}`);
      Alert.alert('Export Failed', `Failed to export logs: ${errorMsg}`);
    }
  };

  const checkAssetMapper = async () => {
    try {
      setDebugMessage('🔍 Checking asset mapper status...');
      
      const assetMapper = AssetMapper.getInstance();
      const stats = assetMapper.getStats();
      const allMappings = assetMapper.getAllAssetMappings();
      
      let message = '📱 Asset Mapper Status:\n\n';
      message += `Total Assets: ${stats.totalAssets}\n`;
      message += `Loaded Assets: ${stats.loadedAssets}\n`;
      message += `Cached URIs: ${stats.cachedUris}\n\n`;
      
      message += '📁 Asset Details:\n';
      allMappings.forEach((mapping, index) => {
        const status = mapping.isLoaded ? '✅' : '⏳';
        message += `${status} ${mapping.title}\n`;
        message += `  ID: ${mapping.id}\n`;
        message += `  Filename: ${mapping.filename}\n`;
        message += `  Loaded: ${mapping.isLoaded}\n`;
        if (mapping.shareableUri) {
          message += `  URI: ${mapping.shareableUri.substring(0, 50)}...\n`;
        }
        message += '\n';
      });
      
      setDebugMessage(message);
      
      // Also show alert with summary
      Alert.alert(
        'Asset Mapper Status',
        `Total: ${stats.totalAssets}\nLoaded: ${stats.loadedAssets}\nCached: ${stats.cachedUris}`,
        [{ text: 'OK' }]
      );
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      setDebugMessage(`❌ Asset mapper check failed: ${errorMsg}`);
      Alert.alert('Check Failed', `Asset mapper check failed: ${errorMsg}`);
    }
  };

  const preloadAllAssets = async () => {
    try {
      setDebugMessage('🚀 Preloading all assets...');
      
      const assetMapper = AssetMapper.getInstance();
      await assetMapper.preloadAllAssets();
      
      const stats = assetMapper.getStats();
      setDebugMessage(`✅ All assets preloaded!\n\nTotal: ${stats.totalAssets}\nLoaded: ${stats.loadedAssets}\nCached: ${stats.cachedUris}`);
      
      Alert.alert('Preload Complete', `All ${stats.totalAssets} assets have been preloaded!`);
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      setDebugMessage(`❌ Asset preload failed: ${errorMsg}`);
      Alert.alert('Preload Failed', `Failed to preload assets: ${errorMsg}`);
    }
  };

  const clearAssetCache = async () => {
    try {
      const assetMapper = AssetMapper.getInstance();
      assetMapper.clearCache();
      
      const stats = assetMapper.getStats();
      setDebugMessage(`🧹 Asset cache cleared!\n\nTotal: ${stats.totalAssets}\nLoaded: ${stats.loadedAssets}\nCached: ${stats.cachedUris}`);
      
      Alert.alert('Cache Cleared', 'Asset cache has been cleared successfully!');
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      setDebugMessage(`❌ Cache clear failed: ${errorMsg}`);
    }
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
        
        <TouchableOpacity style={styles.debugButton} onPress={initializeLoggingSystem}>
          <Text style={styles.debugButtonText}>Initialize Logging System</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.debugButton} onPress={testErrorBoundary}>
          <Text style={styles.debugButtonText}>Test Error Boundary</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.debugButton} onPress={testAudio}>
          <Text style={styles.debugButtonText}>Test Audio</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.debugButton} onPress={runAudioDiagnostics}>
          <Text style={styles.debugButtonText}>Run Audio Diagnostics</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.debugButton} onPress={async () => {
          try {
            console.log('🔍 Validating audio files...');
            const validation = await AudioDebugger.validateAudioFiles();
            console.log('Audio file validation result:', validation);
            
            let message = `Audio File Validation:\n\n`;
            message += `Total files in manifest: ${validation.totalFiles}\n`;
            message += `Available files: ${validation.availableFiles}\n\n`;
            
            if (validation.success) {
              message += `✅ Some audio files are accessible\n\n`;
            } else {
              message += `❌ No audio files are accessible\n\n`;
            }
            
            if (validation.results) {
              validation.results.forEach(result => {
                message += `${result.status === 'available' ? '✅' : '❌'} ${result.filename}\n`;
                message += `  Title: ${result.title}\n`;
                message += `  Status: ${result.status}\n`;
                if (result.error) {
                  message += `  Error: ${result.error}\n`;
                }
                message += '\n';
              });
            }
            
            if (validation.error) {
              message += `\nValidation Error: ${validation.error}`;
            }
            
            Alert.alert('Audio File Validation', message);
            
          } catch (error) {
            console.error('Audio file validation failed:', error);
            Alert.alert('Validation Error', 'Failed to validate audio files.');
          }
        }}>
          <Text style={styles.debugButtonText}>Validate Audio Files</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.debugButton} onPress={async () => {
          try {
            console.log('🔍 Checking loaded audio files from service...');
            
            // Import and check the audio service
            const { audioService } = require('../services/AudioService');
            const audioFiles = await audioService.getAudioFiles();
            
            let message = `Loaded Audio Files:\n\n`;
            message += `Total files loaded: ${audioFiles.length}\n\n`;
            
            audioFiles.forEach((audioFile, index) => {
              message += `${index + 1}. ${audioFile.title}\n`;
              message += `   ID: ${audioFile.id}\n`;
              message += `   URL Type: ${typeof audioFile.url}\n`;
              message += `   URL: ${audioFile.url}\n`;
              message += `   Duration: ${audioFile.duration}s\n`;
              message += `   Category: ${audioFile.category}\n\n`;
            });
            
            if (audioFiles.length === 0) {
              message += 'No audio files loaded!\n';
              message += 'Check audio service configuration.\n';
            }
            
            Alert.alert('Loaded Audio Files', message);
            
          } catch (error) {
            console.error('Failed to check loaded audio files:', error);
            Alert.alert('Error', 'Failed to check loaded audio files.');
          }
        }}>
          <Text style={styles.debugButtonText}>Check Loaded Audio Files</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.debugButton} onPress={async () => {
          try {
            const logFiles = [
              'error_log.txt',
              'share_errors.log',
              'audio_playback_errors.log',
              'silent_audio_failures.log',
              'audio_test_errors.log'
            ];
            
            let allLogs = '=== AUDIO SHARE APP LOGS ===\n\n';
            
            for (const logFile of logFiles) {
              const logPath = `${FileSystem.documentDirectory}${logFile}`;
              const fileInfo = await FileSystem.getInfoAsync(logPath);
              
              if (fileInfo.exists) {
                try {
                  const content = await FileSystem.readAsStringAsync(logPath);
                  allLogs += `=== ${logFile.toUpperCase()} ===\n${content}\n\n`;
                } catch (readError) {
                  allLogs += `=== ${logFile.toUpperCase()} ===\nError reading: ${readError}\n\n`;
                }
              } else {
                allLogs += `=== ${logFile.toUpperCase()} ===\nFile not found\n\n`;
              }
            }
            
            if (allLogs === '=== AUDIO SHARE APP LOGS ===\n\n') {
              allLogs += 'No log files found. Try using the app first to generate some logs.';
            }
            
            setCrashLogs(allLogs);
          } catch (error) {
            console.error('Error reading all logs:', error);
            setCrashLogs(`Error reading logs: ${error instanceof Error ? error.message : String(error)}`);
          }
        }}>
          <Text style={styles.debugButtonText}>View All Logs</Text>
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

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sharing Service Debug</Text>
        
        <TouchableOpacity style={styles.button} onPress={testSharing}>
          <Ionicons name="share-social" size={20} color="white" />
          <Text style={styles.buttonText}>Test Sharing Service</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={viewSharingLogs}>
          <Ionicons name="document-text" size={20} color="white" />
          <Text style={styles.buttonText}>View Sharing Logs</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={clearSharingLogs}>
          <Ionicons name="trash" size={20} color="white" />
          <Text style={styles.buttonText}>Clear Sharing Logs</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={exportSharingLogs}>
          <Ionicons name="download" size={20} color="white" />
          <Text style={styles.buttonText}>Export Sharing Logs</Text>
        </TouchableOpacity>

        {debugMessage ? (
          <View style={styles.logsContainer}>
            <Text style={styles.logsTitle}>Sharing Service Debug:</Text>
            <Text style={styles.logsText}>{debugMessage}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Asset Mapper Debug</Text>
        
        <TouchableOpacity style={styles.button} onPress={checkAssetMapper}>
          <Ionicons name="folder" size={20} color="white" />
          <Text style={styles.buttonText}>Check Asset Mapper</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={preloadAllAssets}>
          <Ionicons name="download" size={20} color="white" />
          <Text style={styles.buttonText}>Preload All Assets</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={clearAssetCache}>
          <Ionicons name="trash" size={20} color="white" />
          <Text style={styles.buttonText}>Clear Asset Cache</Text>
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
    flexDirection: 'row', // Added for icon alignment
    justifyContent: 'center', // Added for icon alignment
  },
  debugButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 10, // Added for icon spacing
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
  button: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 8,
    marginVertical: 5,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 10,
  },
});

export default SettingsScreen;
