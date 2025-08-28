import { AudioFile } from '../types';
import * as FileSystem from 'expo-file-system';
import { audioManifest, AudioManifestItem, audioModules } from '../config/audioManifest';

// Configuration for different audio sources
export interface AudioSourceConfig {
  type: 'local' | 's3' | 'api';
  baseUrl?: string;
  bucketName?: string;
  region?: string;
  accessKeyId?: string;
  secretAccessKey?: string;
}

// Default configuration for local testing
const defaultConfig: AudioSourceConfig = {
  type: 'local',
  baseUrl: 'assets/audios/',
};

class AudioService {
  private config: AudioSourceConfig;

  constructor(config: AudioSourceConfig = defaultConfig) {
    this.config = config;
  }

  // Get audio files from the configured source
  async getAudioFiles(): Promise<AudioFile[]> {
    try {
      switch (this.config.type) {
        case 'local':
          return await this.getLocalAudioFiles();
        case 's3':
          return await this.getS3AudioFiles();
        case 'api':
          return await this.getApiAudioFiles();
        default:
          throw new Error(`Unsupported audio source type: ${this.config.type}`);
      }
    } catch (error) {
      console.error('Failed to get audio files:', error);
      // Return mock data as fallback
      return this.getMockAudioFiles();
    }
  }

  // Get audio files from assets/audios folder using manifest
  private async getLocalAudioFiles(): Promise<AudioFile[]> {
    try {
      const localAudioFiles: AudioFile[] = [];

      for (const manifestItem of audioManifest) {
        try {
          // Get the audio module from our static mapping
          const audioModule = audioModules[manifestItem.filename as keyof typeof audioModules];
          
          if (!audioModule) {
            console.warn(`⚠️ No static require found for ${manifestItem.filename}`);
            continue;
          }
          
          // Create AudioFile object with the module number as URL
          // expo-av can handle require() numbers directly
          const audioFile: AudioFile = {
            id: manifestItem.filename.replace('.mp3', ''), // Use filename as ID
            title: manifestItem.title,
            description: manifestItem.description,
            author: manifestItem.author,
            duration: manifestItem.estimatedDuration || 0, // Use estimated duration initially
            url: audioModule, // Use the require() number directly - expo-av can handle this
            thumbnail: 'https://via.placeholder.com/150x150/6200ee/ffffff?text=🎵',
            category: manifestItem.category,
            tags: manifestItem.tags,
            playCount: 0,
            shareCount: 0,
            isFavorite: false,
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          localAudioFiles.push(audioFile);
          console.log(`✅ Loaded audio file: ${manifestItem.title} (${manifestItem.filename})`);
        } catch (error) {
          console.warn(`⚠️ Failed to load audio file ${manifestItem.filename}:`, error);
          // Continue loading other files even if one fails
        }
      }

      console.log(`🎵 Total local audio files loaded: ${localAudioFiles.length}/${audioManifest.length}`);
      
      if (localAudioFiles.length === 0) {
        console.warn('No audio files could be loaded, falling back to mock data');
        return this.getMockAudioFiles();
      }
      
      return localAudioFiles;
    } catch (error) {
      console.error('❌ Error loading local audio files:', error);
      // Fallback to mock data if local loading fails
      return this.getMockAudioFiles();
    }
  }

  // Get audio files from AWS S3
  private async getS3AudioFiles(): Promise<AudioFile[]> {
    if (!this.config.bucketName || !this.config.accessKeyId || !this.config.secretAccessKey) {
      throw new Error('S3 configuration incomplete');
    }

    // This would use AWS SDK to list and fetch audio files
    // For now, return mock data
    console.log('S3 audio source configured but not implemented yet');
    return this.getMockAudioFiles();
  }

  // Get audio files from API
  private async getApiAudioFiles(): Promise<AudioFile[]> {
    if (!this.config.baseUrl) {
      throw new Error('API base URL not configured');
    }

    try {
      const response = await fetch(`${this.config.baseUrl}/audio-files`);
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      return this.getMockAudioFiles();
    }
  }

  // Mock audio files for testing (fallback)
  private getMockAudioFiles(): AudioFile[] {
    return [
      {
        id: 'mock-1',
        title: 'Sample Song 1',
        description: 'A sample audio track for testing',
        author: 'Artist A',
        duration: 180, // 3 minutes
        url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav', // Free sample audio
        thumbnail: 'https://via.placeholder.com/150x150/6200ee/ffffff?text=🎵',
        category: 'Sample',
        tags: ['sample', 'test', 'audio'],
        playCount: 0,
        shareCount: 0,
        isFavorite: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'mock-2',
        title: 'Sample Song 2',
        description: 'Another sample audio track for testing',
        author: 'Artist B',
        duration: 240, // 4 minutes
        url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav', // Free sample audio
        thumbnail: 'https://via.placeholder.com/150x150/03dac6/ffffff?text=🎵',
        category: 'Sample',
        tags: ['sample', 'test', 'audio'],
        playCount: 0,
        shareCount: 0,
        isFavorite: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
  }

  // Update configuration
  updateConfig(newConfig: Partial<AudioSourceConfig>) {
    this.config = { ...this.config, ...newConfig };
  }

  // Get current configuration
  getConfig(): AudioSourceConfig {
    return { ...this.config };
  }

  // Test connection to audio source
  async testConnection(): Promise<boolean> {
    try {
      await this.getAudioFiles();
      return true;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }

  // Get local repository path
  getLocalRepositoryPath(): string {
    return 'assets/audios/';
  }

  // Check if local audio file exists in assets
  async checkLocalAudioFile(filename: string): Promise<boolean> {
    try {
      // Check if the file exists in our static audioModules
      return filename in audioModules;
    } catch (error) {
      console.warn(`Audio file ${filename} not found in assets:`, error);
      return false;
    }
  }


}

// Export singleton instance
export const audioService = new AudioService();

// Export the class for custom instances
export default AudioService;
