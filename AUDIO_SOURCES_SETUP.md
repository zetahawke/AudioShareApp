# Audio Sources Setup Guide

This guide explains how to configure different audio sources for your AudioShareApp.

## 1. Local Testing (Default)

The app comes with mock audio data for testing purposes. No additional setup required.

## 2. AWS S3 Setup

### Prerequisites
- AWS Account
- S3 Bucket for audio files
- IAM User with S3 permissions

### Steps

1. **Create S3 Bucket**
   ```bash
   # Using AWS CLI
   aws s3 mb s3://your-audio-bucket-name
   ```

2. **Set Bucket Permissions**
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Sid": "PublicReadGetObject",
         "Effect": "Allow",
         "Principal": "*",
         "Action": "s3:GetObject",
         "Resource": "arn:aws:s3:::your-bucket-name/*"
       }
     ]
   }
   ```

3. **Create IAM User**
   - Go to IAM Console
   - Create new user
   - Attach policy: `AmazonS3ReadOnlyAccess`
   - Generate access keys

4. **Set Environment Variables**
   Create `.env` file in your project root:
   ```env
   EXPO_PUBLIC_S3_BUCKET_NAME=your-audio-bucket-name
   EXPO_PUBLIC_AWS_REGION=us-east-1
   EXPO_PUBLIC_AWS_ACCESS_KEY_ID=your-access-key
   EXPO_PUBLIC_AWS_SECRET_ACCESS_KEY=your-secret-key
   ```

5. **Upload Audio Files**
   ```bash
   aws s3 cp audio-file.mp3 s3://your-bucket-name/
   ```

## 3. Custom API Setup

### Option A: Simple HTTP Server
```javascript
// Example Express.js server
const express = require('express');
const app = express();

app.get('/audio-files', (req, res) => {
  res.json([
    {
      id: '1',
      title: 'Sample Audio',
      artist: 'Artist Name',
      album: 'Album Name',
      duration: 180,
      fileSize: 5.2,
      url: 'https://your-domain.com/audio/sample.mp3',
      thumbnail: 'https://your-domain.com/thumbnails/sample.jpg',
      playCount: 0,
      shareCount: 0,
      isFavorite: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  ]);
});

app.listen(3000, () => {
  console.log('Audio API running on port 3000');
});
```

### Option B: Firebase/Firestore
```javascript
// Firebase configuration
const firebaseConfig = {
  // Your Firebase config
};

// Get audio files from Firestore
const getAudioFiles = async () => {
  const snapshot = await firebase.firestore()
    .collection('audioFiles')
    .get();
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};
```

## 4. Environment Configuration

### Development
```typescript
// Uses local mock data
const config = {
  type: 'local',
  baseUrl: 'https://www.soundjay.com/misc/sounds/'
};
```

### Production
```typescript
// Uses S3 or API based on environment variables
const config = getCurrentAudioConfig();
```

## 5. Testing Your Setup

1. **Test Connection**
   ```typescript
   import { audioService } from '../services/AudioService';
   
   const isConnected = await audioService.testConnection();
   console.log('Connection status:', isConnected);
   ```

2. **Update Configuration**
   ```typescript
   audioService.updateConfig({
     type: 's3',
     bucketName: 'my-bucket',
     region: 'us-west-2'
   });
   ```

## 6. File Format Support

The app supports common audio formats:
- MP3
- WAV
- AAC
- M4A
- OGG

## 7. Performance Considerations

- **S3**: Use CloudFront CDN for better performance
- **API**: Implement pagination for large audio libraries
- **Local**: Keep file sizes reasonable (< 50MB per file)

## 8. Security Best Practices

- **S3**: Use signed URLs for private files
- **API**: Implement authentication and rate limiting
- **Environment Variables**: Never commit secrets to version control

## 9. Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure your S3 bucket or API allows cross-origin requests
   - Add appropriate CORS headers

2. **Authentication Failures**
   - Verify AWS credentials are correct
   - Check IAM permissions

3. **File Not Found**
   - Verify file paths and URLs
   - Check file permissions

### Debug Mode
Enable debug logging in your app:
```typescript
// In development
if (__DEV__) {
  console.log('Audio config:', audioService.getConfig());
  console.log('Connection test:', await audioService.testConnection());
}
```

## 10. Next Steps

1. Choose your preferred audio source
2. Set up the necessary infrastructure
3. Configure environment variables
4. Test with a few audio files
5. Scale up as needed

For questions or issues, check the app logs or create an issue in the repository.
