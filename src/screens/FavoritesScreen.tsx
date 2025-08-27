import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { AudioFile } from '../types';
import { useAudio } from '../context/AudioContext';
import SharingService from '../services/sharingService';

type FavoritesScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Main'>;

const FavoritesScreen: React.FC = () => {
  const navigation = useNavigation<FavoritesScreenNavigationProp>();
  const { favorites, toggleFavorite, incrementPlayCount, incrementShareCount, isLoading } = useAudio();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredFavorites, setFilteredFavorites] = useState<AudioFile[]>([]);
  
  useEffect(() => {
    // No need to load audio files here as they're managed by the context
  }, []);

  // Filter favorites based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredFavorites(favorites);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = favorites.filter(audio => 
        audio.title.toLowerCase().includes(query) ||
        audio.author.toLowerCase().includes(query) ||
        audio.description.toLowerCase().includes(query) ||
        audio.tags.some(tag => tag.toLowerCase().includes(query)) ||
        audio.category.toLowerCase().includes(query)
      );
      setFilteredFavorites(filtered);
    }
  }, [searchQuery, favorites]);

  const onRefresh = async () => {
    setRefreshing(true);
    // Refresh handled by context
    setRefreshing(false);
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  const handlePlayAudio = async (audio: AudioFile) => {
    try {
      console.log('🎵 Play button pressed for:', audio.title);
      console.log('🎵 Audio object:', audio);
      console.log('🎵 Audio URL:', audio.url);
      console.log('🎵 Audio URL type:', typeof audio.url);
      
      incrementPlayCount(audio.id);
      console.log('✅ Play count incremented');
      
      // Navigate to AudioPlayer screen
      console.log('🧭 Navigating to AudioPlayer...');
      navigation.navigate('AudioPlayer', { audio });
      console.log('✅ Navigation completed');
      
    } catch (error) {
      console.error('❌ Play audio error:', error);
      Alert.alert('Error', 'Failed to play audio');
    }
  };

  const handleShareAudio = async (audio: AudioFile) => {
    try {
      console.log('📤 Share button pressed for:', audio.title);
      console.log('📤 Audio object:', audio);
      console.log('📤 Audio URL:', audio.url);
      console.log('📤 Audio URL type:', typeof audio.url);
      
      incrementShareCount(audio.id);
      console.log('✅ Share count incremented');
      
      // Use the sharing service
      console.log('🔧 Getting sharing service instance...');
      const sharingService = SharingService.getInstance();
      console.log('✅ Sharing service instance obtained');
      
      console.log('🚀 Calling sharing service...');
      const result = await sharingService.shareAudio(audio.url, {
        title: audio.title,
        mimeType: 'audio/mpeg'
      });
      
      if (result.success) {
        console.log('✅ Share completed successfully:', result.details);
      } else {
        console.error('❌ Share failed:', result.error);
        Alert.alert('Share Error', result.error || 'Failed to share audio');
      }
      
    } catch (error) {
      console.error('❌ Share audio error:', error);
      Alert.alert('Error', 'Failed to share audio');
    }
  };

  const handleToggleFavorite = (audioId: string) => {
    toggleFavorite(audioId);
  };

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const renderAudioItem = ({ item }: { item: AudioFile }) => (
    <View style={styles.audioItem}>
      <View style={styles.audioInfo}>
        <Text style={styles.audioTitle}>{item.title}</Text>
        <Text style={styles.audioAuthor}>by {item.author}</Text>
        <Text style={styles.audioDescription}>{item.description}</Text>
        <View style={styles.audioStats}>
          <Text style={styles.statText}>Duration: {formatDuration(item.duration)}</Text>
          <Text style={styles.statText}>Plays: {item.playCount}</Text>
          <Text style={styles.statText}>Shares: {item.shareCount}</Text>
        </View>
        <View style={styles.tagsContainer}>
          {item.tags.map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      </View>
      
      <View style={styles.audioActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handlePlayAudio(item)}
        >
          <Ionicons name="play" size={24} color="#6200ee" />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleShareAudio(item)}
        >
          <Ionicons name="share-social" size={24} color="#6200ee" />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleToggleFavorite(item.id)}
        >
          <Ionicons
            name="heart"
            size={24}
            color="#e91e63"
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (isLoading && favorites.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
        <Text style={styles.loadingText}>Loading favorites...</Text>
      </View>
    );
  }

  if (favorites.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="heart-outline" size={80} color="#ccc" />
        <Text style={styles.emptyTitle}>No Favorites Yet</Text>
        <Text style={styles.emptySubtitle}>
          Start adding audio clips to your favorites by tapping the heart icon on any audio item
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Favorites</Text>
        <Text style={styles.headerSubtitle}>{filteredFavorites.length} of {favorites.length} favorite audio clips</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search your favorites..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
              <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Search Results Info */}
      {searchQuery.length > 0 && (
        <View style={styles.searchResultsInfo}>
          <Text style={styles.searchResultsText}>
            Found {filteredFavorites.length} result{filteredFavorites.length !== 1 ? 's' : ''} for "{searchQuery}"
          </Text>
        </View>
      )}

      <FlatList
        data={filteredFavorites}
        renderItem={renderAudioItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="search" size={80} color="#ccc" />
            <Text style={styles.emptyTitle}>No favorites found</Text>
            <Text style={styles.emptySubtitle}>
              Try searching for something else or clear your search
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  listContainer: {
    padding: 15,
  },
  audioItem: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  audioInfo: {
    marginBottom: 15,
  },
  audioTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  audioAuthor: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  audioDescription: {
    fontSize: 14,
    color: '#555',
    marginBottom: 10,
    lineHeight: 20,
  },
  audioStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  statText: {
    fontSize: 12,
    color: '#888',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  tag: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 5,
  },
  tagText: {
    fontSize: 12,
    color: '#1976d2',
  },
  audioActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 15,
  },
  actionButton: {
    padding: 10,
    borderRadius: 25,
    backgroundColor: '#f8f9fa',
    minWidth: 50,
    alignItems: 'center',
  },
  searchContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 0,
  },
  clearButton: {
    padding: 5,
  },
  searchResultsInfo: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchResultsText: {
    fontSize: 14,
    color: '#666',
  },
});

export default FavoritesScreen;
