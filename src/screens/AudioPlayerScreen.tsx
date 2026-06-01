import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState, useRef } from 'react';
import {
  ActivityIndicator,
  GestureResponderEvent,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Animated,
  PanResponder,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PLAYBACK_RATES, useAudioStore } from '@/src/features/audio';
import { Fonts } from '@/src/shared/constants/theme';

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
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Drag down to dismiss gesture setup
  const translateY = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: (evt, gestureState) => {
        const { pageY } = evt.nativeEvent;
        // Only trigger from upper area of the screen (excluding the scroll content and bottom controls)
        return pageY < 200;
      },
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        const { pageY } = evt.nativeEvent;
        const { dy, dx } = gestureState;
        // Respond to downward dragging in the top area
        return pageY < 200 && dy > 10 && Math.abs(dy) > Math.abs(dx) * 2;
      },
      onPanResponderMove: (evt, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dy > 120 || gestureState.vy > 0.5) {
          Animated.timing(translateY, {
            toValue: 1000,
            duration: 250,
            useNativeDriver: true,
          }).start(() => {
            router.back();
            translateY.setValue(0);
          });
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            tension: 40,
            friction: 7,
          }).start();
        }
      },
    }),
  ).current;

  // Backdrop opacity interpolation based on drag distance
  const backdropOpacity = translateY.interpolate({
    inputRange: [0, 300],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  if (!activeTrack) {
    return (
      <View style={styles.container}>
        {/* Dynamic Dimming Backdrop */}
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: 'rgba(0, 0, 0, 0.4)',
              opacity: backdropOpacity,
            },
          ]}
        />
        <Animated.View
          style={[styles.animatedContainer, { transform: [{ translateY }] }]}
          {...panResponder.panHandlers}
        >
          <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
            {/* Drag Handle */}
            <View style={styles.dragHandleContainer}>
              <View style={styles.dragHandle} />
            </View>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>오디오 플레이어</Text>
            </View>
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconBg}>
                <Ionicons name="disc-outline" size={54} color="#1E6AF4" />
              </View>
              <Text style={styles.emptyTitle}>
                재생 중인 학습 캐스트가 없습니다
              </Text>
              <Text style={styles.emptySubtitle}>
                첫 번째 홈 보관함 탭에서 원하는 학습 카드를 선택하고 팟캐스트
                재생을 시작해 보세요!
              </Text>
              <Pressable
                onPress={() => router.push('/')}
                style={({ pressed }) => [
                  styles.emptyButton,
                  pressed && styles.controlPressed,
                ]}
              >
                <Ionicons
                  name="home-outline"
                  size={18}
                  color="#FFFFFF"
                  style={{ marginRight: 6 }}
                />
                <Text style={styles.emptyButtonText}>보관함으로 이동하기</Text>
              </Pressable>
            </View>
          </SafeAreaView>
        </Animated.View>
      </View>
    );
  }

  const isLoading = isBusy || playbackState === 'loading';
  const isPlaying = playbackState === 'playing';

  const title = activeTrack.title;
  const subtitle = activeTrack.artist;
  const durationSeconds =
    durationMillis > 0 ? durationMillis / 1000 : activeTrack.duration;
  const positionSeconds = positionMillis / 1000;

  const progressRatio =
    durationSeconds > 0 ? Math.min(positionSeconds / durationSeconds, 1) : 0;

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

  // 10분 · 교수 형식으로 자막 가공
  const durationMin = Math.max(Math.round(durationSeconds / 60), 1);
  const voiceLabel = subtitle ? subtitle.split(' ')[0] || '' : '교수';
  const formattedSubtitle = `${durationMin}분 · ${voiceLabel}`;

  return (
    <View style={styles.container}>
      {/* Dynamic Dimming Backdrop */}
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            opacity: backdropOpacity,
          },
        ]}
      />
      <Animated.View
        style={[styles.animatedContainer, { transform: [{ translateY }] }]}
        {...panResponder.panHandlers}
      >
        <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
          {/* Drag Handle */}
          <View style={styles.dragHandleContainer}>
            <View style={styles.dragHandle} />
          </View>

          {/* 1. Header Layout */}
          <View style={styles.header}>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle} numberOfLines={2}>
                {title}
              </Text>
              <Text style={styles.headerSubtitle}>{formattedSubtitle}</Text>
            </View>
            <Pressable
              onPress={() => setIsModalVisible(true)}
              style={({ pressed }) => [
                styles.moreButton,
                pressed && styles.controlPressed,
              ]}
            >
              <Ionicons name="ellipsis-horizontal" size={24} color="#100C08" />
            </Pressable>
          </View>

          {/* 2. Scrollable Transcript Card */}
          <View style={styles.transcriptCard}>
            <ScrollView
              showsVerticalScrollIndicator={true}
              contentContainerStyle={styles.transcriptScrollContent}
            >
              <Text style={styles.transcriptText}>
                {activeTrack.description || '작성된 대본이 없습니다.'}
              </Text>
            </ScrollView>
          </View>

          {/* 3. Time Labels & Seekbar (Time Row is ABOVE Progress Track) */}
          <View style={styles.sliderContainer}>
            <View style={styles.timeInfoRow}>
              <Text style={styles.timeValue}>
                {formatTime(positionSeconds)}
              </Text>
              <Text style={styles.timeValue}>
                {formatTime(durationSeconds)}
              </Text>
            </View>

            <Pressable
              accessibilityLabel="재생 위치 이동"
              accessibilityRole="adjustable"
              onLayout={(e) => setSliderWidth(e.nativeEvent.layout.width)}
              onPress={handleSeek}
              style={styles.sliderTrack}
            >
              <View
                style={[
                  styles.sliderFill,
                  { width: `${progressRatio * 100}%` },
                ]}
              />
              <View
                style={[
                  styles.sliderThumb,
                  { left: `${progressRatio * 100}%` },
                ]}
              />
            </Pressable>
          </View>

          {/* 4. Controls Row (Shuffle, Replay 10, Play/Pause, Forward 10, Repeat) */}
          <View style={styles.controlRow}>
            <Pressable
              onPress={() => setIsShuffle(!isShuffle)}
              style={({ pressed }) => [
                styles.iconControl,
                pressed && styles.controlPressed,
              ]}
            >
              <Ionicons
                name="shuffle"
                size={24}
                color={isShuffle ? '#1E6AF4' : '#100C08'}
              />
            </Pressable>

            <Pressable
              onPress={() => jump(-10)}
              style={({ pressed }) => [
                styles.circleControl,
                pressed && styles.controlPressed,
              ]}
            >
              <MaterialIcons
                name={'replay-10' as any}
                size={24}
                color="#100C08"
              />
            </Pressable>

            <Pressable
              onPress={() => togglePlayback()}
              disabled={isLoading}
              style={({ pressed }) => [
                styles.primaryControl,
                pressed && styles.controlPressed,
              ]}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Ionicons
                  name={isPlaying ? 'pause' : 'play'}
                  size={28}
                  color="#FFFFFF"
                  style={isPlaying ? null : styles.playIconOffset}
                />
              )}
            </Pressable>

            <Pressable
              onPress={() => jump(10)}
              style={({ pressed }) => [
                styles.circleControl,
                pressed && styles.controlPressed,
              ]}
            >
              <MaterialIcons
                name={'forward-10' as any}
                size={24}
                color="#100C08"
              />
            </Pressable>

            <Pressable
              onPress={() => setIsRepeat(!isRepeat)}
              style={({ pressed }) => [
                styles.iconControl,
                pressed && styles.controlPressed,
              ]}
            >
              <Ionicons
                name="repeat"
                size={24}
                color={isRepeat ? '#1E6AF4' : '#100C08'}
              />
            </Pressable>
          </View>

          {/* 5. More Options Modal (Bottom Sheet for Playback Speed) */}
          <Modal
            animationType="slide"
            transparent={true}
            visible={isModalVisible}
            onRequestClose={() => setIsModalVisible(false)}
          >
            <Pressable
              style={styles.modalOverlay}
              onPress={() => setIsModalVisible(false)}
            >
              <View
                style={styles.modalContent}
                onStartShouldSetResponder={() => true}
              >
                <View style={styles.modalHeaderHandle} />
                <Text style={styles.modalTitle}>재생 속도 설정</Text>

                <View style={styles.speedRow}>
                  {PLAYBACK_RATES.map((playbackRate) => {
                    const isSelected = playbackRate === rate;
                    return (
                      <Pressable
                        key={playbackRate}
                        onPress={() => {
                          void setRate(playbackRate);
                          setIsModalVisible(false);
                        }}
                        style={({ pressed }) => [
                          styles.speedButton,
                          isSelected && styles.speedButtonSelected,
                          pressed && styles.controlPressed,
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

                <Pressable
                  onPress={() => setIsModalVisible(false)}
                  style={({ pressed }) => [
                    styles.modalCloseButton,
                    pressed && styles.controlPressed,
                  ]}
                >
                  <Text style={styles.modalCloseButtonText}>닫기</Text>
                </Pressable>
              </View>
            </Pressable>
          </Modal>
        </SafeAreaView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  animatedContainer: {
    flex: 1,
    backgroundColor: '#EBF2FE',
    overflow: 'hidden',
  },
  dragHandleContainer: {
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 4,
  },
  dragHandle: {
    width: 36,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: 'rgba(16, 12, 8, 0.15)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
  },
  headerTextContainer: {
    flex: 1,
    paddingRight: 16,
  },
  headerTitle: {
    fontSize: 28,
    color: '#100C08',
    fontFamily: Fonts.pretendardBold,
    lineHeight: 34,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#100C08',
    opacity: 0.5,
    fontFamily: Fonts.pretendardRegular,
    marginTop: 6,
  },
  moreButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  transcriptCard: {
    flex: 1,
    backgroundColor: '#FDFDFD',
    borderRadius: 16,
    marginHorizontal: 24,
    marginVertical: 8,
    overflow: 'hidden',
  },
  transcriptScrollContent: {
    padding: 20,
  },
  transcriptText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#100C08',
    fontFamily: Fonts.pretendardRegular,
  },
  sliderContainer: {
    width: '100%',
    paddingHorizontal: 24,
    marginTop: 24,
    marginBottom: 16,
  },
  timeInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  timeValue: {
    fontSize: 13,
    color: '#100C08',
    opacity: 0.5,
    fontFamily: Fonts.pretendardRegular,
  },
  sliderTrack: {
    height: 4,
    backgroundColor: 'rgba(16, 12, 8, 0.1)',
    borderRadius: 9999,
    width: '100%',
    position: 'relative',
    justifyContent: 'center',
  },
  sliderFill: {
    height: '100%',
    backgroundColor: '#1E6AF4',
    borderRadius: 9999,
    position: 'absolute',
  },
  sliderThumb: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#FFFFFF',
    borderWidth: 4,
    borderColor: '#1E6AF4',
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 32,
    paddingBottom: 40,
    paddingTop: 8,
  },
  iconControl: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleControl: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryControl: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1E6AF4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIconOffset: {
    marginLeft: 3,
  },
  controlPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.95 }],
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
    shadowColor: '#100C08',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 3,
    marginBottom: 28,
  },
  emptyTitle: {
    fontSize: 20,
    color: '#100C08',
    marginBottom: 10,
    textAlign: 'center',
    fontFamily: Fonts.pretendardBold,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#100C08',
    opacity: 0.5,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
    fontFamily: Fonts.pretendardRegular,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E6AF4',
    borderRadius: 14,
    paddingHorizontal: 20,
    paddingVertical: 14,
    shadowColor: '#1E6AF4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  emptyButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontFamily: Fonts.pretendardBold,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 12,
    alignItems: 'center',
  },
  modalHeaderHandle: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(16, 12, 8, 0.15)',
    borderRadius: 2,
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    color: '#100C08',
    fontFamily: Fonts.pretendardBold,
    marginBottom: 24,
  },
  speedRow: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 4,
    width: '100%',
    marginBottom: 24,
  },
  speedButton: {
    flex: 1,
    paddingVertical: 12,
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
    fontSize: 14,
    color: '#100C08',
    opacity: 0.5,
    fontFamily: Fonts.pretendardBold,
  },
  speedTextSelected: {
    opacity: 1,
    color: '#1E6AF4',
  },
  modalCloseButton: {
    width: '100%',
    paddingVertical: 14,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    fontSize: 15,
    color: '#100C08',
    fontFamily: Fonts.pretendardBold,
  },
});
