import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  PLAYBACK_RATES,
  PlayButton,
  ProgressSlider,
  useAudioStore,
  type AudioTrack,
} from '@/src/features/audio';

export const sampleAudioTrack: AudioTrack = {
  id: 'sample-audio',
  url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  title: 'Sample Audio',
  artist: 'Studycast',
  album: '맞춤형 팟캐스트',
  duration: 372,
  description: 'An sample audio for testing audio player.',
};

export default function AudioPlayerDemo() {
  const {
    activeTrack,
    playbackState,
    rate,
    error,
    interruption,
    isBusy,
    init,
    jump,
    stop,
    setRate,
  } = useAudioStore();

  useEffect(() => {
    void init(sampleAudioTrack);
  }, [init]);

  const isLoading = isBusy || playbackState === 'loading';
  const isPlaying = playbackState === 'playing';

  const title = activeTrack?.title ?? sampleAudioTrack.title;
  const subtitle = activeTrack?.description ?? sampleAudioTrack.description;

  const getStatusLabel = (state: string) => {
    switch (state) {
      case 'playing':
        return '재생 중';
      case 'paused':
        return '일시정지';
      case 'loading':
        return '불러오는 중';
      case 'ended':
        return '재생 완료';
      case 'error':
        return '오류';
      default:
        return '준비됨';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Audio Player Demo</Text>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>

      <View style={styles.statusRow}>
        <View style={styles.statusBadge}>
          <View
            style={[styles.statusDot, isPlaying && styles.statusDotActive]}
          />
          <Text style={styles.statusText}>{getStatusLabel(playbackState)}</Text>
        </View>
        {isLoading ? <ActivityIndicator color="#2563EB" /> : null}
      </View>

      <View style={styles.progressSection}>
        <ProgressSlider />
      </View>

      <View style={styles.controlRow}>
        <Pressable
          accessibilityLabel="15초 뒤로 이동"
          accessibilityRole="button"
          onPress={() => jump(-15)}
          style={styles.secondaryButton}
        >
          <Ionicons color="#1F2937" name="play-back" size={24} />
        </Pressable>

        <PlayButton />

        <Pressable
          accessibilityLabel="15초 앞으로 이동"
          accessibilityRole="button"
          onPress={() => jump(15)}
          style={styles.secondaryButton}
        >
          <Ionicons color="#1F2937" name="play-forward" size={24} />
        </Pressable>
      </View>

      <Pressable
        accessibilityLabel="재생 정지"
        accessibilityRole="button"
        onPress={() => stop()}
        style={styles.stopButton}
      >
        <Ionicons color="#374151" name="stop" size={18} />
        <Text style={styles.stopButtonText}>정지</Text>
      </Pressable>

      <View style={styles.speedSection}>
        <Text style={styles.sectionLabel}>재생 속도</Text>
        <View style={styles.speedRow}>
          {PLAYBACK_RATES.map((playbackRate) => {
            const isSelected = playbackRate === rate;

            return (
              <Pressable
                accessibilityLabel={`${playbackRate}배속`}
                accessibilityRole="button"
                key={playbackRate}
                onPress={() => setRate(playbackRate)}
                style={[
                  styles.speedButton,
                  isSelected && styles.speedButtonSelected,
                ]}
              >
                <Text
                  style={[
                    styles.speedText,
                    isSelected && styles.speedTextSelected,
                  ]}
                >
                  {playbackRate}x
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {interruption ? (
        <View style={styles.notice}>
          <Ionicons color="#92400E" name="alert-circle" size={18} />
          <Text style={styles.noticeText}>{interruption}</Text>
        </View>
      ) : null}

      {error ? (
        <View style={[styles.notice, styles.errorNotice]}>
          <Ionicons color="#991B1B" name="warning" size={18} />
          <Text style={[styles.noticeText, styles.errorText]}>{error}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F8FAFC',
    gap: 24,
    padding: 24,
  },
  controlRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 24,
    justifyContent: 'center',
  },
  errorNotice: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  errorText: {
    color: '#991B1B',
  },
  eyebrow: {
    color: '#2563EB',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0,
  },
  header: {
    gap: 10,
  },
  notice: {
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    padding: 12,
  },
  noticeText: {
    color: '#92400E',
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  progressSection: {
    width: '100%',
  },
  secondaryButton: {
    alignItems: 'center',
    backgroundColor: '#E5E7EB',
    borderRadius: 28,
    height: 56,
    justifyContent: 'center',
    width: 56,
  },
  sectionLabel: {
    color: '#111827',
    fontSize: 15,
    fontWeight: '700',
  },
  speedButton: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#D1D5DB',
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    minHeight: 44,
    justifyContent: 'center',
  },
  speedButtonSelected: {
    backgroundColor: '#111827',
    borderColor: '#111827',
  },
  speedRow: {
    flexDirection: 'row',
    gap: 8,
  },
  speedSection: {
    gap: 12,
  },
  speedText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '700',
  },
  speedTextSelected: {
    color: '#FFFFFF',
  },
  statusBadge: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  statusDot: {
    backgroundColor: '#9CA3AF',
    borderRadius: 5,
    height: 10,
    width: 10,
  },
  statusDotActive: {
    backgroundColor: '#22C55E',
  },
  statusRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 40,
  },
  statusText: {
    color: '#374151',
    fontSize: 13,
    fontWeight: '700',
  },
  stopButton: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#D1D5DB',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    minHeight: 44,
    paddingHorizontal: 18,
  },
  stopButtonText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '700',
  },
  subtitle: {
    color: '#475569',
    fontSize: 16,
    lineHeight: 24,
  },
  title: {
    color: '#0F172A',
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: 0,
    lineHeight: 38,
  },
});
