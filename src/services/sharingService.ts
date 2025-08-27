import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { Asset } from 'expo-asset';
import { Platform } from 'react-native';
import AssetMapper from './assetMapper';

export interface ShareResult {
  success: boolean;
  error?: string;
  details?: {
    method: 'asset_copy' | 'asset_direct' | 'remote_url' | 'local_file' | 'unsupported';
    sourceUrl: string | number;
    destinationUrl?: string;
    fileSize?: number;
  };
}

export interface ShareOptions {
  title: string;
  mimeType?: string;
  debugMode?: boolean;
}

class SharingService {
  private static instance: SharingService;
  private debugLogs: string[] = [];

  private constructor() {}

  static getInstance(): SharingService {
    if (!SharingService.instance) {
      SharingService.instance = new SharingService();
    }
    return SharingService.instance;
  }

  /**
   * Share audio file using device's native sharing system
   */
  async shareAudio(audioUrl: string | number, options: ShareOptions): Promise<ShareResult> {
    const startTime = Date.now();
    
    try {
      this.logDebug(`🚀 Starting share process for: ${options.title}`);
      this.logDebug(`📁 Audio URL type: ${typeof audioUrl}`);
      this.logDebug(`🔗 Audio URL: ${audioUrl}`);
      this.logDebug(`📱 Platform: ${Platform.OS}`);

      // Check if sharing is available
      const isAvailable = await Sharing.isAvailableAsync();
      this.logDebug(`✅ Sharing available: ${isAvailable}`);

      if (!isAvailable) {
        const errorMsg = 'Sharing is not available on this device.';
        this.logDebug(`❌ ${errorMsg}`);
        return {
          success: false,
          error: errorMsg,
          details: {
            method: 'unsupported',
            sourceUrl: audioUrl
          }
        };
      }

      // Handle asset modules (require() results) - try direct sharing first
      if (typeof audioUrl === 'number') {
        return await this.shareAssetDirectly(audioUrl, options);
      }
      
      // Handle string URLs
      if (typeof audioUrl === 'string') {
        if (audioUrl.startsWith('http')) {
          return await this.shareRemoteUrl(audioUrl, options);
        } else {
          // For local file paths, try direct sharing
          return await this.shareLocalFile(audioUrl, options);
        }
      }

      // Unknown type
      const errorMsg = 'Unsupported audio URL type.';
      this.logDebug(`❌ ${errorMsg}`);
      return {
        success: false,
        error: errorMsg,
        details: {
          method: 'unsupported',
          sourceUrl: audioUrl
        }
      };

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      this.logDebug(`💥 Share process failed: ${errorMsg}`);
      
      return {
        success: false,
        error: errorMsg,
        details: {
          method: 'unsupported',
          sourceUrl: audioUrl
        }
      };
    } finally {
      const duration = Date.now() - startTime;
      this.logDebug(`⏱️ Share process completed in ${duration}ms`);
    }
  }

  /**
   * Try to share asset directly without copying (like in the video)
   */
  private async shareAssetDirectly(assetUri: number, options: ShareOptions): Promise<ShareResult> {
    try {
      this.logDebug(`🎯 Attempting direct asset sharing (no copying)`);
      this.logDebug(`🔢 Asset module number: ${assetUri}`);
      
      // Use the asset mapper to get the shareable URI
      const assetMapper = AssetMapper.getInstance();
      
      // Find the asset mapping by asset module number
      const assetMappings = assetMapper.getAllAssetMappings();
      const mapping = assetMappings.find(m => m.assetModule === assetUri);
      
      if (!mapping) {
        throw new Error(`No asset mapping found for module ${assetUri}`);
      }
      
      this.logDebug(`📁 Found asset mapping: ${mapping.title}`);
      
      // Get the shareable URI (this will load and cache the asset)
      const shareableUri = await assetMapper.getShareableUri(mapping.id);
      
      if (!shareableUri) {
        throw new Error('Failed to get shareable URI from asset mapper');
      }
      
      this.logDebug(`🔗 Shareable URI: ${shareableUri}`);
      
      // Try to share using the asset's shareable URI
      await Sharing.shareAsync(shareableUri, {
        mimeType: options.mimeType || 'audio/mpeg',
        dialogTitle: `Share ${options.title}`,
        UTI: 'public.audio', // iOS-specific
      });
      
      this.logDebug(`🎉 Direct asset sharing completed successfully!`);
      
      return {
        success: true,
        details: {
          method: 'asset_direct',
          sourceUrl: assetUri
        }
      };
      
    } catch (directError) {
      this.logDebug(`⚠️ Direct sharing failed: ${directError}`);
      this.logDebug(`🔄 Falling back to copy method...`);
      
      // If direct sharing fails, fall back to the copy method
      return await this.shareAssetModule(assetUri, options);
    }
  }

  /**
   * Share asset module by copying to documents first
   */
  private async shareAssetModule(assetUri: number, options: ShareOptions): Promise<ShareResult> {
    try {
      this.logDebug(`📦 Sharing asset module - copying to documents first`);
      this.logDebug(`🔢 Asset module number: ${assetUri}`);
      
      // Use the asset mapper to get the shareable URI
      const assetMapper = AssetMapper.getInstance();
      
      // Find the asset mapping by asset module number
      const assetMappings = assetMapper.getAllAssetMappings();
      const mapping = assetMappings.find(m => m.assetModule === assetUri);
      
      if (!mapping) {
        throw new Error(`No asset mapping found for module ${assetUri}`);
      }
      
      this.logDebug(`📁 Found asset mapping: ${mapping.title}`);
      
      // Get the shareable URI (this will load and cache the asset)
      const shareableUri = await assetMapper.getShareableUri(mapping.id);
      
      if (!shareableUri) {
        throw new Error('Failed to get shareable URI from asset mapper');
      }
      
      this.logDebug(`🔗 Shareable URI: ${shareableUri}`);
      
      // Generate safe filename
      const filename = `${options.title.replace(/[^a-zA-Z0-9]/g, '_')}.mp3`;
      const destUri = `${FileSystem.documentDirectory}${filename}`;
      
      this.logDebug(`📋 Copying asset to: ${destUri}`);
      
      // Copy the asset file to documents directory
      await FileSystem.copyAsync({
        from: shareableUri,
        to: destUri
      });
      
      this.logDebug(`✅ Asset copied to: ${destUri}`);
      
      // Verify file exists and get info
      const fileInfo = await FileSystem.getInfoAsync(destUri);
      this.logDebug(`📊 Copied file info:`, fileInfo);
      
      if (fileInfo.exists && fileInfo.size && fileInfo.size > 0) {
        // Use device's built-in sharing system
        await Sharing.shareAsync(destUri, {
          mimeType: options.mimeType || 'audio/mpeg',
          dialogTitle: `Share ${options.title}`,
          UTI: 'public.audio', // iOS-specific
        });
        
        this.logDebug(`🎉 Asset file sharing completed successfully`);
        
        return {
          success: true,
          details: {
            method: 'asset_copy',
            sourceUrl: assetUri,
            destinationUrl: destUri,
            fileSize: fileInfo.size
          }
        };
      } else {
        throw new Error('Copied file verification failed');
      }
      
    } catch (error) {
      const errorMsg = `Failed to copy asset: ${error instanceof Error ? error.message : String(error)}`;
      this.logDebug(`❌ Asset sharing error: ${errorMsg}`);
      
      return {
        success: false,
        error: errorMsg,
        details: {
          method: 'asset_copy',
          sourceUrl: assetUri
        }
      };
    }
  }

  /**
   * Share remote URL directly
   */
  private async shareRemoteUrl(url: string, options: ShareOptions): Promise<ShareResult> {
    try {
      this.logDebug(`🌐 Sharing remote URL: ${url}`);
      
      // Use device's built-in sharing system for remote URLs
      await Sharing.shareAsync(url, {
        mimeType: options.mimeType || 'audio/mpeg',
        dialogTitle: `Share ${options.title}`,
        UTI: 'public.audio', // iOS-specific
      });
      
      this.logDebug(`🎉 Remote file sharing completed successfully`);
      
      return {
        success: true,
        details: {
          method: 'remote_url',
          sourceUrl: url
        }
      };
      
    } catch (error) {
      const errorMsg = `Remote file sharing failed: ${error instanceof Error ? error.message : String(error)}`;
      this.logDebug(`❌ Remote sharing error: ${errorMsg}`);
      
      return {
        success: false,
        error: errorMsg,
        details: {
          method: 'remote_url',
          sourceUrl: url
        }
      };
    }
  }

  /**
   * Share local file directly
   */
  private async shareLocalFile(filePath: string, options: ShareOptions): Promise<ShareResult> {
    try {
      this.logDebug(`📁 Sharing local file directly: ${filePath}`);
      
      // Check if file exists
      const fileInfo = await FileSystem.getInfoAsync(filePath);
      if (!fileInfo.exists) {
        throw new Error('Local file does not exist');
      }
      
      // Share the file directly
      await Sharing.shareAsync(filePath, {
        mimeType: options.mimeType || 'audio/mpeg',
        dialogTitle: `Share ${options.title}`,
        UTI: 'public.audio', // iOS-specific
      });
      
      this.logDebug(`🎉 Local file sharing completed successfully`);
      
      return {
        success: true,
        details: {
          method: 'local_file',
          sourceUrl: filePath,
          fileSize: fileInfo.size
        }
      };
      
    } catch (error) {
      const errorMsg = `Local file sharing failed: ${error instanceof Error ? error.message : String(error)}`;
      this.logDebug(`❌ ${errorMsg}`);
      
      return {
        success: false,
        error: errorMsg,
        details: {
          method: 'local_file',
          sourceUrl: filePath
        }
      };
    }
  }

  /**
   * Test sharing functionality with sample data
   */
  async testSharing(): Promise<{
    sharingAvailable: boolean;
    fileSystemAccess: boolean;
    testResults: ShareResult[];
    debugLogs: string[];
  }> {
    this.logDebug(`🧪 Starting sharing service test`);
    
    const results = {
      sharingAvailable: false,
      fileSystemAccess: false,
      testResults: [] as ShareResult[],
      debugLogs: [] as string[]
    };

    try {
      // Test 1: Check if sharing is available
      results.sharingAvailable = await Sharing.isAvailableAsync();
      this.logDebug(`✅ Sharing available: ${results.sharingAvailable}`);

      // Test 2: Check file system access
      try {
        const testPath = `${FileSystem.documentDirectory}test_sharing.txt`;
        await FileSystem.writeAsStringAsync(testPath, 'Test file for sharing service');
        const fileInfo = await FileSystem.getInfoAsync(testPath);
        results.fileSystemAccess = fileInfo.exists;
        await FileSystem.deleteAsync(testPath);
        this.logDebug(`✅ File system access: ${results.fileSystemAccess}`);
      } catch (error) {
        this.logDebug(`❌ File system access failed: ${error}`);
        results.fileSystemAccess = false;
      }

      // Test 3: Test with a sample asset (if available)
      if (results.fileSystemAccess) {
        try {
          // Create a test audio file
          const testAudioPath = `${FileSystem.documentDirectory}test_audio.mp3`;
          const testContent = 'fake mp3 content'; // This won't be a real MP3, but good for testing
          await FileSystem.writeAsStringAsync(testAudioPath, testContent);
          
          // Test sharing the test file
          const testResult = await this.shareAudio(testAudioPath, {
            title: 'Test Audio',
            debugMode: true
          });
          
          results.testResults.push(testResult);
          
          // Clean up
          await FileSystem.deleteAsync(testAudioPath);
          
        } catch (error) {
          this.logDebug(`❌ Test audio sharing failed: ${error}`);
        }
      }

    } catch (error) {
      this.logDebug(`💥 Sharing service test failed: ${error}`);
    }

    // Copy debug logs
    results.debugLogs = [...this.debugLogs];
    
    this.logDebug(`🏁 Sharing service test completed`);
    return results;
  }

  /**
   * Get debug logs
   */
  getDebugLogs(): string[] {
    return [...this.debugLogs];
  }

  /**
   * Clear debug logs
   */
  clearDebugLogs(): void {
    this.debugLogs = [];
  }

  /**
   * Log debug message
   */
  private logDebug(message: string, data?: any): void {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}`;
    
    if (data) {
      console.log(logEntry, data);
    } else {
      console.log(logEntry);
    }
    
    this.debugLogs.push(logEntry);
    
    // Keep only last 100 logs
    if (this.debugLogs.length > 100) {
      this.debugLogs = this.debugLogs.slice(-100);
    }
  }

  /**
   * Export debug logs to file
   */
  async exportDebugLogs(): Promise<string> {
    try {
      const logContent = this.debugLogs.join('\n');
      const logPath = `${FileSystem.documentDirectory}sharing_service_debug.log`;
      
      await FileSystem.writeAsStringAsync(logPath, logContent);
      this.logDebug(`📝 Debug logs exported to: ${logPath}`);
      
      return logPath;
    } catch (error) {
      this.logDebug(`❌ Failed to export debug logs: ${error}`);
      throw error;
    }
  }
}

export default SharingService;
