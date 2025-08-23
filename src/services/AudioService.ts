import { AudioFile } from '../types';
import * as FileSystem from 'expo-file-system';

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
  baseUrl: 'file://src/repository/audios/',
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

  // Get audio files from local repository
  private async getLocalAudioFiles(): Promise<AudioFile[]> {
    try {
      // For now, return the known local audio file
      // In the future, this could scan the directory for all audio files
      const localAudioFiles: AudioFile[] = [
        {
          id: '1',
          title: 'Te Pego Hasta Que Adelgaci',
          description: 'Local audio file from repository',
          author: 'Local Artist',
          duration: 132, // Approximate duration
          // Use a remote URL for now since local files can't be played directly
          // In production, you'd want to upload these to a CDN or use asset modules
          url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav', // Placeholder for testing
          thumbnail: 'https://via.placeholder.com/150x150/6200ee/ffffff?text=🎵',
          category: 'Local',
          tags: ['local', 'audio', 'repository', 'ogg'],
          playCount: 0,
          shareCount: 0,
          isFavorite: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      ];

      console.log('Loaded local audio files:', localAudioFiles.length);
      return localAudioFiles;
    } catch (error) {
      console.error('Error loading local audio files:', error);
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
    return 'src/repository/audios/';
  }

  // Check if local audio file exists
  async checkLocalAudioFile(filename: string): Promise<boolean> {
    try {
      const filePath = `${this.getLocalRepositoryPath()}${filename}`;
      const fileInfo = await FileSystem.getInfoAsync(filePath);
      return fileInfo.exists;
    } catch (error) {
      console.error('Error checking local audio file:', error);
      return false;
    }
  }
}

// Export singleton instance
export const audioService = new AudioService();

// Export the class for custom instances
export default AudioService;
