import React, { createContext, useContext, useReducer } from 'react';
const AudioContext = createContext(undefined);
const audioReducer = (state, action) => {
    switch (action.type) {
        case 'LOAD_AUDIO_START':
            return Object.assign(Object.assign({}, state), { isLoading: true, error: null });
        case 'LOAD_AUDIO_SUCCESS':
            return Object.assign(Object.assign({}, state), { audioFiles: action.payload, favorites: action.payload.filter(audio => audio.isFavorite), isLoading: false, error: null });
        case 'LOAD_AUDIO_FAILURE':
            return Object.assign(Object.assign({}, state), { isLoading: false, error: action.payload });
        case 'TOGGLE_FAVORITE':
            return Object.assign(Object.assign({}, state), { audioFiles: state.audioFiles.map(audio => audio.id === action.payload
                    ? Object.assign(Object.assign({}, audio), { isFavorite: !audio.isFavorite }) : audio), favorites: state.audioFiles
                    .map(audio => audio.id === action.payload
                    ? Object.assign(Object.assign({}, audio), { isFavorite: !audio.isFavorite }) : audio)
                    .filter(audio => audio.isFavorite) });
        case 'INCREMENT_PLAY_COUNT':
            return Object.assign(Object.assign({}, state), { audioFiles: state.audioFiles.map(audio => audio.id === action.payload
                    ? Object.assign(Object.assign({}, audio), { playCount: audio.playCount + 1 }) : audio) });
        case 'INCREMENT_SHARE_COUNT':
            return Object.assign(Object.assign({}, state), { audioFiles: state.audioFiles.map(audio => audio.id === action.payload
                    ? Object.assign(Object.assign({}, audio), { shareCount: audio.shareCount + 1 }) : audio) });
        case 'SET_CURRENT_AUDIO':
            return Object.assign(Object.assign({}, state), { currentAudio: action.payload });
        case 'CLEAR_ERROR':
            return Object.assign(Object.assign({}, state), { error: null });
        default:
            return state;
    }
};
const initialState = {
    audioFiles: [],
    favorites: [],
    currentAudio: null,
    isLoading: false,
    error: null,
};
export const AudioProvider = ({ children }) => {
    const [state, dispatch] = useReducer(audioReducer, initialState);
    const loadAudioFiles = async () => {
        try {
            dispatch({ type: 'LOAD_AUDIO_START' });
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            // Mock audio data - replace with actual API call
            const mockAudioFiles = [
                {
                    id: '1',
                    title: 'Morning Motivation',
                    description: 'Start your day with positive energy',
                    author: 'Motivation Master',
                    duration: 180,
                    url: 'https://example.com/audio1.mp3',
                    category: 'Motivation',
                    tags: ['morning', 'motivation', 'energy'],
                    playCount: 1250,
                    shareCount: 89,
                    isFavorite: false,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    id: '2',
                    title: 'Relaxing Nature Sounds',
                    description: 'Peaceful sounds of nature for relaxation',
                    author: 'Nature Sounds',
                    duration: 300,
                    url: 'https://example.com/audio2.mp3',
                    category: 'Relaxation',
                    tags: ['nature', 'relaxation', 'peace'],
                    playCount: 890,
                    shareCount: 156,
                    isFavorite: true,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    id: '3',
                    title: 'Productivity Tips',
                    description: 'Essential tips for better productivity',
                    author: 'Productivity Pro',
                    duration: 240,
                    url: 'https://example.com/audio3.mp3',
                    category: 'Productivity',
                    tags: ['productivity', 'tips', 'work'],
                    playCount: 2100,
                    shareCount: 234,
                    isFavorite: false,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            ];
            dispatch({ type: 'LOAD_AUDIO_SUCCESS', payload: mockAudioFiles });
        }
        catch (error) {
            dispatch({ type: 'LOAD_AUDIO_FAILURE', payload: 'Failed to load audio files.' });
        }
    };
    const toggleFavorite = (audioId) => {
        dispatch({ type: 'TOGGLE_FAVORITE', payload: audioId });
    };
    const incrementPlayCount = (audioId) => {
        dispatch({ type: 'INCREMENT_PLAY_COUNT', payload: audioId });
    };
    const incrementShareCount = (audioId) => {
        dispatch({ type: 'INCREMENT_SHARE_COUNT', payload: audioId });
    };
    const setCurrentAudio = (audio) => {
        dispatch({ type: 'SET_CURRENT_AUDIO', payload: audio });
    };
    const clearError = () => {
        dispatch({ type: 'CLEAR_ERROR' });
    };
    const value = Object.assign(Object.assign({}, state), { loadAudioFiles,
        toggleFavorite,
        incrementPlayCount,
        incrementShareCount,
        setCurrentAudio,
        clearError });
    return <AudioContext.Provider value={value}>{children}</AudioContext.Provider>;
};
export const useAudio = () => {
    const context = useContext(AudioContext);
    if (context === undefined) {
        throw new Error('useAudio must be used within an AudioProvider');
    }
    return context;
};
