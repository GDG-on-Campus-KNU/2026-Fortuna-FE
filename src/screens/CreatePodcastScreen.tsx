import React, { useState, useEffect, useRef } from 'react';
import {
  Alert,
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import type {
  AudioFormat,
  DurationMin,
  TtsVoice,
} from '@/src/entities/content/model';
import { contentRepository } from '@/src/entities/content/repository';
import { Fonts, Palette } from '@/src/shared/constants/theme';

const RECOMMENDATIONS = [
  '알고리즘 기말고사 대비',
  '그래프와 트리의 차이',
  'BFS 개념 복습',
];

export default function CreatePodcastScreen() {
  // Wizard flow step: 1 | 2 | 3 | 4 | 5
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Form states
  const [topic, setTopic] = useState('');
  const [format, setFormat] = useState<AudioFormat>('dialog');
  const [voice, setVoice] = useState<TtsVoice>('friend');
  const [duration, setDuration] = useState<DurationMin>(10);

  // Step 5 loading states
  const [loadingStage, setLoadingStage] = useState<1 | 2 | 3 | 4>(1);

  // Animations
  const stepFadeAnim = useRef(new Animated.Value(1)).current;
  const timersRef = useRef<any[]>([]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      timersRef.current.forEach(clearTimeout);
    };
  }, []);

  // Smoothly transition between wizard steps using opacity animations
  const transitionToStep = (nextStep: 1 | 2 | 3 | 4 | 5) => {
    Animated.timing(stepFadeAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      setStep(nextStep);
      Animated.timing(stepFadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });
  };

  // Handle back button presses
  const handleBack = () => {
    if (step > 1) {
      transitionToStep((step - 1) as any);
    } else {
      router.back();
    }
  };

  // Triggers podcast creation flow
  const handleCreate = async () => {
    if (!topic.trim()) {
      Alert.alert('알림', '주제를 입력해 주세요.');
      return;
    }

    transitionToStep(5);
    setLoadingStage(1);

    // Simulate progress updates
    const t1 = setTimeout(() => setLoadingStage(2), 1800);
    const t2 = setTimeout(() => setLoadingStage(3), 3600);
    const t3 = setTimeout(() => setLoadingStage(4), 5400);

    const virtualFile = {
      name: `${topic.trim()}.pdf`,
      size: '1.2 MB',
    };

    try {
      // 1. 실제로 contentRepository.generate를 호출하여 'generating' 상태의 임시 카드를 MMKV에 캐시 저장합니다.
      await contentRepository.generate(
        {
          materialId: `mat_demo_${Date.now()}`,
          duration,
          format,
          ttsVoice: voice,
        },
        {
          userId: 'u_demo',
          title: topic.trim() + ` (AI ${duration}분 요약)`,
          duration,
          format,
          ttsVoice: voice,
          script: `${virtualFile.name} 분석 중... 팟캐스트 콘텐츠를 생성하고 있습니다. 잠시만 기다려주세요.`,
        },
      );

      // 전체 시뮬레이션이 끝나는 시점에 Alert를 띄우고 홈으로 보냅니다.
      const t4 = setTimeout(() => {
        Alert.alert(
          '생성 성공!',
          'AI 맞춤형 학습 팟캐스트 생성이 정상적으로 요청되었습니다. 홈 화면에서 확인해 보세요!',
          [
            {
              text: '확인',
              onPress: () => {
                router.replace('/');
              },
            },
          ],
        );
      }, 6500) as any;

      timersRef.current = [t1, t2, t3, t4];
    } catch (err) {
      // Clear timers and reset
      timersRef.current.forEach(clearTimeout);
      Alert.alert('오류', '팟캐스트 생성 요청에 실패했습니다.');
      console.error('[CreatePodcastScreen] handleCreate error:', err);
      setStep(4);
    }
  };

  // Helper component to render progress checklist in Step 5
  const renderProgressItem = (
    itemStep: 1 | 2 | 3,
    title: string,
    activeText: string,
    waitingText: string,
  ) => {
    const isComplete = loadingStage > itemStep;
    const isActive = loadingStage === itemStep;

    let circleBoxStyle: any[] = [styles.circleIcon, styles.circleIconWaiting];
    let circleTextStyle: any[] = [styles.circleTextWaiting];
    let titleStyle: any[] = [styles.checklistTitleWaiting];
    let statusStyle: any[] = [styles.checklistStatusWaiting];
    let statusText = waitingText;

    if (isComplete) {
      circleBoxStyle = [styles.circleIcon, styles.circleIconComplete];
      circleTextStyle = [styles.circleTextComplete];
      titleStyle = [styles.checklistTitle];
      statusStyle = [styles.checklistStatusComplete];
      statusText = '완료';
    } else if (isActive) {
      circleBoxStyle = [styles.circleIcon, styles.circleIconActive];
      circleTextStyle = [styles.circleTextActive];
      titleStyle = [styles.checklistTitle];
      statusStyle = [styles.checklistStatusActive];
      statusText = activeText;
    }

    return (
      <View style={styles.checklistItemContainer} key={itemStep}>
        <View style={styles.checklistItem}>
          <View style={circleBoxStyle}>
            {isComplete ? (
              <Ionicons name="checkmark" size={20} color={Palette.bgCard} />
            ) : (
              <Text style={circleTextStyle}>{itemStep}</Text>
            )}
          </View>
          <View style={styles.checklistTextContainer}>
            <Text style={titleStyle}>{title}</Text>
            <Text style={statusStyle}>{statusText}</Text>
          </View>
        </View>
        {itemStep < 3 && (
          <View
            style={[
              styles.verticalLine,
              isComplete && styles.verticalLineComplete,
            ]}
          />
        )}
      </View>
    );
  };

  // Helper to calculate circular progress bar styling based on current stage
  const getProgressStyles = () => {
    switch (loadingStage) {
      case 1:
        return {
          borderTopColor: Palette.primary,
          borderRightColor: Palette.primaryHover,
          borderBottomColor: Palette.primaryHover,
          borderLeftColor: Palette.primaryHover,
          percentage: '25%',
        };
      case 2:
        return {
          borderTopColor: Palette.primary,
          borderRightColor: Palette.primary,
          borderBottomColor: Palette.primaryHover,
          borderLeftColor: Palette.primaryHover,
          percentage: '50%',
        };
      case 3:
        return {
          borderTopColor: Palette.primary,
          borderRightColor: Palette.primary,
          borderBottomColor: Palette.primary,
          borderLeftColor: Palette.primaryHover,
          percentage: '75%',
        };
      case 4:
      default:
        return {
          borderColor: Palette.primary,
          percentage: '100%',
        };
    }
  };

  const prog = getProgressStyles();

  return (
    <SafeAreaView style={styles.container}>
      {step < 5 ? (
        <>
          {/* Header Bar */}
          <View style={styles.headerBar}>
            <Pressable
              onPress={handleBack}
              style={({ pressed }) => [
                styles.backButton,
                pressed && styles.actionPressed,
              ]}
            >
              <Ionicons
                name="chevron-back"
                size={24}
                color={Palette.textPrimary}
              />
            </Pressable>

            <View style={styles.progressContainer}>
              {([1, 2, 3, 4] as const).map((s) => {
                const isActive = step === s;
                return (
                  <View
                    key={s}
                    style={[
                      styles.progressDot,
                      isActive && styles.progressDotActive,
                    ]}
                  />
                );
              })}
            </View>

            <View style={styles.headerSpacer} />
          </View>

          <Animated.View style={{ opacity: stepFadeAnim, flex: 1 }}>
            <ScrollView
              contentContainerStyle={styles.scrollContainer}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Step 1: Topic Input */}
              {step === 1 && (
                <View style={styles.stepContainer}>
                  <View style={styles.titleSection}>
                    <Text style={styles.titleText}>무슨 내용의</Text>
                    <Text style={styles.titleText}>팟캐스트를 만들까요?</Text>
                    <Text style={styles.subtitleText}>
                      아래에서 선택하거나 직접 입력해요
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.inputWrapper,
                      topic.trim().length > 0 && styles.inputWrapperFilled,
                    ]}
                  >
                    <TextInput
                      style={styles.textInput}
                      placeholder="주제를 입력해 주세요"
                      placeholderTextColor={Palette.textMuted}
                      value={topic}
                      onChangeText={setTopic}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                    {topic.trim().length > 0 && (
                      <Pressable
                        onPress={() => setTopic('')}
                        style={styles.clearButton}
                      >
                        <Ionicons
                          name="close-circle"
                          size={18}
                          color={Palette.textMuted}
                        />
                      </Pressable>
                    )}
                  </View>

                  <View style={styles.recommendSection}>
                    <Text style={styles.recommendTitle}>추천 내용</Text>
                    {RECOMMENDATIONS.map((rec) => {
                      const isSelected = topic.trim() === rec;
                      return (
                        <Pressable
                          key={rec}
                          onPress={() => setTopic(rec)}
                          style={({ pressed }) => [
                            styles.recommendChip,
                            isSelected && styles.recommendChipSelected,
                            pressed && styles.actionPressed,
                          ]}
                        >
                          <Text
                            style={[
                              styles.recommendChipText,
                              isSelected && styles.recommendChipTextSelected,
                            ]}
                          >
                            {rec}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              )}

              {/* Step 2: Format Selection */}
              {step === 2 && (
                <View style={styles.stepContainer}>
                  <View style={styles.titleSection}>
                    <Text style={styles.titleText}>어떤 구성의</Text>
                    <Text style={styles.titleText}>팟캐스트를 만들까요?</Text>
                    <Text style={styles.subtitleText}>학습 방식을 골라요</Text>
                  </View>

                  <View style={styles.optionsList}>
                    {(
                      [
                        {
                          id: 'dialog',
                          title: '대화형',
                          desc: '대화하며 질문과 답변으로 공부 내용을 핵심 요약해요.',
                        },
                        {
                          id: 'quiz',
                          title: '퀴즈형',
                          desc: '배운 이론을 바탕으로 퀴즈를 출제하고 해설을 들려줘요.',
                        },
                        {
                          id: 'story',
                          title: '스토리형',
                          desc: '복잡한 개념도 귀에 쏙쏙 박히는 흥미진진한 이야기로 들려줘요.',
                        },
                      ] as const
                    ).map((opt) => {
                      const isSelected = format === opt.id;
                      return (
                        <Pressable
                          key={opt.id}
                          onPress={() => setFormat(opt.id)}
                          style={({ pressed }) => [
                            styles.card,
                            isSelected && styles.cardSelected,
                            pressed && styles.actionPressed,
                          ]}
                        >
                          <Text
                            style={[
                              styles.cardTitle,
                              isSelected && styles.cardTitleSelected,
                            ]}
                          >
                            {opt.title}
                          </Text>
                          <Text style={styles.cardDesc}>{opt.desc}</Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              )}

              {/* Step 3: Voice Selection */}
              {step === 3 && (
                <View style={styles.stepContainer}>
                  <View style={styles.titleSection}>
                    <Text style={styles.titleText}>어떤 스타일의</Text>
                    <Text style={styles.titleText}>팟캐스트를 만들까요?</Text>
                    <Text style={styles.subtitleText}>강의 성격을 골라요</Text>
                  </View>

                  <View style={styles.optionsList}>
                    {(
                      [
                        {
                          id: 'professor',
                          title: '교수',
                          desc: '차분하고 또렷한 목소리',
                        },
                        {
                          id: 'friend',
                          title: '친구',
                          desc: '친구처럼 편안하게 대화하듯',
                        },
                        {
                          id: 'coach',
                          title: '스파르타',
                          desc: '에너제틱하고 불타오르는 어조',
                        },
                        {
                          id: 'whisper',
                          title: '속삭임',
                          desc: '조용히 속삭이는 ASMR',
                        },
                      ] as const
                    ).map((opt) => {
                      const isSelected = voice === opt.id;
                      return (
                        <Pressable
                          key={opt.id}
                          onPress={() => setVoice(opt.id)}
                          style={({ pressed }) => [
                            styles.card,
                            isSelected && styles.cardSelected,
                            pressed && styles.actionPressed,
                          ]}
                        >
                          <Text
                            style={[
                              styles.cardTitle,
                              isSelected && styles.cardTitleSelected,
                            ]}
                          >
                            {opt.title}
                          </Text>
                          <Text style={styles.cardDesc}>{opt.desc}</Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              )}

              {/* Step 4: Duration Selection */}
              {step === 4 && (
                <View style={styles.stepContainer}>
                  <View style={styles.titleSection}>
                    <Text style={styles.titleText}>팟캐스트 길이를</Text>
                    <Text style={styles.titleText}>정해주세요</Text>
                    <Text style={styles.subtitleText}>
                      이동 시간에 맞게 골라요
                    </Text>
                  </View>

                  <View style={styles.optionsList}>
                    {(
                      [
                        {
                          id: 5,
                          title: '5분',
                          desc: '핵심만 쏙쏙',
                        },
                        {
                          id: 10,
                          title: '10분',
                          desc: '적당한 깊이',
                        },
                        {
                          id: 20,
                          title: '20분',
                          desc: '충분한 설명',
                        },
                      ] as const
                    ).map((opt) => {
                      const isSelected = duration === opt.id;
                      return (
                        <Pressable
                          key={opt.id}
                          onPress={() => setDuration(opt.id)}
                          style={({ pressed }) => [
                            styles.card,
                            isSelected && styles.cardSelected,
                            pressed && styles.actionPressed,
                          ]}
                        >
                          <Text
                            style={[
                              styles.cardTitle,
                              isSelected && styles.cardTitleSelected,
                            ]}
                          >
                            {opt.title}
                          </Text>
                          <Text style={styles.cardDesc}>{opt.desc}</Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              )}
            </ScrollView>

            {/* Bottom Fixed Navigation Button */}
            <View style={styles.footer}>
              <Pressable
                onPress={() => {
                  if (step === 1 && !topic.trim()) return;
                  if (step < 4) {
                    transitionToStep((step + 1) as any);
                  } else {
                    handleCreate();
                  }
                }}
                style={({ pressed }) => [
                  styles.primaryButton,
                  step === 1 && !topic.trim() && styles.primaryButtonDisabled,
                  pressed && styles.primaryButtonPressed,
                ]}
                disabled={step === 1 && !topic.trim()}
              >
                <Text style={styles.primaryButtonText}>
                  {step === 4 ? '생성하기' : '다음으로'}
                </Text>
              </Pressable>
            </View>
          </Animated.View>
        </>
      ) : (
        /* Step 5: Loading Progress Screen */
        <Animated.View
          style={[styles.step5Container, { opacity: stepFadeAnim }]}
        >
          {/* Circular Progress Ring Container with spinning outer ring and static inner text */}
          <View style={styles.graphicWrapper}>
            <View
              style={[
                styles.progressRing,
                {
                  transform: [{ rotate: '45deg' }],
                  borderTopColor: prog.borderTopColor,
                  borderRightColor: prog.borderRightColor,
                  borderBottomColor: prog.borderBottomColor,
                  borderLeftColor: prog.borderLeftColor,
                  borderColor: prog.borderColor,
                },
              ]}
            />
            <View style={styles.progressRingInner}>
              <Text style={styles.progressPercentage}>{prog.percentage}</Text>
            </View>
          </View>

          <View style={styles.titleSectionCenter}>
            <Text style={styles.generatingTitle}>
              팟캐스트를 생성하고 있어요
            </Text>
            <Text style={styles.generatingSubtitle}>잠시만 기다려 주세요</Text>
          </View>

          <View style={styles.checklistContainer}>
            {renderProgressItem(1, '자료 분석', '진행중', '대기중')}
            {renderProgressItem(2, '스크립트 생성', '진행중', '대기중')}
            {renderProgressItem(3, 'TTS 변환', '진행중', '대기중')}
          </View>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.bgPage,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 12,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerSpacer: {
    width: 44,
  },
  actionPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.97 }],
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 9999,
    backgroundColor: Palette.primaryHover,
  },
  progressDotActive: {
    width: 24,
    backgroundColor: Palette.primary,
  },
  scrollContainer: {
    paddingHorizontal: 24,
    paddingBottom: 120,
    flexGrow: 1,
  },
  stepContainer: {
    paddingTop: 16,
  },
  titleSection: {
    marginBottom: 32,
  },
  titleSectionCenter: {
    alignItems: 'center',
    marginBottom: 40,
  },
  titleText: {
    fontSize: 24,
    color: Palette.textPrimary,
    fontFamily: Fonts.pretendardBold,
    lineHeight: 32,
  },
  subtitleText: {
    fontSize: 15,
    color: Palette.textPrimary,
    opacity: 0.5,
    fontFamily: Fonts.pretendardRegular,
    marginTop: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.primarySubtle,
    borderWidth: 1.5,
    borderColor: Palette.border,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
  },
  inputWrapperFilled: {
    borderColor: Palette.primary,
    backgroundColor: Palette.primaryMuted,
  },
  textInput: {
    flex: 1,
    height: '100%',
    color: Palette.textPrimary,
    fontSize: 15,
    fontFamily: Fonts.pretendardMedium,
  },
  clearButton: {
    padding: 4,
  },
  recommendSection: {
    marginTop: 32,
  },
  recommendTitle: {
    fontSize: 15,
    color: Palette.textPrimary,
    fontFamily: Fonts.pretendardMedium,
    marginBottom: 12,
  },
  recommendChip: {
    backgroundColor: Palette.primaryMuted,
    borderRadius: 9999,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  recommendChipSelected: {
    borderColor: Palette.primary,
    backgroundColor: Palette.primaryHover,
  },
  recommendChipText: {
    fontSize: 14,
    color: Palette.textPrimary,
    fontFamily: Fonts.pretendardRegular,
  },
  recommendChipTextSelected: {
    color: Palette.primary,
    fontFamily: Fonts.pretendardMedium,
  },
  optionsList: {
    gap: 12,
  },
  card: {
    backgroundColor: Palette.bgCard,
    borderWidth: 2,
    borderColor: Palette.border,
    borderRadius: 16,
    padding: 17,
    gap: 4,
  },
  cardSelected: {
    backgroundColor: Palette.primaryMuted,
    borderColor: Palette.primary,
  },
  cardTitle: {
    fontSize: 16,
    color: Palette.textPrimary,
    fontFamily: Fonts.pretendardMedium,
  },
  cardTitleSelected: {
    color: Palette.primary,
    fontFamily: Fonts.pretendardBold,
  },
  cardDesc: {
    fontSize: 13,
    color: Palette.textPrimary,
    opacity: 0.5,
    fontFamily: Fonts.pretendardRegular,
    lineHeight: 18,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingBottom: 28,
    paddingTop: 12,
    backgroundColor: Palette.bgPage,
  },
  primaryButton: {
    backgroundColor: Palette.primary,
    borderRadius: 16,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  primaryButtonDisabled: {
    backgroundColor: Palette.primaryDisabled,
    shadowOpacity: 0,
    elevation: 0,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Palette.bgCard,
    fontFamily: Fonts.pretendardBold,
  },
  step5Container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 48,
    paddingBottom: 80,
  },
  graphicWrapper: {
    width: 138,
    height: 138,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 48,
    position: 'relative',
  },
  progressRing: {
    position: 'absolute',
    width: 138,
    height: 138,
    borderRadius: 69,
    borderWidth: 8,
    backgroundColor: 'transparent',
  },
  progressRingInner: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: Palette.primaryMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressPercentage: {
    fontSize: 28,
    fontFamily: Fonts.googleSansFlexBold,
    color: Palette.primary,
  },
  generatingTitle: {
    fontSize: 20,
    color: Palette.textPrimary,
    fontFamily: Fonts.pretendardBold,
    textAlign: 'center',
  },
  generatingSubtitle: {
    fontSize: 15,
    color: Palette.textPrimary,
    opacity: 0.5,
    fontFamily: Fonts.pretendardRegular,
    textAlign: 'center',
    marginTop: 4,
  },
  checklistContainer: {
    width: '100%',
    paddingLeft: 12,
  },
  checklistItemContainer: {
    width: '100%',
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  circleIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleIconActive: {
    backgroundColor: Palette.primaryHover,
    borderWidth: 2,
    borderColor: Palette.primary,
  },
  circleIconComplete: {
    backgroundColor: Palette.primary,
  },
  circleIconWaiting: {
    backgroundColor: Palette.primaryHover,
  },
  circleTextActive: {
    color: Palette.primary,
    fontSize: 15,
    fontFamily: Fonts.googleSansFlexMedium,
  },
  circleTextComplete: {
    color: Palette.bgCard,
    fontSize: 15,
    fontFamily: Fonts.googleSansFlexMedium,
  },
  circleTextWaiting: {
    color: Palette.textPrimary,
    opacity: 0.5,
    fontSize: 15,
    fontFamily: Fonts.googleSansFlexMedium,
  },
  checklistTextContainer: {
    flex: 1,
    justifyContent: 'center',
    gap: 2,
  },
  checklistTitle: {
    fontSize: 15,
    fontFamily: Fonts.pretendardMedium,
    color: Palette.textPrimary,
  },
  checklistTitleWaiting: {
    color: Palette.textPrimary,
    opacity: 0.5,
  },
  checklistStatus: {
    fontSize: 13,
    fontFamily: Fonts.pretendardRegular,
  },
  checklistStatusActive: {
    color: Palette.primary,
  },
  checklistStatusComplete: {
    color: Palette.primary,
  },
  checklistStatusWaiting: {
    color: Palette.textPrimary,
    opacity: 0.5,
  },
  verticalLine: {
    width: 2,
    height: 32,
    backgroundColor: Palette.primaryHover,
    marginLeft: 21,
  },
  verticalLineComplete: {
    backgroundColor: Palette.primary,
  },
});
