# AudioShare App Demo Guide

## Quick Start

1. **Install dependencies** (if not already done):
   ```bash
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm start
   ```

3. **Run on your device**:
   - **Android**: `npm run android`
   - **iOS**: `npm run ios` (macOS only)
   - **Web**: `npm run web`

## Testing the App

### 1. Authentication Flow
- **Register**: Create a new account with any email/password
- **Login**: Sign in with your credentials
- **Logout**: Use the logout button in Profile screen

### 2. Audio Features
- **Browse**: View audio files on the Home screen
- **Play**: Tap play button to start audio playback
- **Favorite**: Add/remove audio files to favorites
- **Share**: Share audio via WhatsApp or general sharing

### 3. Navigation
- **Bottom Tabs**: Switch between Home, Favorites, Profile, Settings
- **Stack Navigation**: Navigate to Help, About, Privacy Policy, etc.
- **Profile Menu**: Access all additional screens

### 4. Settings
- Toggle various app settings
- Clear cache
- Reset settings to default

## Demo Data

The app includes mock audio data for testing:
- Morning Motivation (3:00)
- Relaxing Nature Sounds (5:00)
- Productivity Tips (4:00)

## Features to Test

✅ **User Registration & Login**
✅ **Audio File Browsing**
✅ **Audio Playback**
✅ **Favorites Management**
✅ **WhatsApp Sharing**
✅ **Statistics Tracking**
✅ **Settings Management**
✅ **Help & Support Screens**
✅ **Navigation Between Screens**

## Troubleshooting

- **Audio not playing**: Check device volume and internet connection
- **WhatsApp sharing not working**: Ensure WhatsApp is installed
- **Navigation errors**: Restart the development server

## Next Steps

1. **Connect to Real API**: Update the audio context with your backend
2. **Add Real Audio Files**: Replace mock data with actual audio content
3. **Customize UI**: Modify colors, fonts, and styling
4. **Add Features**: Implement search, categories, playlists
5. **Deploy**: Build for production and publish to app stores
