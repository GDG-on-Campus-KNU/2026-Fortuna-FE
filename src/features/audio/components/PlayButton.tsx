import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, StyleSheet } from 'react-native';
import { useAudioStore } from '../store/useAudioStore';

export const PlayButton = () => {
  const playbackState = useAudioStore((state) => state.playbackState);
  const togglePlayback = useAudioStore((state) => state.togglePlayback);
  const isBusy = useAudioStore((state) => state.isBusy);

  const isPlaying = playbackState === 'playing';
  const isLoading = isBusy || playbackState === 'loading';

  return (
    <Pressable
      accessibilityLabel={isPlaying ? '일시정지' : '재생'}
      accessibilityRole="button"
      onPress={() => togglePlayback()}
      style={styles.primaryButton}
      disabled={isLoading}
    >
      {isLoading ? (
        <ActivityIndicator color="#FFFFFF" size="large" />
      ) : (
        <Ionicons
          color="#FFFFFF"
          name={isPlaying ? 'pause' : 'play'}
          size={34}
        />
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  primaryButton: {
    alignItems: 'center',
    backgroundColor: '#2563EB',
    borderRadius: 40,
    height: 80,
    justifyContent: 'center',
    width: 80,
  },
});
