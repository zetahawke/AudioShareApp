export interface AudioFile {
  id: string;
  title: string;
  description: string;
  author: string;
  duration: number;
  url: string;
  thumbnail?: string;
  category: string;
  tags: string[];
  playCount: number;
  shareCount: number;
  isFavorite: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AudioState {
  audioFiles: AudioFile[];
  favorites: AudioFile[];
  currentAudio: AudioFile | null;
  isLoading: boolean;
  error: string | null;
}

export interface RootState {
  auth: AuthState;
  audio: AudioState;
}

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Main: undefined;
  Home: undefined;
  Settings: undefined;
  Profile: undefined;
  Help: undefined;
  About: undefined;
  PrivacyPolicy: undefined;
  TermsOfService: undefined;
  ContactUs: undefined;
  Feedback: undefined;
  FAQ: undefined;
  AudioPlayer: { audio: AudioFile };
  Favorites: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Favorites: undefined;
  Profile: undefined;
  Settings: undefined;
};
