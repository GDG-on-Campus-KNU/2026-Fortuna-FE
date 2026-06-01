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
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useContents } from '@/src/entities/content/hooks';
import type {
  AudioFormat,
  Content,
  TtsVoice,
} from '@/src/entities/content/model';
import { contentRepository } from '@/src/entities/content/repository';
import { useAudioStore, type AudioTrack } from '@/src/features/audio';
import { Fonts, Palette } from '@/src/shared/constants/theme';

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

  const [isModalVisible, setIsModalVisible] = React.useState(false);
  const [notebookTitle, setNotebookTitle] = React.useState('');
  const [isCreating, setIsCreating] = React.useState(false);

  const getFormatDetails = (format: AudioFormat) => {
    switch (format) {
      case 'dialog':
        return {
          label: '대화형',
          icon: 'people-outline' as const,
          color: Palette.formatDialog,
          bg: Palette.formatDialogBg,
        };
      case 'quiz':
        return {
          label: '퀴즈형',
          icon: 'help-circle-outline' as const,
          color: Palette.formatQuiz,
          bg: Palette.formatQuizBg,
        };
      case 'story':
        return {
          label: '스토리',
          icon: 'book-outline' as const,
          color: Palette.formatStory,
          bg: Palette.formatStoryBg,
        };
      default:
        return {
          label: '기타',
          icon: 'document-text-outline' as const,
          color: Palette.formatOther,
          bg: Palette.formatOtherBg,
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
    setNotebookTitle('');
    setIsModalVisible(true);
  };

  const handleConfirmCreate = async () => {
    if (!notebookTitle.trim()) {
      Alert.alert('알림', '노트북 이름을 입력해 주세요.');
      return;
    }

    setIsCreating(true);
    try {
      await contentRepository.create(notebookTitle.trim());
      setIsModalVisible(false);
      refresh();
      Alert.alert('성공', '새 노트북이 성공적으로 생성되었습니다!');
    } catch (err) {
      console.error('[HomeScreen] 노트북 생성 오류:', err);
      Alert.alert('오류', '노트북 생성에 실패했습니다.');
    } finally {
      setIsCreating(false);
    }
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
              color={Palette.textPrimary}
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
          <Ionicons name="bulb" size={32} color={Palette.primary} />
        </View>

        <View style={styles.notebookTextContainer}>
          <Text style={styles.notebookTitle} numberOfLines={2}>
            {item.title}
          </Text>

          {isGenerating ? (
            <View style={styles.statusRow}>
              <ActivityIndicator
                size="small"
                color={Palette.warning}
                style={styles.spinner}
              />
              <Text style={styles.statusTextGenerating}>생성 중</Text>
            </View>
          ) : isDone ? (
            <Text style={styles.notebookDate}>{mockDate}</Text>
          ) : (
            <View style={styles.statusRow}>
              <Ionicons name="alert-circle" size={14} color={Palette.error} />
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
      {/* 새 노트북 생성 모달 */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => {
          if (!isCreating) setIsModalVisible(false);
        }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <BlurView
            intensity={30}
            tint="dark"
            style={StyleSheet.absoluteFillObject}
          />
          <Pressable
            style={StyleSheet.absoluteFillObject}
            onPress={() => {
              if (!isCreating) setIsModalVisible(false);
            }}
          />

          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>새 노트북 생성</Text>
            <Text style={styles.modalSubtitle}>
              노트북 이름을 입력하여 공부를 시작해 보세요!
            </Text>

            <TextInput
              style={styles.modalInput}
              placeholder="노트북 이름 (예: 알고리즘 시험 대비)"
              placeholderTextColor={Palette.textMuted}
              value={notebookTitle}
              onChangeText={setNotebookTitle}
              autoFocus={true}
              maxLength={30}
              editable={!isCreating}
            />

            <View style={styles.modalButtons}>
              <Pressable
                onPress={() => setIsModalVisible(false)}
                style={({ pressed }) => [
                  styles.modalButton,
                  styles.modalButtonCancel,
                  pressed && styles.buttonPressed,
                ]}
                disabled={isCreating}
              >
                <Text style={styles.modalButtonTextCancel}>취소</Text>
              </Pressable>

              <Pressable
                onPress={handleConfirmCreate}
                style={({ pressed }) => [
                  styles.modalButton,
                  styles.modalButtonConfirm,
                  pressed && styles.buttonPressed,
                  (!notebookTitle.trim() || isCreating) &&
                    styles.modalButtonDisabled,
                ]}
                disabled={!notebookTitle.trim() || isCreating}
              >
                {isCreating ? (
                  <ActivityIndicator size="small" color={Palette.bgCard} />
                ) : (
                  <Text style={styles.modalButtonTextConfirm}>생성</Text>
                )}
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* 백그라운드 피그마 소프트 블루 그라데이션 */}
      <LinearGradient
        colors={[Palette.primaryLight, Palette.bgPage]}
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
              colors={[Palette.primary]}
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
          <Ionicons name="person" size={22} color={Palette.textPrimary} />
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
                <Ionicons name="bulb" size={20} color={Palette.primary} />
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
                color={Palette.primary}
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
    backgroundColor: Palette.bgPage,
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
    color: Palette.textPrimary,
    fontFamily: Fonts.googleSansFlexBold,
    letterSpacing: -0.5,
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Palette.bgControl,
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
    backgroundColor: Palette.primaryHover,
    width: CARD_SIZE,
    height: CARD_SIZE,
    borderRadius: 32,
    padding: 16,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  cardPressed: {
    transform: [{ scale: 0.98 }],
    backgroundColor: Palette.primaryHover,
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
    color: Palette.textPrimary,
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
    color: Palette.textPrimary,
    fontFamily: Fonts.pretendardSemiBold,
    lineHeight: 20,
  },
  notebookDate: {
    fontSize: 13,
    color: Palette.textPrimary,
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
    color: Palette.warningDark,
    fontFamily: Fonts.pretendardBold,
  },
  statusTextFailed: {
    fontSize: 11,
    fontWeight: 'bold',
    color: Palette.errorDark,
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
    borderColor: Palette.primaryBorder,
  },
  nowPlayingBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: Palette.primaryFill,
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
    backgroundColor: Palette.bgCard,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nowPlayingInfo: {
    justifyContent: 'center',
    flex: 1,
  },
  nowPlayingLabel: {
    fontSize: 13,
    color: Palette.textPrimary,
    opacity: 0.5,
    fontFamily: Fonts.pretendardRegular,
  },
  nowPlayingTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: Palette.textPrimary,
    fontFamily: Fonts.pretendardMedium,
  },
  playButton: {
    padding: 4,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: Palette.bgCard,
    width: '100%',
    maxWidth: 340,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: Palette.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Palette.textPrimary,
    fontFamily: Fonts.pretendardBold,
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: Palette.textSecondary,
    fontFamily: Fonts.pretendardRegular,
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 20,
  },
  modalInput: {
    backgroundColor: Palette.primaryMuted,
    borderWidth: 1.5,
    borderColor: Palette.primaryBorder,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 50,
    fontSize: 15,
    fontFamily: Fonts.pretendardMedium,
    color: Palette.textPrimary,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: Palette.bgAlt,
  },
  modalButtonConfirm: {
    backgroundColor: Palette.primary,
  },
  modalButtonDisabled: {
    backgroundColor: Palette.primaryDisabled,
  },
  modalButtonTextCancel: {
    fontSize: 15,
    fontWeight: '600',
    color: Palette.textSecondary,
    fontFamily: Fonts.pretendardSemiBold,
  },
  modalButtonTextConfirm: {
    fontSize: 15,
    fontWeight: '600',
    color: Palette.bgCard,
    fontFamily: Fonts.pretendardSemiBold,
  },
});
