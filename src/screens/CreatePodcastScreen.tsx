import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useJobPolling } from '@/src/entities';
import type {
  AudioFormat,
  DurationMin,
  TtsVoice,
} from '@/src/entities/content/model';
import { contentRepository } from '@/src/entities/content/repository';
import { Fonts } from '@/src/shared/constants/theme';

export default function CreatePodcastScreen() {
  // 폼 상태들
  const [selectedFile, setSelectedFile] = useState<{
    name: string;
    size: string;
  } | null>(null);
  const [duration, setDuration] = useState<DurationMin>(10);
  const [format, setFormat] = useState<AudioFormat>('dialog');
  const [voice, setVoice] = useState<TtsVoice>('friend');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);

  // jobId가 정해지면 완료될 때까지 자동으로 상태를 확인(폴링)한다.
  const { job } = useJobPolling(jobId);

  // 생성 작업이 완료(또는 실패)되면 처리한다.
  useEffect(() => {
    if (!job) return;

    if (job.status === 'done') {
      setIsSubmitting(false);
      setJobId(null);
      Alert.alert('완성!', 'AI 팟캐스트가 완성됐어요. 보관함에서 들어보세요!', [
        { text: '확인', onPress: () => router.push('/(tabs)') },
      ]);
    } else if (job.status === 'failed') {
      setIsSubmitting(false);
      setJobId(null);
      Alert.alert('오류', '팟캐스트 생성에 실패했어요. 다시 시도해 주세요.');
    }
  }, [job]);

  // 모의 파일 선택 함수
  const handleSelectFile = () => {
    setSelectedFile({
      name: '컴퓨터_구조_기말고사_핵심요약.pdf',
      size: '2.4 MB',
    });
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
  };

  // 생성하기 호출
  const handleCreate = async () => {
    if (!selectedFile) {
      Alert.alert('알림', '학습 자료를 업로드해 주세요.');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. 생성 요청을 보내고, 돌려받은 jobId를 저장한다.
      const result = await contentRepository.generate(
        {
          materialId: 'mat_demo_001',
          duration,
          format,
          ttsVoice: voice,
        },
        {
          userId: 'u_demo',
          title:
            selectedFile.name.replace(/\.[^/.]+$/, '') +
            ` (AI ${duration}분 요약)`,
          duration,
          format,
          ttsVoice: voice,
          script: `${selectedFile.name} 분석 중... 팟캐스트 콘텐츠를 생성하고 있습니다. 잠시만 기다려주세요.`,
        },
      );

      // 2. jobId를 저장하면 위의 useJobPolling이 완료될 때까지 자동으로 확인한다.
      //    완료/실패 처리는 위쪽 useEffect에서 한다.
      setJobId(result.jobId);
    } catch (err) {
      setIsSubmitting(false);
      Alert.alert('오류', '팟캐스트 생성 요청에 실패했습니다.');
       
      console.error('[CreatePodcastScreen] handleCreate error:', err);
    }
  };

  // 포맷 목록 데이터
  const formatOptions: {
    id: AudioFormat;
    title: string;
    desc: string;
    icon: any;
    color: string;
  }[] = [
    {
      id: 'dialog',
      title: '대화형 (Dialog)',
      desc: '두 명의 튜터가 친근하게 대화하며 질문과 답변으로 공부 내용을 핵심 요약합니다.',
      icon: 'people-outline',
      color: '#3B82F6',
    },
    {
      id: 'quiz',
      title: '퀴즈형 (Quiz)',
      desc: '배운 이론을 바탕으로 퀴즈를 출제하고 해설을 들려주어 실전 대비를 돕습니다.',
      icon: 'help-circle-outline',
      color: '#10B981',
    },
    {
      id: 'story',
      title: '스토리형 (Story)',
      desc: '복잡한 개념도 귀에 쏙쏙 박히는 흥미진진한 이야기 형태로 풀어나가 설명합니다.',
      icon: 'book-outline',
      color: '#8B5CF6',
    },
  ];

  // 음성 목록 데이터
  const voiceOptions: {
    id: TtsVoice;
    title: string;
    desc: string;
    emoji: string;
    badge: string;
    voiceColor: string;
  }[] = [
    {
      id: 'professor',
      title: '교수',
      desc: '차분하고 또렷한 목소리로 논리적이고 친절하게 핵심을 짚어줍니다.',
      emoji: '👨‍🏫',
      badge: '지적인 설명',
      voiceColor: '#0EA5E9',
    },
    {
      id: 'friend',
      title: '친구',
      desc: '친구처럼 편안하게 대화하듯 반말로 핵심 개념을 설명해 줍니다.',
      emoji: '🧑‍🤝‍🧑',
      badge: '친근한 반말',
      voiceColor: '#F59E0B',
    },
    {
      id: 'coach',
      title: '도전(화난)',
      desc: '에너제틱하고 불타오르는 어조로 잠들지 않게 집중 타이트닝을 유도합니다.',
      emoji: '🔥',
      badge: '열정 스파르타',
      voiceColor: '#EF4444',
    },
    {
      id: 'whisper',
      title: '속삭임',
      desc: 'ASMR처럼 귀가에 조용히 속삭여 극도의 집중과 심리 안정을 제공합니다.',
      emoji: '🤫',
      badge: '차분한 속삭임',
      voiceColor: '#8B5CF6',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>팟캐스트 생성</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. 학습 자료 업로드 섹션 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. 학습 자료 업로드</Text>
          <Text style={styles.sectionSubtitle}>
            팟캐스트의 기반이 될 학습 요약본, 논문, PDF 등을 업로드하세요.
          </Text>

          {!selectedFile ? (
            <Pressable
              onPress={handleSelectFile}
              style={({ pressed }) => [
                styles.uploadZone,
                pressed && styles.uploadZonePressed,
              ]}
            >
              <View style={styles.uploadIconContainer}>
                <Ionicons
                  name="cloud-upload-outline"
                  size={32}
                  color="#3B82F6"
                />
              </View>
              <Text style={styles.uploadMainText}>
                자료 선택하여 업로드하기
              </Text>
              <Text style={styles.uploadSubText}>
                PDF, TXT, 이미지 (최대 20MB)
              </Text>
            </Pressable>
          ) : (
            <View style={styles.fileCard}>
              <View style={styles.fileIconContainer}>
                <Ionicons name="document-text" size={28} color="#EF4444" />
              </View>
              <View style={styles.fileInfo}>
                <Text style={styles.fileName} numberOfLines={1}>
                  {selectedFile.name}
                </Text>
                <Text style={styles.fileSize}>{selectedFile.size}</Text>
              </View>
              <Pressable
                onPress={handleRemoveFile}
                style={({ pressed }) => [
                  styles.fileRemoveButton,
                  pressed && styles.actionPressed,
                ]}
              >
                <Ionicons name="close" size={20} color="#64748B" />
              </Pressable>
            </View>
          )}
        </View>

        {/* 2. 팟캐스트 길이(시간) 섹션 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. 팟캐스트 재생 시간</Text>
          <Text style={styles.sectionSubtitle}>
            학습 밀도와 출퇴근 시간에 딱 맞춘 오디오 분량을 조절해보세요.
          </Text>

          <View style={styles.durationRow}>
            {([5, 10, 20, 30] as DurationMin[]).map((m) => {
              const isSelected = duration === m;
              return (
                <Pressable
                  key={m}
                  onPress={() => setDuration(m)}
                  style={({ pressed }) => [
                    styles.durationChip,
                    isSelected && styles.durationChipSelected,
                    pressed && styles.actionPressed,
                  ]}
                >
                  <Text
                    style={[
                      styles.durationChipText,
                      isSelected && styles.durationChipTextSelected,
                    ]}
                  >
                    {m}분
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* 3. 팟캐스트 포맷 설정 섹션 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. 팟캐스트 구성 포맷</Text>
          <Text style={styles.sectionSubtitle}>
            자료를 어떤 형식의 오디오 연출로 구성할지 선택합니다.
          </Text>

          <View style={styles.formatList}>
            {formatOptions.map((opt) => {
              const isSelected = format === opt.id;
              return (
                <Pressable
                  key={opt.id}
                  onPress={() => setFormat(opt.id)}
                  style={[
                    styles.formatCard,
                    isSelected && styles.formatCardSelected,
                  ]}
                >
                  <View
                    style={[
                      styles.formatIconBg,
                      { backgroundColor: opt.color + '15' },
                    ]}
                  >
                    <Ionicons name={opt.icon} size={24} color={opt.color} />
                  </View>
                  <View style={styles.formatInfo}>
                    <Text style={styles.formatTitle}>{opt.title}</Text>
                    <Text style={styles.formatDesc}>{opt.desc}</Text>
                  </View>
                  {isSelected && (
                    <View style={styles.selectedIndicator}>
                      <Ionicons
                        name="checkmark-circle"
                        size={22}
                        color="#3B82F6"
                      />
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* 4. TTS 성격(TtsVoice) 설정 섹션 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. 스터디 캐스터 목소리 톤</Text>
          <Text style={styles.sectionSubtitle}>
            오디오를 진행할 AI 캐스터의 스타일과 성격을 골라보세요.
          </Text>

          <View style={styles.voiceList}>
            {voiceOptions.map((opt) => {
              const isSelected = voice === opt.id;
              return (
                <Pressable
                  key={opt.id}
                  onPress={() => setVoice(opt.id)}
                  style={[
                    styles.voiceCard,
                    isSelected && styles.voiceCardSelected,
                  ]}
                >
                  <View
                    style={[
                      styles.voiceAvatar,
                      { backgroundColor: opt.voiceColor + '10' },
                    ]}
                  >
                    <Text style={styles.voiceEmoji}>{opt.emoji}</Text>
                  </View>
                  <View style={styles.voiceInfo}>
                    <View style={styles.voiceHeaderRow}>
                      <Text style={styles.voiceTitle}>{opt.title}</Text>
                      <View
                        style={[
                          styles.voiceBadge,
                          { backgroundColor: opt.voiceColor + '15' },
                        ]}
                      >
                        <Text
                          style={[
                            styles.voiceBadgeText,
                            { color: opt.voiceColor },
                          ]}
                        >
                          {opt.badge}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.voiceDesc}>{opt.desc}</Text>
                  </View>
                  {isSelected && (
                    <View style={styles.selectedIndicator}>
                      <Ionicons
                        name="checkmark-circle"
                        size={22}
                        color="#3B82F6"
                      />
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.spacer} />
      </ScrollView>

      {/* 하단 CTA 고정 생성하기 버튼 */}
      <View style={styles.footerButtonContainer}>
        <Pressable
          onPress={handleCreate}
          disabled={isSubmitting}
          style={({ pressed }) => [
            styles.createButton,
            !selectedFile && styles.createButtonDisabled,
            pressed && styles.createButtonPressed,
          ]}
        >
          {isSubmitting ? (
            <View style={styles.submittingContainer}>
              <Text style={styles.createButtonText}>
                오디오 대본 및 구성 분석 중...
              </Text>
            </View>
          ) : (
            <Text style={styles.createButtonText}>
              나만의 AI 학습 팟캐스트 생성하기
            </Text>
          )}
        </Pressable>
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
    paddingBottom: 12,
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
  scrollContainer: {
    paddingHorizontal: 24,
    paddingBottom: 120, // 하단 고정 버튼 여유 공간 확보
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 4,
    fontFamily: Fonts.rounded,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 16,
    fontFamily: Fonts.rounded,
  },
  uploadZone: {
    borderWidth: 2,
    borderColor: '#CBD5E1',
    borderStyle: 'dashed',
    borderRadius: 16,
    paddingVertical: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
  },
  uploadZonePressed: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
  },
  uploadIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  uploadMainText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
    fontFamily: Fonts.rounded,
  },
  uploadSubText: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: Fonts.rounded,
  },
  fileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FEE2E2',
    borderRadius: 14,
    padding: 12,
  },
  fileIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  fileInfo: {
    flex: 1,
    marginLeft: 12,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 2,
    fontFamily: Fonts.rounded,
  },
  fileSize: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: Fonts.rounded,
  },
  fileRemoveButton: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  actionPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.96 }],
  },
  durationRow: {
    flexDirection: 'row',
    gap: 10,
  },
  durationChip: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  durationChipSelected: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  durationChipText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
    fontFamily: Fonts.rounded,
  },
  durationChipTextSelected: {
    color: '#FFFFFF',
  },
  formatList: {
    gap: 12,
  },
  formatCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 16,
    position: 'relative',
  },
  formatCardSelected: {
    backgroundColor: '#FFFFFF',
    borderColor: '#3B82F6',
    borderWidth: 2,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  formatIconBg: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  formatInfo: {
    flex: 1,
    paddingRight: 24,
  },
  formatTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
    fontFamily: Fonts.rounded,
  },
  formatDesc: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
    fontFamily: Fonts.rounded,
  },
  selectedIndicator: {
    position: 'absolute',
    right: 16,
  },
  voiceList: {
    gap: 12,
  },
  voiceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 16,
    position: 'relative',
  },
  voiceCardSelected: {
    backgroundColor: '#FFFFFF',
    borderColor: '#3B82F6',
    borderWidth: 2,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  voiceAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  voiceEmoji: {
    fontSize: 24,
  },
  voiceInfo: {
    flex: 1,
    paddingRight: 24,
  },
  voiceHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  voiceTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
    fontFamily: Fonts.rounded,
  },
  voiceBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  voiceBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    fontFamily: Fonts.rounded,
  },
  voiceDesc: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
    fontFamily: Fonts.rounded,
  },
  spacer: {
    height: 40,
  },
  footerButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingTop: 14,
    paddingBottom: 24,
    paddingHorizontal: 24,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  createButton: {
    backgroundColor: '#2563EB',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  createButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  createButtonDisabled: {
    backgroundColor: '#94A3B8',
    shadowOpacity: 0,
    elevation: 0,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    fontFamily: Fonts.rounded,
  },
  submittingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
