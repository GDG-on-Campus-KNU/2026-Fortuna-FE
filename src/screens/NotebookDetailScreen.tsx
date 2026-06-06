import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  useNotebook,
  notebookRepository,
  type Podcast,
  type Source,
} from '@/src/entities';
import { useAudioStore, type AudioTrack } from '@/src/features/audio';
import { Fonts, Palette } from '@/src/shared/constants/theme';

interface NotebookDetailScreenProps {
  id: string;
}

// Interface for lesson items (Library Tab)
interface LessonItem {
  id: string;
  title: string;
  duration: number; // minutes
  voiceLabel: string;
  ttsVoice: string;
  iconName: React.ComponentProps<typeof Ionicons>['name'] | any;
  audioUrl: string;
  description: string;
  formatLabel: string;
}

// Interface for files (File Tab)
interface FileItem {
  id: string;
  name: string;
  size: string;
}

export default function NotebookDetailScreen({
  id,
}: NotebookDetailScreenProps) {
  // Fetch current notebook metadata using new hook
  const {
    data: notebook,
    loading,
    error,
    refresh,
    refreshing,
  } = useNotebook(id);
  const initAudio = useAudioStore((state) => state.init);

  // States
  const [activeTab, setActiveTab] = useState<'library' | 'files'>('library');
  const [lessons, setLessons] = useState<LessonItem[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isAddingFile, setIsAddingFile] = useState(false);

  const getFormatLabel = (format: string) => {
    if (format === 'dialog') return '대화식 팟캐스트';
    if (format === 'quiz') return '퀴즈 팟캐스트';
    return '스토리텔링 팟캐스트';
  };

  const getVoiceLabel = (voice: string) => {
    if (voice === 'professor') return '교수';
    if (voice === 'friend') return '친구';
    if (voice === 'coach') return '스파르타';
    return '속삭임';
  };

  // Initialize data based on notebook loaded
  useEffect(() => {
    if (!notebook) return;

    setLessons(
      (notebook.podcasts || []).map((p) => ({
        id: p.id,
        title: p.title,
        duration: p.duration,
        voiceLabel: getVoiceLabel(p.ttsVoice),
        ttsVoice: p.ttsVoice,
        iconName:
          p.format === 'dialog'
            ? 'bulb-outline'
            : p.format === 'quiz'
              ? 'help-circle-outline'
              : 'book-outline',
        audioUrl: p.audioUrl || '',
        description: p.script,
        formatLabel: getFormatLabel(p.format),
      })),
    );

    setFiles(
      (notebook.sources || []).map((s) => ({
        id: s.id,
        name: s.name,
        size: '1.5 MB',
      })),
    );
  }, [notebook]);

  // Back Button Press
  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  // Play Lesson Track (Integrates with useAudioStore)
  const handlePlayLesson = async (item: LessonItem) => {
    if (!item.audioUrl) {
      Alert.alert('알림', '오디오가 아직 로드되지 않았습니다.');
      return;
    }

    const track: AudioTrack = {
      id: item.id,
      url: item.audioUrl,
      title: `${item.title}`,
      artist: `${item.voiceLabel} 톤 · StudyCast`,
      album: item.formatLabel,
      duration: item.duration * 60,
      description: item.description,
    };

    try {
      const isActiveRequest = await initAudio(track);
      if (!isActiveRequest) return;

      const state = useAudioStore.getState();
      if (
        state.activeTrack?.id === track.id &&
        state.playbackState !== 'playing'
      ) {
        await state.togglePlayback();
      }
      router.push('/player');
    } catch (err) {
      console.error('[NotebookDetailScreen] Audio initialization failed:', err);
      Alert.alert('오류', '오디오 파일을 로드할 수 없습니다.');
    }
  };

  // Delete PDF file
  const handleDeleteFile = (fileId: string, fileName: string) => {
    Alert.alert(
      '파일 삭제',
      `'${fileName}' 자료를 노트북에서 정말 삭제하시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              await notebookRepository.removeSource(id, fileId);
              setFiles((prev) => prev.filter((f) => f.id !== fileId));
            } catch (err) {
              console.error('Failed to delete file:', err);
            }
          },
        },
      ],
    );
  };

  // Create new podcast CTA
  const handleCreateNewPodcast = () => {
    router.push({ pathname: '/create', params: { notebookId: id } });
  };

  // Add new file simulator (simulating document picker)
  const handleAddNewFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'text/plain'],
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      const asset = result.assets[0];
      setIsAddingFile(true);

      const addedSource = await notebookRepository.addSource(
        id,
        asset.uri,
        asset.name,
        asset.mimeType || 'application/octet-stream',
      );

      const fileSizeMB = asset.size
        ? `${(asset.size / (1024 * 1024)).toFixed(1)} MB`
        : '1.5 MB';

      const newFile: FileItem = {
        id: addedSource.id,
        name: addedSource.name,
        size: fileSizeMB,
      };

      setFiles((prev) => [...prev, newFile]);
      Alert.alert(
        '업로드 완료',
        `'${asset.name}' 자료가 노트북 파일 목록에 성공적으로 업로드되었습니다.`,
      );
    } catch (err) {
      console.error('Failed to upload file:', err);
      Alert.alert('오류', '파일 업로드에 실패했습니다.');
    } finally {
      setIsAddingFile(false);
    }
  };

  // Loading Screen
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Palette.primary} />
        <Text style={styles.loadingText}>노트북 정보를 불러오는 중...</Text>
      </View>
    );
  }

  // Error Screen
  if (error || !notebook) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={48} color={Palette.error} />
        <Text style={styles.errorText}>
          노트북을 찾을 수 없거나 에러가 발생했습니다.
        </Text>
        <Pressable style={styles.backButtonAction} onPress={handleBack}>
          <Text style={styles.backButtonActionText}>돌아가기</Text>
        </Pressable>
      </View>
    );
  }

  // Render Podcast/Lesson list item (Library Tab)
  const renderLessonItem = ({ item }: { item: LessonItem }) => (
    <View style={styles.listItem} key={item.id}>
      <View style={styles.listItemLeft}>
        <View style={styles.iconContainer}>
          <Ionicons name={item.iconName} size={22} color={Palette.primary} />
        </View>
        <View style={styles.listItemTextContainer}>
          <Text style={styles.itemTitle}>{item.title}</Text>
          <Text style={styles.itemSubtitle}>
            {item.duration}분 · {item.voiceLabel}
          </Text>
        </View>
      </View>
      <Pressable
        onPress={() => handlePlayLesson(item)}
        style={({ pressed }) => [
          styles.playCircle,
          pressed && styles.circlePressed,
        ]}
      >
        <Ionicons
          name="play"
          size={16}
          color={Palette.primary}
          style={{ marginLeft: 2 }}
        />
      </Pressable>
    </View>
  );

  // Render PDF item (Files Tab)
  const renderFileItem = ({ item }: { item: FileItem }) => (
    <View style={styles.listItem} key={item.id}>
      <View style={styles.listItemLeft}>
        <View style={styles.fileIconContainer}>
          <Ionicons name="document-text" size={22} color={Palette.primary} />
        </View>
        <View style={styles.listItemTextContainer}>
          <Text style={styles.itemTitle} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.itemSubtitle}>{item.size} · PDF</Text>
        </View>
      </View>
      <Pressable
        onPress={() => handleDeleteFile(item.id, item.name)}
        style={({ pressed }) => [
          styles.closeCircle,
          pressed && styles.circlePressed,
        ]}
      >
        <Ionicons name="close" size={16} color={Palette.textSecondary} />
      </Pressable>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Background FigmaSoft Blue Gradient */}
      <LinearGradient
        colors={[Palette.primaryLight, Palette.bgPage]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Header Bar */}
      <View style={styles.header}>
        <Pressable
          onPress={handleBack}
          style={({ pressed }) => [
            styles.backButton,
            pressed && styles.backButtonPressed,
          ]}
        >
          <Ionicons name="chevron-back" size={24} color={Palette.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {notebook.title.replace(/\s*\(AI.*?\)\s*/g, '')}
        </Text>
      </View>

      {/* Main Contents Wrapper */}
      <View style={styles.contentWrapper}>
        {/* Segmented Tab Bar */}
        <View style={styles.tabsContainer}>
          <Pressable
            onPress={() => setActiveTab('library')}
            style={[
              styles.tabButton,
              activeTab === 'library'
                ? styles.tabButtonActive
                : styles.tabButtonInactive,
            ]}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'library'
                  ? styles.tabTextActive
                  : styles.tabTextInactive,
              ]}
            >
              라이브러리
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setActiveTab('files')}
            style={[
              styles.tabButton,
              activeTab === 'files'
                ? styles.tabButtonActive
                : styles.tabButtonInactive,
            ]}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'files'
                  ? styles.tabTextActive
                  : styles.tabTextInactive,
              ]}
            >
              파일
            </Text>
          </Pressable>
        </View>

        {/* Dynamic Lists */}
        {activeTab === 'library' ? (
          <FlatList
            data={lessons}
            renderItem={renderLessonItem}
            keyExtractor={(item) => item.id}
            ItemSeparatorComponent={() => <View style={styles.divider} />}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={refresh}
                tintColor={Palette.primary}
                colors={[Palette.primary]}
              />
            }
          />
        ) : (
          <FlatList
            data={files}
            renderItem={renderFileItem}
            keyExtractor={(item) => item.id}
            ItemSeparatorComponent={() => <View style={styles.divider} />}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={refresh}
                tintColor={Palette.primary}
                colors={[Palette.primary]}
              />
            }
          />
        )}
      </View>

      {/* Floating CTA Action Buttons */}
      <View style={styles.footerContainer}>
        {activeTab === 'library' ? (
          <Pressable
            onPress={handleCreateNewPodcast}
            style={({ pressed }) => [
              styles.ctaButton,
              pressed && styles.ctaButtonPressed,
            ]}
          >
            <Text style={styles.ctaButtonText}>+ 새로운 팟캐스트 만들기</Text>
          </Pressable>
        ) : (
          <Pressable
            onPress={handleAddNewFile}
            disabled={isAddingFile}
            style={({ pressed }) => [
              styles.ctaButton,
              isAddingFile && styles.ctaButtonDisabled,
              pressed && !isAddingFile && styles.ctaButtonPressed,
            ]}
          >
            {isAddingFile ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator size="small" color={Palette.bgCard} />
                <Text style={styles.ctaButtonText}>파일 업로드 중...</Text>
              </View>
            ) : (
              <Text style={styles.ctaButtonText}>+ 새로운 파일 추가</Text>
            )}
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.bgPage,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Palette.bgPage,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: Palette.textSecondary,
    fontFamily: Fonts.pretendardRegular,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Palette.bgPage,
    padding: 24,
    gap: 16,
  },
  errorText: {
    fontSize: 16,
    color: Palette.textErrorSlate,
    fontFamily: Fonts.pretendardMedium,
    textAlign: 'center',
  },
  backButtonAction: {
    backgroundColor: Palette.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonActionText: {
    fontSize: 14,
    color: Palette.bgCard,
    fontFamily: Fonts.pretendardMedium,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
    gap: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.96 }],
  },
  headerTitle: {
    fontSize: 32,
    color: Palette.textPrimary,
    fontFamily: Fonts.pretendardBold,
    flex: 1,
  },
  contentWrapper: {
    flex: 1,
    paddingHorizontal: 24,
    marginTop: 16,
  },
  tabsContainer: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  tabButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabButtonActive: {
    backgroundColor: Palette.primary,
  },
  tabButtonInactive: {
    backgroundColor: Palette.bgPage,
  },
  tabText: {
    fontSize: 13,
    fontFamily: Fonts.pretendardMedium,
  },
  tabTextActive: {
    color: Palette.bgPage,
  },
  tabTextInactive: {
    color: Palette.textPrimary,
    opacity: 0.5,
  },
  listContainer: {
    paddingBottom: 120, // Bottom CTA button overlap margin
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    gap: 16,
  },
  listItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 6,
    backgroundColor: Palette.bgPage,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 6,
    backgroundColor: Palette.bgPage,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listItemTextContainer: {
    flexDirection: 'column',
    gap: 2,
    flex: 1,
  },
  itemTitle: {
    fontSize: 15,
    color: Palette.textPrimary,
    fontFamily: Fonts.pretendardMedium,
  },
  itemSubtitle: {
    fontSize: 13,
    color: Palette.textPrimary,
    opacity: 0.5,
    fontFamily: Fonts.pretendardRegular,
  },
  playCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Palette.bgPage,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Palette.bgPage,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circlePressed: {
    opacity: 0.8,
    transform: [{ scale: 0.95 }],
  },
  divider: {
    height: 1,
    backgroundColor: Palette.textPrimary,
    opacity: 0.1,
    marginVertical: 4,
  },
  footerContainer: {
    position: 'absolute',
    bottom: 36,
    left: 24,
    right: 24,
  },
  ctaButton: {
    backgroundColor: Palette.primary,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  ctaButtonDisabled: {
    backgroundColor: Palette.textMuted,
    shadowOpacity: 0,
    elevation: 0,
  },
  ctaButtonText: {
    fontSize: 15,
    color: Palette.bgPage,
    fontFamily: Fonts.pretendardMedium,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
