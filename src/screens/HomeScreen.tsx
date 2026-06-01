import { Ionicons } from '@expo/vector-icons';
import MaskedView from '@react-native-masked-view/masked-view';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useContents } from '@/src/entities/content/hooks';
import type {
  AudioFormat,
  Content,
  TtsVoice,
} from '@/src/entities/content/model';
import { useAudioStore, type AudioTrack } from '@/src/features/audio';
import { Fonts } from '@/src/shared/constants/theme';

const { width } = Dimensions.get('window');
const CARD_MARGIN = 12;
const CARD_SIZE = (width - 48 - CARD_MARGIN) / 2; // 가로 마진 24*2 = 48 제외 후 2등분

type GridItem = Content | { id: string; isAddCard: boolean };

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { data: contents, loading, refresh } = useContents();
  const initAudio = useAudioStore((state) => state.init);
  const activeTrack = useAudioStore((state) => state.activeTrack);
  const playbackState = useAudioStore((state) => state.playbackState);
  const togglePlayback = useAudioStore((state) => state.togglePlayback);

  const getFormatDetails = (format: AudioFormat) => {
    switch (format) {
      case 'dialog':
        return {
          label: '대화형',
          icon: 'people-outline' as const,
          color: '#3B82F6',
          bg: '#EFF6FF',
        };
      case 'quiz':
        return {
          label: '퀴즈형',
          icon: 'help-circle-outline' as const,
          color: '#10B981',
          bg: '#ECFDF5',
        };
      case 'story':
        return {
          label: '스토리',
          icon: 'book-outline' as const,
          color: '#8B5CF6',
          bg: '#F5F3FF',
        };
      default:
        return {
          label: '기타',
          icon: 'document-text-outline' as const,
          color: '#6B7280',
          bg: '#F3F4F6',
        };
    }
  };

  const getVoiceDetails = (voice: TtsVoice) => {
    switch (voice) {
      case 'professor':
        return { label: '교수', emoji: '👨‍🏫' };
      case 'friend':
        return { label: '친구', emoji: '🧑‍🤝‍🧑' };
      case 'coach':
        return { label: '도전(화난)', emoji: '🔥' };
      case 'whisper':
        return { label: '속삭임', emoji: '🤫' };
      default:
        return { label: 'TTS 목소리', emoji: '🎙️' };
    }
  };

  const handlePlayContent = async (item: Content) => {
    if (item.status !== 'done' || !item.audioUrl) return;

    const track: AudioTrack = {
      id: item.id,
      url: item.audioUrl,
      title: item.title,
      artist: getVoiceDetails(item.ttsVoice).label,
      album: getFormatDetails(item.format).label,
      duration: item.duration * 60, // 분 -> 초
      description: item.script || 'AI가 생성한 고품격 맞춤 팟캐스트입니다.',
    };

    try {
      await initAudio(track);
      const state = useAudioStore.getState();
      if (state.playbackState !== 'playing') {
        await state.togglePlayback();
      }
      router.push('/player');
    } catch (err) {
      console.error('오디오 초기화 오류:', err);
    }
  };

  const handleProfilePress = () => {
    Alert.alert('로그아웃', '정말 로그아웃 하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '로그아웃',
        style: 'destructive',
        onPress: () => {
          router.replace('/signin');
        },
      },
    ]);
  };

  const handleCreateNewNotebook = () => {
    router.push('/create');
  };

  const renderGridItem = ({ item }: { item: GridItem }) => {
    if ('isAddCard' in item) {
      // "+ 새 노트북" 카드
      return (
        <Pressable
          onPress={handleCreateNewNotebook}
          style={({ pressed }) => [
            styles.card,
            styles.addCard,
            pressed && styles.cardPressed,
          ]}
        >
          <View style={styles.addIconContainer}>
            <Ionicons
              name="add"
              size={24}
              color="#100C08"
              style={{ opacity: 0.9 }}
            />
          </View>
          <Text style={(styles.addCardText, { paddingEnd: 8 })}>새 노트북</Text>
        </Pressable>
      );
    }

    // 일반 노트북 카드
    const isDone = item.status === 'done';
    const isGenerating = item.status === 'generating';
    const mockDate = '2026. 5. 26.';

    return (
      <Pressable
        onPress={() =>
          router.push({ pathname: '/notebook/[id]', params: { id: item.id } })
        }
        style={({ pressed }) => [
          styles.card,
          pressed && isDone && styles.cardPressed,
          !isDone && styles.cardDisabled,
        ]}
        disabled={!isDone}
      >
        <View style={styles.notebookIconBg}>
          <Ionicons name="bulb" size={32} color="#1E6AF4" />
        </View>

        <View style={styles.notebookTextContainer}>
          <Text style={styles.notebookTitle} numberOfLines={2}>
            {item.title}
          </Text>

          {isGenerating ? (
            <View style={styles.statusRow}>
              <ActivityIndicator
                size="small"
                color="#F59E0B"
                style={styles.spinner}
              />
              <Text style={styles.statusTextGenerating}>생성 중</Text>
            </View>
          ) : isDone ? (
            <Text style={styles.notebookDate}>{mockDate}</Text>
          ) : (
            <View style={styles.statusRow}>
              <Ionicons name="alert-circle" size={14} color="#EF4444" />
              <Text style={styles.statusTextFailed}>실패</Text>
            </View>
          )}
        </View>
      </Pressable>
    );
  };

  // 기존 콘텐츠 목록 뒤에 "+ 새 노트북" 카드를 추가해 그리드 데이터 생성
  const gridData: GridItem[] = [
    ...(contents || []),
    { id: 'add-new-notebook', isAddCard: true },
  ];

  return (
    <View style={styles.container}>
      {/* 백그라운드 피그마 소프트 블루 그라데이션 */}
      <LinearGradient
        colors={['#EBF2FE', '#FDFDFD']}
        style={StyleSheet.absoluteFillObject}
      />

      {/* 마스킹된 그리드 목록 */}
      <MaskedView
        style={styles.maskedView}
        maskElement={
          <View style={StyleSheet.absoluteFillObject}>
            {/* 1. 상단 투명 영역 (헤더 영역: 완전히 가려짐) */}
            <View style={{ height: insets.top + 68 }} />

            {/* 2. 그라데이션 페이드 영역 (점점 나타남) */}
            <LinearGradient
              colors={['rgba(0, 0, 0, 0)', '#000000']}
              style={{ height: 40 }}
            />

            {/* 3. 하단 불투명 영역 (정상적으로 보임) */}
            <View style={{ flex: 1, backgroundColor: '#000000' }} />
          </View>
        }
      >
        <FlatList
          data={gridData}
          renderItem={renderGridItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={[
            styles.listContainer,
            {
              paddingTop: insets.top + 108, // 헤더 높이만큼 상단 여백 확보
              paddingBottom: insets.bottom + (activeTrack ? 100 : 24),
            },
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={loading && (contents || []).length > 0}
              onRefresh={refresh}
              colors={['#1E6AF4']}
              progressViewOffset={insets.top + 108} // pull-to-refresh spinner sits below header
            />
          }
        />
      </MaskedView>

      {/* 상단 헤더 */}
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + 20,
          },
        ]}
        pointerEvents="box-none"
      >
        <Text style={styles.headerTitle}>Studycast</Text>
        <Pressable
          onPress={handleProfilePress}
          style={({ pressed }) => [
            styles.profileButton,
            pressed && styles.buttonPressed,
          ]}
        >
          <Ionicons name="person" size={22} color="#100C08" />
        </Pressable>
      </View>

      {/* 현재 재생 중인 미니 플레이어 바 */}
      {activeTrack && (
        <Pressable
          onPress={() => router.push('/player')}
          style={({ pressed }) => [
            styles.nowPlayingBarContainer,
            { bottom: insets.bottom + 16 },
            pressed && styles.nowPlayingBarPressed,
          ]}
        >
          {/* 1. 백그라운드 블러 레이어 */}
          <BlurView
            intensity={50}
            tint="light"
            experimentalBlurMethod="dimezisBlurView"
            style={StyleSheet.absoluteFillObject}
          />

          {/* 2. 선명하게 유지할 콘텐츠 레이어 */}
          <View style={styles.nowPlayingBarContent}>
            <View style={styles.nowPlayingLeft}>
              <View style={styles.nowPlayingThumb}>
                <Ionicons name="bulb" size={20} color="#1E6AF4" />
              </View>
              <View style={styles.nowPlayingInfo}>
                <Text style={styles.nowPlayingLabel}>현재 재생 중</Text>
                <Text style={styles.nowPlayingTitle} numberOfLines={1}>
                  {activeTrack.title}
                </Text>
              </View>
            </View>
            <Pressable
              onPress={togglePlayback}
              style={({ pressed }) => [
                styles.playButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <Ionicons
                name={playbackState === 'playing' ? 'pause' : 'play'}
                size={24}
                color="#1E6AF4"
              />
            </Pressable>
          </View>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFDFD',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 16,
    zIndex: 10,
  },
  maskedView: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 40,
    color: '#100C08',
    fontFamily: Fonts.googleSansFlexBold,
    letterSpacing: -0.5,
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(16, 12, 8, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.96 }],
  },
  listContainer: {
    paddingHorizontal: 24,
    paddingBottom: 100, // 미니 플레이어가 겹치지 않게 여유 공간 부여
    flexGrow: 1,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: CARD_MARGIN,
  },
  card: {
    backgroundColor: 'rgba(30, 106, 244, 0.05)',
    width: CARD_SIZE,
    height: CARD_SIZE,
    borderRadius: 32,
    padding: 16,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  cardPressed: {
    transform: [{ scale: 0.98 }],
    backgroundColor: 'rgba(30, 106, 244, 0.08)',
  },
  cardDisabled: {
    opacity: 0.8,
  },
  addCard: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 0,
  },
  addIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addCardText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#100C08',
    opacity: 0.9,
    fontFamily: Fonts.pretendardMedium,
    textAlign: 'center',
  },
  notebookIconBg: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notebookTextContainer: {
    gap: 4,
  },
  notebookTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#100C08',
    fontFamily: Fonts.pretendardSemiBold,
    lineHeight: 20,
  },
  notebookDate: {
    fontSize: 13,
    color: '#100C08',
    opacity: 0.5,
    fontFamily: Fonts.pretendardRegular,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  spinner: {
    transform: [{ scale: 0.8 }],
  },
  statusTextGenerating: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#D97706',
    fontFamily: Fonts.pretendardBold,
  },
  statusTextFailed: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#DC2626',
    fontFamily: Fonts.pretendardBold,
  },
  nowPlayingBarContainer: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(30, 106, 244, 0.12)',
  },
  nowPlayingBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: 'rgba(30, 106, 244, 0.06)',
  },
  nowPlayingBarPressed: {
    opacity: 0.85,
  },
  nowPlayingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  nowPlayingThumb: {
    width: 40,
    height: 40,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nowPlayingInfo: {
    justifyContent: 'center',
    flex: 1,
  },
  nowPlayingLabel: {
    fontSize: 13,
    color: '#100C08',
    opacity: 0.5,
    fontFamily: Fonts.pretendardRegular,
  },
  nowPlayingTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#100C08',
    fontFamily: Fonts.pretendardMedium,
  },
  playButton: {
    padding: 4,
  },
});
