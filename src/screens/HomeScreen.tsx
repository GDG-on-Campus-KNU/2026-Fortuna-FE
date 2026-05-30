import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useContents } from '@/src/entities/content/hooks';
import type { AudioFormat, Content, TtsVoice } from '@/src/entities/content/model';
import { useAudioStore, type AudioTrack } from '@/src/features/audio';
import { Fonts } from '@/src/shared/constants/theme';

export default function HomeScreen() {
  const { data: contents, loading, refresh } = useContents();
  const initAudio = useAudioStore((state) => state.init);

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
      // 오디오를 즉시 재생 상태로 만듭니다.
      const state = useAudioStore.getState();
      if (state.playbackState !== 'playing') {
        await state.togglePlayback();
      }
      router.push('/player');
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('오디오 초기화 오류:', err);
    }
  };

  const renderContentItem = ({ item }: { item: Content }) => {
    const format = getFormatDetails(item.format);
    const voice = getVoiceDetails(item.ttsVoice);
    const isDone = item.status === 'done';
    const isGenerating = item.status === 'generating';

    return (
      <Pressable
        onPress={() => handlePlayContent(item)}
        style={({ pressed }) => [
          styles.card,
          pressed && isDone && styles.cardPressed,
          !isDone && styles.cardDisabled,
        ]}
        disabled={!isDone}
      >
        <View style={styles.cardHeader}>
          {/* 포맷 배지 */}
          <View style={[styles.badge, { backgroundColor: format.bg }]}>
            <Ionicons name={format.icon} size={14} color={format.color} style={styles.badgeIcon} />
            <Text style={[styles.badgeText, { color: format.color }]}>{format.label}</Text>
          </View>

          {/* 상태 표시 */}
          {isGenerating ? (
            <View style={[styles.statusBadge, styles.generatingBadge]}>
              <ActivityIndicator size="small" color="#F59E0B" style={styles.spinner} />
              <Text style={styles.generatingText}>생성 중</Text>
            </View>
          ) : isDone ? (
            <View style={[styles.statusBadge, styles.doneBadge]}>
              <Ionicons name="checkmark-circle" size={14} color="#10B981" />
              <Text style={styles.doneText}>준비 완료</Text>
            </View>
          ) : (
            <View style={[styles.statusBadge, styles.failedBadge]}>
              <Ionicons name="alert-circle" size={14} color="#EF4444" />
              <Text style={styles.failedText}>실패</Text>
            </View>
          )}
        </View>

        {/* 타이틀 */}
        <Text style={styles.cardTitle} numberOfLines={2}>
          {item.title}
        </Text>

        {/* 푸터 정보 */}
        <View style={styles.cardFooter}>
          <View style={styles.metaRow}>
            <Ionicons name="time-outline" size={14} color="#64748B" />
            <Text style={styles.metaText}>{item.duration}분 분량</Text>
          </View>
          <View style={styles.metaDot} />
          <View style={styles.metaRow}>
            <Text style={styles.metaText}>
              {voice.emoji} {voice.label}
            </Text>
          </View>

          {isDone && (
            <View style={styles.playIconContainer}>
              <Ionicons name="play-circle" size={26} color="#2563EB" />
            </View>
          )}
        </View>
      </Pressable>
    );
  };

  const renderEmptyComponent = () => {
    if (loading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>학습 캐스트를 불러오는 중입니다...</Text>
        </View>
      );
    }

    return (
      <View style={styles.centerContainer}>
        <View style={styles.emptyIconBg}>
          <Ionicons name="musical-notes-outline" size={48} color="#94A3B8" />
        </View>
        <Text style={styles.emptyTitle}>생성된 학습 캐스트가 없습니다</Text>
        <Text style={styles.emptySubtitle}>
          두 번째 탭에서 나만의 학습 자료를 업로드하고 첫 팟캐스트를 생성해보세요!
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Studycast</Text>
        </View>
        <Pressable
          onPress={() => refresh()}
          style={({ pressed }) => [styles.refreshButton, pressed && styles.buttonPressed]}
        >
          <Ionicons name="refresh-outline" size={22} color="#1E293B" />
        </Pressable>
      </View>

      <FlatList
        data={contents}
        renderItem={renderContentItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={renderEmptyComponent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={loading && contents.length > 0} onRefresh={refresh} colors={['#2563EB']} />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
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
  refreshButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  buttonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.96 }],
  },
  listContainer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    flexGrow: 1,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 3,
  },
  cardPressed: {
    transform: [{ scale: 0.98 }],
    backgroundColor: '#F8FAFC',
  },
  cardDisabled: {
    opacity: 0.9,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 99,
  },
  badgeIcon: {
    marginRight: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: Fonts.rounded,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  generatingBadge: {
    backgroundColor: '#FFFBEB',
  },
  generatingText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D97706',
    fontFamily: Fonts.rounded,
  },
  spinner: {
    marginRight: 2,
    transform: [{ scale: 0.8 }],
  },
  doneBadge: {
    backgroundColor: '#ECFDF5',
  },
  doneText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
    fontFamily: Fonts.rounded,
  },
  failedBadge: {
    backgroundColor: '#FEF2F2',
  },
  failedText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#DC2626',
    fontFamily: Fonts.rounded,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1E293B',
    lineHeight: 24,
    marginBottom: 16,
    fontFamily: Fonts.rounded,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 14,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  metaText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
    fontFamily: Fonts.rounded,
  },
  metaDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    marginHorizontal: 8,
  },
  playIconContainer: {
    marginLeft: 'auto',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748B',
    fontFamily: Fonts.rounded,
  },
  emptyIconBg: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
    fontFamily: Fonts.rounded,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
    fontFamily: Fonts.rounded,
  },
});
