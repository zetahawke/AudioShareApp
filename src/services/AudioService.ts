import { AudioFile } from '../types';

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
  baseUrl: 'https://example.com/audio/', // Replace with your actual audio files URL
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

  // Get audio files from local testing source
  private async getLocalAudioFiles(): Promise<AudioFile[]> {
    // For testing, return mock data
    // In production, this could fetch from a local server or CDN
    return this.getMockAudioFiles();
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

  // Mock audio files for testing
  private getMockAudioFiles(): AudioFile[] {
    return [
      {
        id: '1',
        title: 'Sample Song 1',
        artist: 'Artist A',
        album: 'Album 1',
        duration: 180, // 3 minutes
        fileSize: 5.2, // MB
        url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav', // Free sample audio
        thumbnail: 'https://via.placeholder.com/150x150/6200ee/ffffff?text=🎵',
        playCount: 0,
        shareCount: 0,
        isFavorite: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '2',
        title: 'Sample Song 2',
        artist: 'Artist B',
        album: 'Album 2',
        duration: 240, // 4 minutes
        fileSize: 7.8, // MB
        url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav', // Free sample audio
        thumbnail: 'https://via.placeholder.com/150x150/03dac6/ffffff?text=🎵',
        playCount: 0,
        shareCount: 0,
        isFavorite: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '3',
        title: 'Sample Song 3',
        artist: 'Artist C',
        album: 'Album 3',
        duration: 200, // 3:20 minutes
        fileSize: 6.1, // MB
        url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav', // Free sample audio
        thumbnail: 'https://via.placeholder.com/150x150/ff6b6b/ffffff?text=🎵',
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
}

// Export singleton instance
export const audioService = new AudioService();

// Export the class for custom instances
export default AudioService;
