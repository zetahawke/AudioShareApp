export interface AudioManifestItem {
  filename: string;
  title: string;
  description: string;
  author: string;
  category: string;
  tags: string[];
  estimatedDuration?: number; // Optional estimated duration
}

// Static require for each audio file (bundler limitation)
export const audioModules = {
  'te_pego_hasta_que_adelgaci.mp3': require('../../assets/audios/te_pego_hasta_que_adelgaci.mp3'),
  // Add more audio files here as you add them to assets/audios/
  // 'another_song.mp3': require('../../assets/audios/another_song.mp3'),
};

export const audioManifest: AudioManifestItem[] = [
  {
    filename: 'te_pego_hasta_que_adelgaci.mp3',
    title: 'Te Pego Hasta Que Adelgaci',
    description: 'Local audio file from repository (MP3 format for iOS compatibility)',
    author: 'Local Artist',
    category: 'Local',
    tags: ['local', 'audio', 'repository', 'mp3'],
    estimatedDuration: 5, // 5 seconds
  },
  // Add more audio files here as you add them to assets/audios/
  // {
  //   filename: 'another_song.mp3',
  //   title: 'Another Song',
  //   description: 'Another local audio file',
  //   author: 'Another Artist',
  //   category: 'Local',
  //   tags: ['local', 'audio', 'mp3'],
  //   estimatedDuration: 180, // 3 minutes
  // }
];

// Helper function to get audio file by filename
export const getAudioByFilename = (filename: string): AudioManifestItem | undefined => {
  return audioManifest.find(item => item.filename === filename);
};

// Helper function to get all audio files
export const getAllAudioFiles = (): AudioManifestItem[] => {
  return [...audioManifest];
};
