# Audio Compatibility & Sharing Guide

## 🚨 **Critical: OGG Files Not Supported on iOS**

**Your current audio file `te pego hasta que adelgaci.ogg` will NOT work on iOS devices!**

### **❌ Unsupported Formats on iOS:**
- **OGG (.ogg)** - Not supported by iOS
- **FLAC (.flac)** - Limited support
- **WebM (.webm)** - Not supported

### **✅ Supported Formats on iOS:**
- **MP3 (.mp3)** - Best compatibility
- **AAC (.aac)** - Native iOS format
- **WAV (.wav)** - Good compatibility
- **M4A (.m4a)** - Excellent iOS support

## 🔧 **Solution 1: Convert OGG to MP3 (Recommended)**

### **Using FFmpeg (Command Line):**
```bash
# Install FFmpeg
sudo apt update
sudo apt install ffmpeg

# Convert OGG to MP3
ffmpeg -i "src/repository/audios/te pego hasta que adelgaci.ogg" \
       -acodec libmp3lame -ab 192k \
       "src/repository/audios/te_pego_hasta_que_adelgaci.mp3"
```

### **Using Online Converters:**
- [Convertio](https://convertio.co/ogg-mp3/)
- [Online Audio Converter](https://online-audio-converter.com/)
- [CloudConvert](https://cloudconvert.com/ogg-to-mp3)

### **Using Audacity (Free Desktop App):**
1. Open Audacity
2. Import OGG file
3. Export as MP3
4. Choose quality (192kbps recommended)

## 🔧 **Solution 2: Update AudioService with MP3**

After converting, update `src/services/AudioService.ts`:

```typescript
{
  id: '1',
  title: 'Te Pego Hasta Que Adelgaci',
  description: 'Local audio file from repository (MP3 format)',
  author: 'Local Artist',
  duration: 132,
  url: 'https://your-cdn.com/audio/te_pego_hasta_que_adelgaci.mp3', // MP3 URL
  thumbnail: 'https://via.placeholder.com/150x150/6200ee/ffffff?text=🎵',
  category: 'Local',
  tags: ['local', 'audio', 'repository', 'mp3'],
  // ... rest of properties
}
```

## 🔧 **Solution 3: Use Asset Bundling (Best for Local Files)**

### **Step 1: Move Audio to Assets**
```
assets/
├── audios/
│   ├── te_pego_hasta_que_adelgaci.mp3
│   └── other_audio.mp3
```

### **Step 2: Update AudioService**
```typescript
import { Asset } from 'expo-asset';

// In getLocalAudioFiles()
const audioAsset = require('../../assets/audios/te_pego_hasta_que_adelgaci.mp3');
const asset = Asset.fromModule(audioAsset);
await asset.downloadAsync();

return [{
  // ... other properties
  url: asset.uri, // This will work on all platforms
}];
```

## 📱 **Sharing Permissions Fixed**

### **iOS Permissions Added:**
- `NSPhotoLibraryUsageDescription` - Access to photo library
- `NSPhotoLibraryAddUsageDescription` - Save shared files

### **Android Permissions Added:**
- `WRITE_EXTERNAL_STORAGE` - Write to external storage
- `READ_EXTERNAL_STORAGE` - Read from external storage

## 🧪 **Testing Audio Playback**

### **Test with Compatible Format:**
1. Convert your OGG to MP3
2. Update AudioService with MP3 URL
3. Test on both iOS and Android
4. Verify sharing functionality

### **Test with Placeholder Audio:**
The current placeholder URL should work:
```
https://www.soundjay.com/misc/sounds/bell-ringing-05.wav
```

## 🚀 **Recommended Workflow**

### **For Development:**
1. **Convert OGG → MP3** using FFmpeg
2. **Test locally** with MP3 file
3. **Verify playback** on both platforms

### **For Production:**
1. **Host MP3 files** on CDN (AWS S3, Cloudinary)
2. **Use HTTPS URLs** in AudioService
3. **Implement caching** for better performance

## 🛠 **Troubleshooting**

### **Audio Won't Play:**
- ✅ Check file format (MP3, AAC, WAV, M4A)
- ✅ Verify file URL is accessible
- ✅ Check console for error messages
- ✅ Test on different devices

### **Sharing Not Working:**
- ✅ Check permissions in app.json
- ✅ Verify Sharing.isAvailableAsync()
- ✅ Test with different file types
- ✅ Check device sharing capabilities

### **iOS Specific Issues:**
- ✅ Use MP3 or AAC format
- ✅ Avoid OGG files completely
- ✅ Test on physical iOS device
- ✅ Check iOS version compatibility

## 📋 **Action Items**

1. **Immediate**: Convert OGG to MP3
2. **Update**: AudioService with MP3 URL
3. **Test**: Audio playback on iOS device
4. **Verify**: Sharing functionality works
5. **Optimize**: Consider asset bundling for local files

## 🎯 **Success Criteria**

- ✅ Audio plays on both iOS and Android
- ✅ Sharing button works without errors
- ✅ No more OGG compatibility warnings
- ✅ Proper error handling and user feedback

## 📚 **Resources**

- [FFmpeg Documentation](https://ffmpeg.org/documentation.html)
- [iOS Audio Format Support](https://developer.apple.com/documentation/avfoundation/audio)
- [Expo Sharing API](https://docs.expo.dev/versions/latest/sdk/sharing/)
- [React Native Audio Best Practices](https://reactnative.dev/docs/audio)

---

**Next Step**: Convert your OGG file to MP3 and test the audio playback! 🎵
