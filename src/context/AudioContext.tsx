import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { AudioFile, AudioState } from '../types';
import { audioService } from '../services/AudioService';

interface AudioContextType extends AudioState {
  loadAudioFiles: () => Promise<void>;
  toggleFavorite: (audioId: string) => void;
  incrementPlayCount: (audioId: string) => void;
  incrementShareCount: (audioId: string) => void;
  setCurrentAudio: (audio: AudioFile | null) => void;
  clearError: () => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

type AudioAction =
  | { type: 'LOAD_AUDIO_START' }
  | { type: 'LOAD_AUDIO_SUCCESS'; payload: AudioFile[] }
  | { type: 'LOAD_AUDIO_FAILURE'; payload: string }
  | { type: 'TOGGLE_FAVORITE'; payload: string }
  | { type: 'INCREMENT_PLAY_COUNT'; payload: string }
  | { type: 'INCREMENT_SHARE_COUNT'; payload: string }
  | { type: 'SET_CURRENT_AUDIO'; payload: AudioFile | null }
  | { type: 'CLEAR_ERROR' };

const audioReducer = (state: AudioState, action: AudioAction): AudioState => {
  switch (action.type) {
    case 'LOAD_AUDIO_START':
      return { ...state, isLoading: true, error: null };
    case 'LOAD_AUDIO_SUCCESS':
      return { 
        ...state, 
        audioFiles: action.payload, 
        favorites: action.payload.filter(audio => audio.isFavorite),
        isLoading: false, 
        error: null 
      };
    case 'LOAD_AUDIO_FAILURE':
      return { ...state, isLoading: false, error: action.payload };
    case 'TOGGLE_FAVORITE':
      return {
        ...state,
        audioFiles: state.audioFiles.map(audio =>
          audio.id === action.payload
            ? { ...audio, isFavorite: !audio.isFavorite }
            : audio
        ),
        favorites: state.audioFiles
          .map(audio =>
            audio.id === action.payload
              ? { ...audio, isFavorite: !audio.isFavorite }
              : audio
          )
          .filter(audio => audio.isFavorite),
      };
    case 'INCREMENT_PLAY_COUNT':
      return {
        ...state,
        audioFiles: state.audioFiles.map(audio =>
          audio.id === action.payload
            ? { ...audio, playCount: audio.playCount + 1 }
            : audio
        ),
      };
    case 'INCREMENT_SHARE_COUNT':
      return {
        ...state,
        audioFiles: state.audioFiles.map(audio =>
          audio.id === action.payload
            ? { ...audio, shareCount: audio.shareCount + 1 }
            : audio
        ),
      };
    case 'SET_CURRENT_AUDIO':
      return { ...state, currentAudio: action.payload };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
};

const initialState: AudioState = {
  audioFiles: [],
  favorites: [],
  currentAudio: null,
  isLoading: false,
  error: null,
};

export const AudioProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(audioReducer, initialState);

  const loadAudioFiles = async () => {
    try {
      dispatch({ type: 'LOAD_AUDIO_START' });
      
      // Use the audio service to get files
      const audioFiles = await audioService.getAudioFiles();
      
      dispatch({ type: 'LOAD_AUDIO_SUCCESS', payload: audioFiles });
    } catch (error) {
      console.error('Failed to load audio files:', error);
      dispatch({ type: 'LOAD_AUDIO_FAILURE', payload: 'Failed to load audio files.' });
    }
  };

  const toggleFavorite = (audioId: string) => {
    dispatch({ type: 'TOGGLE_FAVORITE', payload: audioId });
  };

  const incrementPlayCount = (audioId: string) => {
    dispatch({ type: 'INCREMENT_PLAY_COUNT', payload: audioId });
  };

  const incrementShareCount = (audioId: string) => {
    dispatch({ type: 'INCREMENT_SHARE_COUNT', payload: audioId });
  };

  const setCurrentAudio = (audio: AudioFile | null) => {
    dispatch({ type: 'SET_CURRENT_AUDIO', payload: audio });
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value: AudioContextType = {
    ...state,
    loadAudioFiles,
    toggleFavorite,
    incrementPlayCount,
    incrementShareCount,
    setCurrentAudio,
    clearError,
  };

  return <AudioContext.Provider value={value}>{children}</AudioContext.Provider>;
};

export const useAudio = (): AudioContextType => {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};
