# AudioShare - Mobile Audio Sharing App

A React Native mobile application that allows users to discover, play, and share audio content via WhatsApp and other platforms.

## Features

- **User Authentication**: Register and login functionality
- **Audio Discovery**: Browse and search through audio files
- **Audio Playback**: Stream and play audio content
- **Favorites System**: Save and manage favorite audio files
- **WhatsApp Integration**: Share audio content directly to WhatsApp
- **Statistics Tracking**: Monitor play and share counts
- **Modern UI**: Beautiful, responsive design with smooth animations

## Screens

- **Login Screen**: User authentication
- **Register Screen**: New user registration
- **Home Screen**: Audio file discovery and browsing
- **Favorites Screen**: User's favorite audio files
- **Profile Screen**: User profile and navigation to other screens
- **Settings Screen**: App configuration and preferences
- **Help Screen**: Support and help information
- **About Screen**: App information and features
- **Privacy Policy Screen**: Privacy policy information
- **Terms of Service Screen**: Terms of service
- **Contact Us Screen**: Contact form and information
- **Feedback Screen**: User feedback submission
- **FAQ Screen**: Frequently asked questions
- **Audio Player Screen**: Detailed audio playback and controls

## Tech Stack

- **React Native**: Cross-platform mobile development
- **Expo**: Development platform and tools
- **TypeScript**: Type-safe JavaScript
- **React Navigation**: Navigation between screens
- **Expo AV**: Audio playback functionality
- **Expo Sharing**: File sharing capabilities
- **Context API**: State management

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Expo CLI
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd AudioShareApp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Run on device/simulator**
   - **Android**: `npm run android`
   - **iOS**: `npm run ios` (macOS only)
   - **Web**: `npm run web`

## Project Structure

```
src/
├── components/          # Reusable UI components
├── context/            # React Context providers
│   ├── AuthContext.tsx # Authentication state management
│   └── AudioContext.tsx # Audio state management
├── navigation/         # Navigation configuration
│   ├── AppNavigator.tsx # Main app navigation
│   └── MainTabNavigator.tsx # Tab navigation
├── screens/            # App screens
│   ├── LoginScreen.tsx
│   ├── RegisterScreen.tsx
│   ├── HomeScreen.tsx
│   ├── FavoritesScreen.tsx
│   ├── ProfileScreen.tsx
│   ├── SettingsScreen.tsx
│   ├── HelpScreen.tsx
│   ├── AboutScreen.tsx
│   ├── PrivacyPolicyScreen.tsx
│   ├── TermsOfServiceScreen.tsx
│   ├── ContactUsScreen.tsx
│   ├── FeedbackScreen.tsx
│   ├── FAQScreen.tsx
│   └── AudioPlayerScreen.tsx
├── types/              # TypeScript type definitions
│   └── index.ts
├── utils/              # Utility functions
└── hooks/              # Custom React hooks
```

## Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# API Configuration
API_BASE_URL=your_api_base_url
API_KEY=your_api_key

# Audio Repository
AUDIO_REPOSITORY_URL=your_audio_repository_url
```

### Audio Repository Integration

To connect to your audio repository, update the `loadAudioFiles` function in `src/context/AudioContext.tsx`:

```typescript
const loadAudioFiles = async () => {
  try {
    dispatch({ type: 'LOAD_AUDIO_START' });
    
    // Replace with your actual API call
    const response = await fetch(`${API_BASE_URL}/audio-files`);
    const audioFiles = await response.json();
    
    dispatch({ type: 'LOAD_AUDIO_SUCCESS', payload: audioFiles });
  } catch (error) {
    dispatch({ type: 'LOAD_AUDIO_FAILURE', payload: 'Failed to load audio files.' });
  }
};
```

## Usage

### Authentication

1. **Register**: Create a new account with email, username, and password
2. **Login**: Sign in with your credentials
3. **Profile**: Manage your account settings and preferences

### Audio Features

1. **Browse**: Discover audio files on the Home screen
2. **Play**: Tap the play button to start audio playback
3. **Favorite**: Add audio files to your favorites list
4. **Share**: Share audio content via WhatsApp or other platforms
5. **Search**: Find specific audio content using the search function

### Navigation

- **Bottom Tabs**: Home, Favorites, Profile, Settings
- **Stack Navigation**: Navigate between different screens
- **Drawer Navigation**: Access additional screens from the profile

## WhatsApp Integration

The app automatically detects if WhatsApp is installed and provides direct sharing:

```typescript
const whatsappUrl = `whatsapp://send?text=${encodeURIComponent(message)}`;
const canOpen = await Linking.canOpenURL(whatsappUrl);

if (canOpen) {
  await Linking.openURL(whatsappUrl);
} else {
  // Fallback to general sharing
  await Sharing.shareAsync(audio.url);
}
```

## Building for Production

### Android

1. **Generate APK**
   ```bash
   expo build:android -t apk
   ```

2. **Generate AAB (App Bundle)**
   ```bash
   expo build:android -t app-bundle
   ```

### iOS

1. **Generate IPA**
   ```bash
   expo build:ios
   ```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Email: support@audioshare.com
- Documentation: [docs.audioshare.com](https://docs.audioshare.com)
- Issues: [GitHub Issues](https://github.com/your-repo/issues)

## Roadmap

- [ ] Offline audio download
- [ ] Push notifications
- [ ] Dark mode theme
- [ ] Advanced audio controls
- [ ] Social features
- [ ] Audio playlists
- [ ] User-generated content
- [ ] Analytics dashboard

## Acknowledgments

- Built with React Native and Expo
- Icons from Ionicons
- Audio playback powered by Expo AV
- Navigation by React Navigation
