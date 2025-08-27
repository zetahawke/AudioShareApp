import { Asset } from 'expo-asset';
import { audioManifest, audioModules } from '../config/audioManifest';

export interface AssetMapping {
  id: string;
  filename: string;
  title: string;
  assetModule: number;
  shareableUri?: string;
  fileSize?: number;
  mimeType: string;
  isLoaded: boolean;
}

class AssetMapper {
  private static instance: AssetMapper;
  private assetMappings: Map<string, AssetMapping> = new Map();
  private isInitialized: boolean = false;

  private constructor() {}

  static getInstance(): AssetMapper {
    if (!AssetMapper.instance) {
      AssetMapper.instance = new AssetMapper();
    }
    return AssetMapper.instance;
  }

  /**
   * Initialize the asset mapper with all available audio files
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('🔄 Asset mapper already initialized');
      return;
    }

    console.log('🚀 Initializing asset mapper...');
    
    try {
      // Create mappings for all audio files in the manifest
      for (const manifestItem of audioManifest) {
        const assetModule = audioModules[manifestItem.filename];
        
        if (assetModule) {
          const mapping: AssetMapping = {
            id: manifestItem.filename.replace('.mp3', ''),
            filename: manifestItem.filename,
            title: manifestItem.title,
            assetModule: assetModule,
            mimeType: 'audio/mpeg',
            isLoaded: false,
          };

          this.assetMappings.set(mapping.id, mapping);
          console.log(`📁 Created mapping for: ${manifestItem.title}`);
        } else {
          console.warn(`⚠️ No asset module found for: ${manifestItem.filename}`);
        }
      }

      console.log(`✅ Asset mapper initialized with ${this.assetMappings.size} mappings`);
      this.isInitialized = true;
      
    } catch (error) {
      console.error('❌ Failed to initialize asset mapper:', error);
      throw error;
    }
  }

  /**
   * Get a shareable URI for an asset by ID
   */
  async getShareableUri(assetId: string): Promise<string | null> {
    try {
      const mapping = this.assetMappings.get(assetId);
      
      if (!mapping) {
        console.warn(`⚠️ No mapping found for asset ID: ${assetId}`);
        return null;
      }

      // If we already have a shareable URI, return it
      if (mapping.shareableUri && mapping.isLoaded) {
        console.log(`✅ Reusing cached URI for: ${mapping.title}`);
        return mapping.shareableUri;
      }

      // Load the asset and get its URI
      console.log(`🔄 Loading asset for: ${mapping.title}`);
      const asset = Asset.fromModule(mapping.assetModule);
      
      // Wait for the asset to download
      await asset.downloadAsync();
      
      if (asset.localUri) {
        // Cache the URI for future use
        mapping.shareableUri = asset.localUri;
        mapping.isLoaded = true;
        mapping.fileSize = asset.downloaded ? asset.size : undefined;
        
        console.log(`✅ Asset loaded: ${mapping.title} -> ${asset.localUri}`);
        return asset.localUri;
      } else {
        console.error(`❌ No local URI available for: ${mapping.title}`);
        return null;
      }
      
    } catch (error) {
      console.error(`❌ Failed to get shareable URI for ${assetId}:`, error);
      return null;
    }
  }

  /**
   * Get a shareable URI for an asset by filename
   */
  async getShareableUriByFilename(filename: string): Promise<string | null> {
    const assetId = filename.replace('.mp3', '');
    return this.getShareableUri(assetId);
  }

  /**
   * Get asset mapping by ID
   */
  getAssetMapping(assetId: string): AssetMapping | undefined {
    return this.assetMappings.get(assetId);
  }

  /**
   * Get all asset mappings
   */
  getAllAssetMappings(): AssetMapping[] {
    return Array.from(this.assetMappings.values());
  }

  /**
   * Check if an asset is loaded and ready for sharing
   */
  isAssetReady(assetId: string): boolean {
    const mapping = this.assetMappings.get(assetId);
    return mapping?.isLoaded && !!mapping.shareableUri;
  }

  /**
   * Preload all assets for faster sharing
   */
  async preloadAllAssets(): Promise<void> {
    console.log('🚀 Preloading all assets...');
    
    const preloadPromises = Array.from(this.assetMappings.keys()).map(async (assetId) => {
      try {
        await this.getShareableUri(assetId);
      } catch (error) {
        console.warn(`⚠️ Failed to preload asset ${assetId}:`, error);
      }
    });

    await Promise.all(preloadPromises);
    console.log('✅ All assets preloaded');
  }

  /**
   * Get asset info for debugging
   */
  getAssetInfo(assetId: string): {
    isLoaded: boolean;
    hasUri: boolean;
    fileSize?: number;
    uri?: string;
  } | null {
    const mapping = this.assetMappings.get(assetId);
    
    if (!mapping) {
      return null;
    }

    return {
      isLoaded: mapping.isLoaded,
      hasUri: !!mapping.shareableUri,
      fileSize: mapping.fileSize,
      uri: mapping.shareableUri,
    };
  }

  /**
   * Clear cached URIs (useful for memory management)
   */
  clearCache(): void {
    console.log('🧹 Clearing asset mapper cache...');
    
    for (const mapping of this.assetMappings.values()) {
      mapping.shareableUri = undefined;
      mapping.isLoaded = false;
      mapping.fileSize = undefined;
    }
    
    console.log('✅ Asset mapper cache cleared');
  }

  /**
   * Get statistics about the asset mapper
   */
  getStats(): {
    totalAssets: number;
    loadedAssets: number;
    cachedUris: number;
  } {
    const totalAssets = this.assetMappings.size;
    const loadedAssets = Array.from(this.assetMappings.values()).filter(m => m.isLoaded).length;
    const cachedUris = Array.from(this.assetMappings.values()).filter(m => m.shareableUri).length;

    return {
      totalAssets,
      loadedAssets,
      cachedUris,
    };
  }
}

export default AssetMapper;
