import * as FileSystem from 'expo-file-system';
import { Asset } from 'expo-asset';

export interface LocalAudioFile {
  id: string;
  title: string;
  filename: string;
  localPath: string;
  playableUrl?: string;
}

export class AudioFileHandler {
  private static instance: AudioFileHandler;
  private documentsDir: string;

  private constructor() {
    this.documentsDir = FileSystem.documentDirectory || '';
  }

  public static getInstance(): AudioFileHandler {
    if (!AudioFileHandler.instance) {
      AudioFileHandler.instance = new AudioFileHandler();
    }
    return AudioFileHandler.instance;
  }

  // Copy audio file from assets to documents directory
  async copyAudioToDocuments(assetModule: any): Promise<string> {
    try {
      const asset = Asset.fromModule(assetModule);
      await asset.downloadAsync();
      
      const filename = asset.name || 'audio.mp3';
      const destUri = `${this.documentsDir}${filename}`;
      
      // Copy the asset to documents directory
      await FileSystem.copyAsync({
        from: asset.localUri || asset.uri,
        to: destUri
      });
      
      return destUri;
    } catch (error) {
      console.error('Error copying audio file:', error);
      throw error;
    }
  }

  // Get playable URL for local audio file
  async getPlayableUrl(audioFile: LocalAudioFile): Promise<string> {
    try {
      // Check if file exists in documents directory
      const destPath = `${this.documentsDir}${audioFile.filename}`;
      const fileInfo = await FileSystem.getInfoAsync(destPath);
      
      if (fileInfo.exists) {
        return destPath;
      }
      
      // If not in documents, copy it there
      // For now, return a placeholder URL since we can't copy from src/
      return audioFile.localPath;
    } catch (error) {
      console.error('Error getting playable URL:', error);
      return audioFile.localPath;
    }
  }

  // List all audio files in documents directory
  async listLocalAudioFiles(): Promise<string[]> {
    try {
      const files = await FileSystem.readDirectoryAsync(this.documentsDir);
      return files.filter(file => 
        file.endsWith('.mp3') || 
        file.endsWith('.wav') || 
        file.endsWith('.ogg') || 
        file.endsWith('.m4a')
      );
    } catch (error) {
      console.error('Error listing local audio files:', error);
      return [];
    }
  }

  // Delete audio file from documents directory
  async deleteAudioFile(filename: string): Promise<boolean> {
    try {
      const filePath = `${this.documentsDir}${filename}`;
      await FileSystem.deleteAsync(filePath);
      return true;
    } catch (error) {
      console.error('Error deleting audio file:', error);
      return false;
    }
  }

  // Get file size
  async getFileSize(filePath: string): Promise<number> {
    try {
      const fileInfo = await FileSystem.getInfoAsync(filePath);
      return fileInfo.size || 0;
    } catch (error) {
      console.error('Error getting file size:', error);
      return 0;
    }
  }
}

export const audioFileHandler = AudioFileHandler.getInstance();
