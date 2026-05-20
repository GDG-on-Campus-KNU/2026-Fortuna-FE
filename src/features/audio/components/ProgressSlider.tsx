import { useState } from 'react';
import {
  GestureResponderEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useAudioStore } from '../store/useAudioStore';

const formatTime = (seconds: number) => {
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return '0:00';
  }

  const roundedSeconds = Math.floor(seconds);
  const minutes = Math.floor(roundedSeconds / 60);
  const remainingSeconds = roundedSeconds % 60;

  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export const ProgressSlider = () => {
  const positionMillis = useAudioStore((state) => state.positionMillis);
  const durationMillis = useAudioStore((state) => state.durationMillis);
  const seek = useAudioStore((state) => state.seek);
  const [trackWidth, setTrackWidth] = useState(1);

  const durationSeconds = durationMillis / 1000;
  const positionSeconds = positionMillis / 1000;
  const progressRatio =
    durationSeconds > 0 ? Math.min(positionSeconds / durationSeconds, 1) : 0;

  const handleSeek = (event: GestureResponderEvent) => {
    const locationX = event.nativeEvent.locationX;
    const nextRatio = Math.min(Math.max(locationX / trackWidth, 0), 1);
    const nextPosition = nextRatio * durationSeconds;
    void seek(nextPosition);
  };

  return (
    <View style={styles.container}>
      <Pressable
        accessibilityLabel="오디오 재생 위치 이동"
        accessibilityRole="adjustable"
        onLayout={(event) => setTrackWidth(event.nativeEvent.layout.width)}
        onPress={handleSeek}
        style={styles.progressTrack}
      >
        <View
          style={[styles.progressFill, { width: `${progressRatio * 100}%` }]}
        />
      </Pressable>
      <View style={styles.timeRow}>
        <Text style={styles.timeText}>{formatTime(positionSeconds)}</Text>
        <Text style={styles.timeText}>{formatTime(durationSeconds)}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 10,
    width: '100%',
  },
  progressTrack: {
    backgroundColor: '#DBEAFE',
    borderRadius: 999,
    height: 12,
    overflow: 'hidden',
  },
  progressFill: {
    backgroundColor: '#2563EB',
    borderRadius: 999,
    height: '100%',
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeText: {
    color: '#64748B',
    fontSize: 13,
    fontVariant: ['tabular-nums'],
    fontWeight: '600',
  },
});
