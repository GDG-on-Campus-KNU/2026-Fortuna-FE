import React, { useState, useEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

import { useContent } from '@/src/entities/content/hooks';
import { useAudioStore, type AudioTrack } from '@/src/features/audio';
import { Fonts } from '@/src/shared/constants/theme';

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

const getLocalAudioUri = (module: any) => {
  try {
    const source = Image.resolveAssetSource(module);
    return source ? source.uri : '';
  } catch (err) {
    console.warn('[NotebookDetailScreen] Failed to resolve asset source', err);
    return '';
  }
};

export default function NotebookDetailScreen({
  id,
}: NotebookDetailScreenProps) {
  // Fetch current notebook metadata using existing hook
  const { data: notebook, loading, error } = useContent(id);
  const initAudio = useAudioStore((state) => state.init);

  // States
  const [activeTab, setActiveTab] = useState<'library' | 'files'>('library');
  const [lessons, setLessons] = useState<LessonItem[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isAddingFile, setIsAddingFile] = useState(false);

  // Load sample audios for simulated playback
  const sampleAudio1 = getLocalAudioUri(
    require('../../assets/audios/Sample-1.wav'),
  );
  const sampleAudio2 = getLocalAudioUri(
    require('../../assets/audios/Sample-2.wav'),
  );
  const sampleAudio3 = getLocalAudioUri(
    require('../../assets/audios/Sample-3.wav'),
  );
  const sampleAudio4 = getLocalAudioUri(
    require('../../assets/audios/Sample-4.wav'),
  );

  // Initialize data based on notebook loaded
  useEffect(() => {
    if (!notebook) return;

    const title = notebook.title;

    // Check if notebook matches "알고리즘" or similar algorithm topics
    if (
      title.includes('알고리즘') ||
      title.includes('Tree') ||
      id.includes('demo')
    ) {
      // 1. Library (Lessons) List according to node 302-508
      setLessons([
        {
          id: `${id}_lesson_1`,
          title: 'Tree',
          duration: 15,
          voiceLabel: '교수',
          ttsVoice: 'professor',
          iconName: 'bulb-outline', // batch_prediction equivalent
          audioUrl: sampleAudio1,
          description:
            '트리 자료구조의 정의, 노드와 엣지의 성질, 이진 탐색 트리 요약 핵심 강의입니다.',
          formatLabel: '대화식 팟캐스트',
        },
        {
          id: `${id}_lesson_2`,
          title: 'Graph',
          duration: 20,
          voiceLabel: '친구',
          ttsVoice: 'friend',
          iconName: 'git-network-outline', // graph_3 equivalent
          audioUrl: sampleAudio2,
          description:
            '인접 행렬과 인접 리스트의 차이, 그래프 기초 이론에 대해 친구 톤으로 재미있게 해설합니다.',
          formatLabel: '스토리텔링 팟캐스트',
        },
        {
          id: `${id}_lesson_3`,
          title: 'BFS/DFS',
          duration: 10,
          voiceLabel: '속삭임',
          ttsVoice: 'whisper',
          iconName: 'git-branch-outline', // graph_4 equivalent
          audioUrl: sampleAudio4,
          description:
            '너비 우선 탐색과 깊이 우선 탐색의 동작 프로세스를 ASMR 톤으로 수면 복습용 요약 강의합니다.',
          formatLabel: '속삭임 팟캐스트',
        },
      ]);

      // 2. Files List according to node 302-630
      setFiles([
        { id: 'f_1', name: '15-다익스트라_알고리즘.pdf', size: '2.3 MB' },
        { id: 'f_2', name: '16-그래프.pdf', size: '1.9 MB' },
        { id: 'f_3', name: '17-트리.pdf', size: '3.1 MB' },
      ]);
    } else {
      // Create customized dataset based on custom notebook title
      const cleanTitle = title.replace(/\s*\(AI.*?\)\s*/g, '');
      setLessons([
        {
          id: `${id}_lesson_custom_1`,
          title: `${cleanTitle} 핵심 요약`,
          duration: notebook.duration || 10,
          voiceLabel:
            notebook.ttsVoice === 'professor'
              ? '교수'
              : notebook.ttsVoice === 'friend'
                ? '친구'
                : notebook.ttsVoice === 'coach'
                  ? '도전(화난)'
                  : '속삭임',
          ttsVoice: notebook.ttsVoice,
          iconName: 'document-text-outline',
          audioUrl: notebook.audioUrl || sampleAudio1,
          description:
            notebook.script || 'AI가 생성한 고품격 맞춤 요약 팟캐스트입니다.',
          formatLabel:
            notebook.format === 'dialog'
              ? '대화식 팟캐스트'
              : notebook.format === 'quiz'
                ? '퀴즈 팟캐스트'
                : '스토리텔링 팟캐스트',
        },
        {
          id: `${id}_lesson_custom_2`,
          title: `${cleanTitle} 심층 분석`,
          duration: (notebook.duration || 10) + 5,
          voiceLabel: '교수',
          ttsVoice: 'professor',
          iconName: 'bulb-outline',
          audioUrl: sampleAudio3,
          description: '추가 학습을 위한 확장 핵심 분석 팟캐스트입니다.',
          formatLabel: '대화식 팟캐스트',
        },
      ]);

      setFiles([
        {
          id: 'f_c1',
          name: `${cleanTitle}_기말고사_핵심요약.pdf`,
          size: '2.4 MB',
        },
        { id: 'f_c2', name: `${cleanTitle}_참고자료.pdf`, size: '1.8 MB' },
      ]);
    }
  }, [notebook, id, sampleAudio1, sampleAudio2, sampleAudio3, sampleAudio4]);

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
      title: `${notebook?.title.replace(/\s*\(AI.*?\)\s*/g, '') || '노트북'} · ${item.title}`,
      artist: `${item.voiceLabel} 톤 · StudyCast`,
      album: item.formatLabel,
      duration: item.duration * 60,
      description: item.description,
    };

    try {
      await initAudio(track);
      const state = useAudioStore.getState();
      if (state.playbackState !== 'playing') {
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
          onPress: () => {
            setFiles((prev) => prev.filter((f) => f.id !== fileId));
          },
        },
      ],
    );
  };

  // Create new podcast CTA
  const handleCreateNewPodcast = () => {
    router.push('/create');
  };

  // Add new file simulator (simulating document picker)
  const handleAddNewFile = () => {
    setIsAddingFile(true);

    // Simulate loading delay (800ms)
    setTimeout(() => {
      setIsAddingFile(false);
      const dummyFileNames = [
        '18-해시_테이블.pdf',
        '19-동적_계획법.pdf',
        '20-정렬_알고리즘.pdf',
        '시스템_설계_요약.pdf',
      ];
      const randomName =
        dummyFileNames[Math.floor(Math.random() * dummyFileNames.length)];
      const randomSize = `${(Math.random() * 2 + 1.2).toFixed(1)} MB`;

      const newFile: FileItem = {
        id: `f_new_${Date.now()}`,
        name: randomName,
        size: randomSize,
      };

      setFiles((prev) => [...prev, newFile]);
      Alert.alert(
        '업로드 완료',
        `'${randomName}' 자료가 노트북 파일 목록에 성공적으로 업로드되었습니다.`,
      );
    }, 800);
  };

  // Loading Screen
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1E6AF4" />
        <Text style={styles.loadingText}>노트북 정보를 불러오는 중...</Text>
      </View>
    );
  }

  // Error Screen
  if (error || !notebook) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={48} color="#EF4444" />
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
          <Ionicons name={item.iconName} size={22} color="#1E6AF4" />
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
          color="#1E6AF4"
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
          <Ionicons name="document-text" size={22} color="#1E6AF4" />
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
        <Ionicons name="close" size={16} color="#64748B" />
      </Pressable>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Background FigmaSoft Blue Gradient */}
      <LinearGradient
        colors={['#EBF2FE', '#FDFDFD']}
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
          <Ionicons name="chevron-back" size={24} color="#100C08" />
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
          />
        ) : (
          <FlatList
            data={files}
            renderItem={renderFileItem}
            keyExtractor={(item) => item.id}
            ItemSeparatorComponent={() => <View style={styles.divider} />}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
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
                <ActivityIndicator size="small" color="#FFFFFF" />
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
    backgroundColor: '#FDFDFD',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FDFDFD',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#64748B',
    fontFamily: Fonts.pretendardRegular,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FDFDFD',
    padding: 24,
    gap: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#1E293B',
    fontFamily: Fonts.pretendardMedium,
    textAlign: 'center',
  },
  backButtonAction: {
    backgroundColor: '#1E6AF4',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonActionText: {
    fontSize: 14,
    color: '#FFFFFF',
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
    color: '#100C08',
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
    backgroundColor: '#1E6AF4',
  },
  tabButtonInactive: {
    backgroundColor: '#FDFDFD',
  },
  tabText: {
    fontSize: 13,
    fontFamily: Fonts.pretendardMedium,
  },
  tabTextActive: {
    color: '#FDFDFD',
  },
  tabTextInactive: {
    color: '#100C08',
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
    backgroundColor: '#FDFDFD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 6,
    backgroundColor: '#FDFDFD',
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
    color: '#100C08',
    fontFamily: Fonts.pretendardMedium,
  },
  itemSubtitle: {
    fontSize: 13,
    color: '#100C08',
    opacity: 0.5,
    fontFamily: Fonts.pretendardRegular,
  },
  playCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FDFDFD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FDFDFD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circlePressed: {
    opacity: 0.8,
    transform: [{ scale: 0.95 }],
  },
  divider: {
    height: 1,
    backgroundColor: '#100C08',
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
    backgroundColor: '#1E6AF4',
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
    backgroundColor: '#94A3B8',
    shadowOpacity: 0,
    elevation: 0,
  },
  ctaButtonText: {
    fontSize: 15,
    color: '#FDFDFD',
    fontFamily: Fonts.pretendardMedium,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
