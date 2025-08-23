import { AudioSourceConfig } from '../services/AudioService';

// Configuration for different environments
export const audioConfigs: Record<string, AudioSourceConfig> = {
  // Development/Testing configuration
  development: {
    type: 'local',
    baseUrl: 'https://www.soundjay.com/misc/sounds/', // Free sample audio files
  },

  // Production with AWS S3
  production: {
    type: 's3',
    bucketName: process.env.EXPO_PUBLIC_S3_BUCKET_NAME || 'your-audio-bucket',
    region: process.env.EXPO_PUBLIC_AWS_REGION || 'us-east-1',
    accessKeyId: process.env.EXPO_PUBLIC_AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.EXPO_PUBLIC_AWS_SECRET_ACCESS_KEY || '',
  },

  // Custom API endpoint
  api: {
    type: 'api',
    baseUrl: process.env.EXPO_PUBLIC_API_BASE_URL || 'https://api.yourdomain.com',
  },
};

// Get current configuration based on environment
export const getCurrentAudioConfig = (): AudioSourceConfig => {
  const env = process.env.NODE_ENV || 'development';
  return audioConfigs[env] || audioConfigs.development;
};

// Environment variables that need to be set for production
export const requiredEnvVars = {
  s3: ['EXPO_PUBLIC_S3_BUCKET_NAME', 'EXPO_PUBLIC_AWS_REGION', 'EXPO_PUBLIC_AWS_ACCESS_KEY_ID', 'EXPO_PUBLIC_AWS_SECRET_ACCESS_KEY'],
  api: ['EXPO_PUBLIC_API_BASE_URL'],
};

// Validate configuration
export const validateConfig = (config: AudioSourceConfig): string[] => {
  const errors: string[] = [];

  switch (config.type) {
    case 's3':
      if (!config.bucketName) errors.push('S3 bucket name is required');
      if (!config.region) errors.push('AWS region is required');
      if (!config.accessKeyId) errors.push('AWS access key ID is required');
      if (!config.secretAccessKey) errors.push('AWS secret access key is required');
      break;
    case 'api':
      if (!config.baseUrl) errors.push('API base URL is required');
      break;
    case 'local':
      // Local config is always valid
      break;
  }

  return errors;
};
