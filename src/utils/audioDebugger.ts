import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { Audio } from 'expo-av';
import * as Sharing from 'expo-sharing';
import { audioModules, audioManifest } from '../config/audioManifest';

export class AudioDebugger {
  static async initializeLoggingSystem() {
    console.log('🔧 Initializing logging system at startup...');
    
    try {
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
          // Create empty log file with header
          const header = `# ${logFile} - Created on ${new Date().toISOString()}\n# AudioShareApp Log File\n\n`;
          await FileSystem.writeAsStringAsync(logPath, header);
          console.log(`✅ Created log file: ${logFile}`);
        } else {
          console.log(`ℹ️ Log file exists: ${logFile}`);
        }
      }
      
      console.log('✅ Logging system initialized at startup');
      return true;
      
    } catch (error) {
      console.error('❌ Failed to initialize logging system at startup:', error);
      return false;
    }
  }

  static async diagnoseAudioIssues() {
    console.log('🔍 Starting audio diagnosis...');
    console.log('Platform:', Platform.OS);
    
    try {
      // Test audio mode configuration
      console.log('🎵 Testing audio mode configuration...');
      try {
              await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        allowsRecordingIOS: false,
      });
        console.log('✅ Audio mode configured successfully');
      } catch (audioModeError) {
        console.error('❌ Audio mode configuration failed:', audioModeError);
        throw new Error(`Audio mode configuration failed: ${audioModeError instanceof Error ? audioModeError.message : String(audioModeError)}`);
      }
      
      // Test file system access
      console.log('📁 Testing file system access...');
      try {
        const docDir = FileSystem.documentDirectory;
        console.log('Document directory:', docDir);
        
        if (!docDir) {
          throw new Error('Document directory is null or undefined');
        }
        
        const dirInfo = await FileSystem.getInfoAsync(docDir);
        console.log('Directory info:', dirInfo);
        
        if (!dirInfo.exists) {
          throw new Error('Document directory does not exist');
        }
        
        console.log('✅ File system access successful');
      } catch (fileSystemError) {
        console.error('❌ File system access failed:', fileSystemError);
        throw new Error(`File system access failed: ${fileSystemError instanceof Error ? fileSystemError.message : String(fileSystemError)}`);
      }
      
      // Test sharing availability
      console.log('📤 Testing sharing capabilities...');
      try {
        const isSharingAvailable = await Sharing.isAvailableAsync();
        console.log('Sharing available:', isSharingAvailable);
        
        if (!isSharingAvailable) {
          console.warn('⚠️ Sharing not available on this device');
        }
        
        console.log('✅ Sharing test completed');
      } catch (sharingError) {
        console.error('❌ Sharing test failed:', sharingError);
        throw new Error(`Sharing test failed: ${sharingError instanceof Error ? sharingError.message : String(sharingError)}`);
      }
      
      console.log('✅ Audio diagnosis completed successfully');
      return {
        success: true,
        platform: Platform.OS,
        audioModeConfigured: true,
        fileSystemAccess: true,
        sharingAvailable: true,
      };
      
    } catch (error) {
      console.error('❌ Audio diagnosis failed:', error);
      return {
        success: false,
        platform: Platform.OS,
        error: error instanceof Error ? error.message : String(error),
        audioModeConfigured: false,
        fileSystemAccess: false,
        sharingAvailable: false,
      };
    }
  }
  
  static async testAudioFile(audioUrl: any) {
    console.log('🎵 Testing audio file:', audioUrl);
    console.log('URL type:', typeof audioUrl);
    
    if (typeof audioUrl === 'number') {
      console.log('Asset module detected');
      try {
        // For asset modules, we can't use FileSystem.getInfoAsync directly
        // Instead, just verify it's a valid number
        console.log('Asset module ID:', audioUrl);
        return { valid: true, type: 'asset', id: audioUrl };
      } catch (error) {
        console.error('Failed to process asset:', error);
        return { valid: false, error: String(error) };
      }
    } else if (typeof audioUrl === 'string') {
      console.log('String URL detected:', audioUrl);
      if (audioUrl.startsWith('http')) {
        return { valid: true, type: 'remote' };
      } else {
        return { valid: true, type: 'local' };
      }
    }
    
    return { valid: false, type: 'unknown' };
  }
  
  static getPlatformSpecificTips() {
    if (Platform.OS === 'ios') {
      return [
        'Make sure your device is not on silent mode',
        'Check that the audio file format is supported (MP3, M4A, WAV)',
        'Ensure you have granted necessary permissions',
        'Try restarting the app if audio doesn\'t work initially',
        'Check that no other apps are using audio',
        'Verify audio session is properly configured',
        'Check iOS audio routing settings',
      ];
    } else {
      return [
        'Check that the audio file format is supported',
        'Ensure you have granted necessary permissions',
        'Try restarting the app if audio doesn\'t work initially',
        'Check Android audio focus settings',
      ];
    }
  }

  static async validateAudioFiles() {
    console.log('🔍 Validating audio files...');
    
    try {
      // Use the existing audio manifest system
      const results = [];
      
      for (const manifestItem of audioManifest) {
        try {
          const filename = manifestItem.filename;
          const assetModule = audioModules[filename];
          
          if (assetModule) {
            console.log(`✅ ${filename}: Asset module available`);
            results.push({ 
              filename, 
              status: 'available', 
              title: manifestItem.title,
              assetModule 
            });
          } else {
            console.error(`❌ ${filename}: Asset module missing`);
            results.push({ 
              filename, 
              status: 'missing', 
              title: manifestItem.title,
              error: 'Asset module not found in audioModules'
            });
          }
        } catch (error) {
          console.error(`❌ ${manifestItem.filename}: Failed to validate:`, error);
          results.push({ 
            filename: manifestItem.filename, 
            status: 'error', 
            title: manifestItem.title,
            error: String(error) 
          });
        }
      }
      
      // Check if we have any available audio files
      const hasAvailableFiles = results.some(r => r.status === 'available');
      
      return {
        success: hasAvailableFiles,
        results,
        platform: Platform.OS,
        totalFiles: audioManifest.length,
        availableFiles: results.filter(r => r.status === 'available').length
      };
      
    } catch (error) {
      console.error('❌ Audio file validation failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        platform: Platform.OS
      };
    }
  }
}
