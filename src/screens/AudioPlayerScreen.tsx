import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  GestureResponderEvent,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { PLAYBACK_RATES, useAudioStore } from '@/src/features/audio';
import { Fonts } from '@/src/shared/constants/theme';

interface VisualizerBarProps {
  isPlaying: boolean;
  index: number;
  baseHeight: number;
}

function VisualizerBar({ isPlaying, index, baseHeight }: VisualizerBarProps) {
  const height = useSharedValue(12);

  useEffect(() => {
    if (isPlaying) {
      // 인덱스별로 살짝 다른 딜레이와 듀레이션을 부여하여 진짜 유기적인 음파 움직임을 연출합니다.
      height.value = withRepeat(
        withSequence(
          withTiming(baseHeight * 0.4, { duration: 150 + index * 30 }),
          withTiming(baseHeight * 1.1, { duration: 180 + index * 40 }),
          withTiming(baseHeight * 0.7, { duration: 160 + index * 20 })
        ),
        -1, // 무한 반복
        true // 역방향(요요) 적용
      );
    } else {
      // 멈출 때는 부드럽게 300ms 동안 resting height로 하강합니다.
      height.value = withTiming(12, { duration: 300 });
    }
  }, [isPlaying, baseHeight, index, height]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      height: height.value,
      backgroundColor: isPlaying ? '#3B82F6' : '#94A3B8',
    };
  });

  return <Animated.View style={[styles.waveBar, animatedStyle]} />;
}

export default function AudioPlayerScreen() {
  const {
    activeTrack,
    playbackState,
    rate,
    positionMillis,
    durationMillis,
    isBusy,
    togglePlayback,
    jump,
    setRate,
  } = useAudioStore();

  const [sliderWidth, setSliderWidth] = useState(1);

  if (!activeTrack) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>오디오 플레이어</Text>
        </View>
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconBg}>
            <Ionicons name="disc-outline" size={54} color="#3B82F6" />
          </View>
          <Text style={styles.emptyTitle}>재생 중인 학습 캐스트가 없습니다</Text>
          <Text style={styles.emptySubtitle}>
            첫 번째 홈 보관함 탭에서 원하는 학습 카드를 선택하고 팟캐스트 재생을 시작해 보세요!
          </Text>
          <Pressable
            onPress={() => router.push('/(tabs)')}
            style={({ pressed }) => [styles.emptyButton, pressed && styles.controlPressed]}
          >
            <Ionicons name="home-outline" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={styles.emptyButtonText}>보관함으로 이동하기</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const isLoading = isBusy || playbackState === 'loading';
  const isPlaying = playbackState === 'playing';

  const title = activeTrack.title;
  const subtitle = activeTrack.artist;
  const durationSeconds = durationMillis > 0 ? durationMillis / 1000 : activeTrack.duration;
  const positionSeconds = positionMillis / 1000;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const remainingSeconds = Math.max(durationSeconds - positionSeconds, 0);

  const progressRatio = durationSeconds > 0 ? Math.min(positionSeconds / durationSeconds, 1) : 0;

  // 시간 포맷팅 함수 (분:초)
  const formatTime = (secs: number) => {
    if (!Number.isFinite(secs) || secs < 0) return '00:00';
    const rounded = Math.floor(secs);
    const m = Math.floor(rounded / 60);
    const s = rounded % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // 슬라이더 클릭 시 원하는 위치로 이동
  const handleSeek = (event: GestureResponderEvent) => {
    const locationX = event.nativeEvent.locationX;
    const seekRatio = Math.min(Math.max(locationX / sliderWidth, 0), 1);
    const targetPositionSeconds = seekRatio * durationSeconds;
    void useAudioStore.getState().seek(targetPositionSeconds);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>오디오 플레이어</Text>
      </View>

      <View style={styles.content}>
        {/* 음파 비주얼라이저 스타일의 커버 아트 */}
        <View style={styles.coverCard}>
          <View style={[styles.glowCircle, isPlaying && styles.glowCirclePlaying]} />
          <View style={styles.audioWaveContainer}>
            {/* 플레이 상태일 때 활발하게 음파가 도드라지는 듯한 디자인 모사 */}
            {[24, 48, 72, 96, 80, 56, 32, 60, 40].map((baseHeight, index) => (
              <VisualizerBar
                key={index}
                index={index}
                isPlaying={isPlaying}
                baseHeight={baseHeight}
              />
            ))}
          </View>
        </View>

        {/* 오디오 메타 정보 */}
        <View style={styles.metaContainer}>
          <Text style={styles.title} numberOfLines={2}>
            {title}
          </Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>

        {/* 재생 바 및 남은 시간, 전체 시간 표시기 */}
        <View style={styles.sliderContainer}>
          <Pressable
            accessibilityLabel="재생 위치 이동"
            accessibilityRole="adjustable"
            onLayout={(e) => setSliderWidth(e.nativeEvent.layout.width)}
            onPress={handleSeek}
            style={styles.sliderTrack}
          >
            <View style={[styles.sliderFill, { width: `${progressRatio * 100}%` }]} />
            <View style={[styles.sliderThumb, { left: `${progressRatio * 100}%` }]} />
          </Pressable>

          <View style={styles.timeInfoRow}>
            {/* 경과 시간 */}
            <View style={styles.timeBox}>
              <Text style={styles.timeValue}>{formatTime(positionSeconds)}</Text>
            </View>

            {/* 전체 시간 */}
            <View style={[styles.timeBox, styles.timeBoxEnd]}>
              <Text style={styles.timeValue}>{formatTime(durationSeconds)}</Text>
            </View>
          </View>
        </View>

        {/* 메인 컨트롤러 (10초 전, 재생/일시정지, 10초 후) */}
        <View style={styles.controlRow}>
          {/* 10초 전으로 되돌리기 */}
          <Pressable
            onPress={() => jump(-10)}
            style={({ pressed }) => [styles.secondaryControl, pressed && styles.controlPressed]}
          >
            <Ionicons name="play-skip-back" size={24} color="#1E293B" />
          </Pressable>

          {/* 재생 / 일시정지 */}
          <Pressable
            onPress={() => togglePlayback()}
            disabled={isLoading}
            style={({ pressed }) => [styles.primaryControl, pressed && styles.controlPressed]}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" size="large" />
            ) : (
              <Ionicons name={isPlaying ? 'pause' : 'play'} size={38} color="#FFFFFF" style={isPlaying ? null : styles.playIconOffset} />
            )}
          </Pressable>

          {/* 10초 후로 넘기기 */}
          <Pressable
            onPress={() => jump(10)}
            style={({ pressed }) => [styles.secondaryControl, pressed && styles.controlPressed]}
          >
            <Ionicons name="play-skip-forward" size={24} color="#1E293B" />
          </Pressable>
        </View>

        {/* 배속 버튼 세트 */}
        <View style={styles.speedContainer}>
          <Text style={styles.speedSectionLabel}>재생 속도 설정</Text>
          <View style={styles.speedRow}>
            {PLAYBACK_RATES.map((playbackRate) => {
              const isSelected = playbackRate === rate;
              return (
                <Pressable
                  key={playbackRate}
                  onPress={() => setRate(playbackRate)}
                  style={({ pressed }) => [
                    styles.speedButton,
                    isSelected && styles.speedButtonSelected,
                    pressed && styles.controlPressed,
                  ]}
                >
                  <Text style={[styles.speedText, isSelected && styles.speedTextSelected]}>
                    {playbackRate}x
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 10,
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#3B82F6',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
    fontFamily: Fonts.rounded,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: Fonts.rounded,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 10,
  },
  coverCard: {
    width: '100%',
    aspectRatio: 1.2,
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 4,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  glowCircle: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#3B82F610',
    transform: [{ scale: 0.8 }],
  },
  glowCirclePlaying: {
    backgroundColor: '#3B82F618',
    transform: [{ scale: 1.15 }],
  },
  audioWaveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 120,
  },
  waveBar: {
    width: 6,
    borderRadius: 3,
    backgroundColor: '#3B82F6',
  },
  metaContainer: {
    alignItems: 'center',
    marginTop: 10,
    width: '100%',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 6,
    paddingHorizontal: 16,
    lineHeight: 28,
    fontFamily: Fonts.rounded,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#64748B',
    fontFamily: Fonts.rounded,
  },
  sliderContainer: {
    width: '100%',
    marginTop: 16,
  },
  sliderTrack: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    width: '100%',
    position: 'relative',
    justifyContent: 'center',
  },
  sliderFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 4,
    position: 'absolute',
  },
  sliderThumb: {
    position: 'absolute',
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FFFFFF',
    borderWidth: 4,
    borderColor: '#3B82F6',
    marginLeft: -9,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  timeInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingHorizontal: 2,
  },
  timeBox: {
    flex: 1,
  },
  timeBoxCenter: {
    alignItems: 'center',
  },
  timeBoxEnd: {
    alignItems: 'flex-end',
  },
  timeLabel: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 4,
    fontFamily: Fonts.rounded,
  },
  timeValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
    fontFamily: Fonts.rounded,
    opacity: 0.5
  },
  timeValueRemaining: {
    color: '#3B82F6',
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 32,
    marginTop: 10,
  },
  primaryControl: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 5,
  },
  playIconOffset: {
    marginLeft: 4,
  },
  secondaryControl: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlSubText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748B',
    marginTop: -2,
    fontFamily: Fonts.rounded,
  },
  controlPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.95 }],
  },
  speedContainer: {
    width: '100%',
    marginTop: 20,
  },
  speedSectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase',
    marginBottom: 10,
    textAlign: 'center',
    fontFamily: Fonts.rounded,
  },
  speedRow: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 4,
    width: '100%',
  },
  speedButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  speedButtonSelected: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  speedText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
    fontFamily: Fonts.rounded,
  },
  speedTextSelected: {
    color: '#1E293B',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingBottom: 60,
  },
  emptyIconBg: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 3,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 10,
    textAlign: 'center',
    fontFamily: Fonts.rounded,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
    fontFamily: Fonts.rounded,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    borderRadius: 14,
    paddingHorizontal: 20,
    paddingVertical: 14,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  emptyButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: Fonts.rounded,
  },
});
