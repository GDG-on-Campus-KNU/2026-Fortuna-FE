import React, { useState, useRef } from 'react';
import {
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

import { Fonts, Palette } from '@/src/shared/constants/theme';
import { useAuthForm } from '@/src/entities/auth';

export default function SignUpScreen() {
  // 화면 모드: 'landing' (소셜/이메일 선택) | 'email' (이메일 상세 정보 입력)
  const [signUpMode, setSignUpMode] = useState<'landing' | 'email'>('landing');

  // 입력 폼 상태들
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // 활성화 포커스 상태
  const [focusedInput, setFocusedInput] = useState<
    'email' | 'password' | 'confirmPassword' | null
  >(null);

  // 비밀번호 보이기 상태
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // 약관 동의 상태들 (피그마 디자인에 맞춰 필수 2개만 관리)
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);

  // 가입 동작 및 결과 상태들
  const { submit, submitting, error, clearError } = useAuthForm('signup');

  const onChangeEmail = (val: string) => {
    if (error) clearError();
    setEmail(val);
  };

  const onChangePassword = (val: string) => {
    if (error) clearError();
    setPassword(val);
  };

  const onChangeConfirmPassword = (val: string) => {
    if (error) clearError();
    setConfirmPassword(val);
  };

  // 애니메이션 변수들
  const modeFadeAnim = useRef(new Animated.Value(1)).current; // 모드 트랜지션용 페이드

  // 실시간 입력값 유효성 검사 규칙
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isPasswordValid =
    password.length >= 8 && /[A-Za-z]/.test(password) && /[0-9]/.test(password);
  const isPasswordMatch =
    password === confirmPassword && confirmPassword.length > 0;
  const areRequiredTermsAgreed = agreeTerms && agreePrivacy;

  // 전체 가입 폼 유효성 체크
  const isFormValid =
    isEmailValid &&
    isPasswordValid &&
    isPasswordMatch &&
    areRequiredTermsAgreed;

  // 화면 전환 (애니메이션 탑재)
  const transitionToMode = (targetMode: 'landing' | 'email') => {
    Animated.timing(modeFadeAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      setSignUpMode(targetMode);
      Animated.timing(modeFadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });
  };

  // 뒤로 가기 처리
  const handleBack = () => {
    if (signUpMode === 'email') {
      transitionToMode('landing');
    } else {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/');
      }
    }
  };

  // 소셜 가입 모의 테스트
  const handleSocialSignUp = (provider: 'Google') => {
    if (submitting) return;
    Alert.alert('소셜 회원가입', 'Google 회원가입을 진행합니다.');
  };

  // 이메일 회원가입 전송 핸들러
  const handleSignUp = () => {
    if (!isFormValid || submitting) return;
    submit({ email, password });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 백그라운드 피그마 소프트 블루 그라데이션 - 랜딩 화면에서만 노출 */}
      {signUpMode === 'landing' && (
        <LinearGradient
          colors={[Palette.primaryLight, Palette.bgPage]}
          locations={[0.40389, 0.50361]}
          style={StyleSheet.absoluteFillObject}
        />
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <Animated.View
          style={[styles.animatedContent, { opacity: modeFadeAnim }]}
        >
          {signUpMode === 'landing' ? (
            /* ========================================================
               1. 피그마 메인 계정 생성 (Landing) 화면
               ======================================================== */
            <View style={styles.landingContainer}>
              {/* 상단 로고 영역 */}
              <View style={styles.logoSection}>
                <View style={styles.appIconBadge}>
                  <Ionicons name="school" size={32} color={Palette.bgCard} />
                </View>
                <Text style={styles.brandTitle}>Studycast</Text>
              </View>

              {/* 하단 영역 (액션 카드) */}
              <View style={styles.actionSection}>
                {/* 텍스트 타이틀 */}
                <View style={styles.landingTitleBox}>
                  <Text style={styles.landingTitle}>계정 만들기</Text>
                  <Text style={styles.landingSubtitle}>
                    소셜 계정으로 빠르게 시작하세요
                  </Text>
                </View>

                {/* 가입 버튼 모음 */}
                <View style={styles.socialBtnGroup}>
                  {/* Google 가입 버튼 */}
                  <Pressable
                    onPress={() => handleSocialSignUp('Google')}
                    disabled={submitting}
                    style={({ pressed }) => [
                      styles.socialButton,
                      pressed && styles.actionPressed,
                    ]}
                  >
                    <View style={styles.socialBtnContent}>
                      <View style={styles.googleIconContainer}>
                        <Image
                          source={{
                            uri: 'https://developers.google.com/identity/images/g-logo.png',
                          }}
                          style={{ width: 20, height: 20 }}
                        />
                      </View>
                      <Text style={styles.socialButtonText}>
                        Google 계정으로 계속하기
                      </Text>
                    </View>
                  </Pressable>

                  {/* 이메일 가입 버튼 */}
                  <Pressable
                    onPress={() => transitionToMode('email')}
                    disabled={submitting}
                    style={({ pressed }) => [
                      styles.socialButton,
                      pressed && styles.actionPressed,
                    ]}
                  >
                    <View style={styles.socialBtnContent}>
                      <View style={styles.mailIconContainer}>
                        <Ionicons
                          name="mail-outline"
                          size={18}
                          color={Palette.textPrimary}
                        />
                      </View>
                      <Text style={styles.socialButtonText}>
                        이메일로 계속하기
                      </Text>
                    </View>
                  </Pressable>
                </View>

                {/* 로딩 인디케이터 (소셜 로그인용) */}
                {submitting && (
                  <ActivityIndicator
                    size="small"
                    color={Palette.primary}
                    style={styles.landingLoader}
                  />
                )}
              </View>

              {/* 하단 로그인 링크 */}
              <View style={styles.landingFooter}>
                <Text style={styles.landingFooterText}>
                  이미 계정이 있으신가요?
                </Text>
                <Pressable
                  onPress={() => {
                    router.push('/signin');
                  }}
                  style={({ pressed }) => pressed && styles.actionPressed}
                >
                  <Text style={styles.landingFooterLink}>로그인하기</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            /* ========================================================
               2. 상세 이메일 회원가입 (Form) 화면
               ======================================================== */
            <View style={styles.formContainer}>
              {/* 상단 헤더 바 */}
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
              </View>

              <ScrollView
                contentContainerStyle={styles.scrollContainer}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                {/* 환영 타이틀 */}
                <View style={styles.titleSection}>
                  <Text style={styles.titleText}>계정 만들기</Text>
                  <Text style={styles.subtitleText}>학습을 시작해보세요</Text>
                </View>

                {/* 1. 이메일 입력 */}
                <View style={styles.inputSection}>
                  <Text style={styles.inputLabel}>이메일</Text>
                  <View
                    style={[
                      styles.inputWrapper,
                      focusedInput === 'email' && styles.inputWrapperFocused,
                      email.length > 0 &&
                        !isEmailValid &&
                        styles.inputWrapperError,
                    ]}
                  >
                    <TextInput
                      style={styles.textInput}
                      placeholder="example@email.com"
                      placeholderTextColor={Palette.textPlaceholder}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      value={email}
                      onChangeText={onChangeEmail}
                      onFocus={() => setFocusedInput('email')}
                      onBlur={() => setFocusedInput(null)}
                    />
                  </View>
                  {email.length > 0 && !isEmailValid && (
                    <Text style={styles.errorText}>
                      올바른 이메일 주소 형식을 입력해 주세요.
                    </Text>
                  )}
                </View>

                {/* 2. 비밀번호 입력 */}
                <View style={styles.inputSection}>
                  <Text style={styles.inputLabel}>비밀번호</Text>
                  <View
                    style={[
                      styles.inputWrapper,
                      focusedInput === 'password' && styles.inputWrapperFocused,
                      password.length > 0 &&
                        !isPasswordValid &&
                        styles.inputWrapperError,
                    ]}
                  >
                    <TextInput
                      style={styles.textInput}
                      placeholder="••••••••"
                      placeholderTextColor={Palette.textPlaceholder}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                      value={password}
                      onChangeText={onChangePassword}
                      onFocus={() => setFocusedInput('password')}
                      onBlur={() => setFocusedInput(null)}
                    />
                    <Pressable
                      onPress={() => setShowPassword(!showPassword)}
                      style={styles.eyeButton}
                    >
                      <Ionicons
                        name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                        size={20}
                        color={Palette.textPrimary}
                        style={{ opacity: 0.5 }}
                      />
                    </Pressable>
                  </View>
                  {password.length > 0 && !isPasswordValid && (
                    <Text style={styles.errorText}>
                      영문, 숫자 조합 8자 이상 작성해 주세요.
                    </Text>
                  )}
                </View>

                {/* 3. 비밀번호 확인 입력 */}
                <View style={styles.inputSection}>
                  <Text style={styles.inputLabel}>비밀번호 확인</Text>
                  <View
                    style={[
                      styles.inputWrapper,
                      focusedInput === 'confirmPassword' &&
                        styles.inputWrapperFocused,
                      confirmPassword.length > 0 &&
                        !isPasswordMatch &&
                        styles.inputWrapperError,
                    ]}
                  >
                    <TextInput
                      style={styles.textInput}
                      placeholder="••••••••"
                      placeholderTextColor={Palette.textPlaceholder}
                      secureTextEntry={!showConfirmPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                      value={confirmPassword}
                      onChangeText={onChangeConfirmPassword}
                      onFocus={() => setFocusedInput('confirmPassword')}
                      onBlur={() => setFocusedInput(null)}
                    />
                    <Pressable
                      onPress={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      style={styles.eyeButton}
                    >
                      <Ionicons
                        name={
                          showConfirmPassword
                            ? 'eye-off-outline'
                            : 'eye-outline'
                        }
                        size={20}
                        color={Palette.textPrimary}
                        style={{ opacity: 0.5 }}
                      />
                    </Pressable>
                  </View>
                  {confirmPassword.length > 0 && !isPasswordMatch && (
                    <Text style={styles.errorText}>
                      입력하신 비밀번호와 다릅니다. 다시 확인해 주세요.
                    </Text>
                  )}
                </View>

                {/* 이용 약관 동의 체크박스 영역 */}
                <View style={styles.inputSection}>
                  <Text style={styles.inputLabel}>이용 약관</Text>
                  <View style={styles.termsContainer}>
                    {/* 1. 서비스 이용 약관 동의 (필수) */}
                    <Pressable
                      onPress={() => setAgreeTerms(!agreeTerms)}
                      style={({ pressed }) => [
                        styles.termRow,
                        pressed && styles.actionPressed,
                      ]}
                    >
                      <View
                        style={[
                          styles.customCircleCheckbox,
                          agreeTerms && styles.customCircleCheckboxChecked,
                        ]}
                      >
                        {agreeTerms && (
                          <Ionicons
                            name="checkmark"
                            size={12}
                            color={Palette.bgCard}
                          />
                        )}
                      </View>
                      <Text style={styles.termLabel}>
                        (필수) 서비스 이용 약관 동의
                      </Text>
                    </Pressable>

                    {/* 2. 개인정보 수집 및 이용 동의 (필수) */}
                    <Pressable
                      onPress={() => setAgreePrivacy(!agreePrivacy)}
                      style={({ pressed }) => [
                        styles.termRow,
                        pressed && styles.actionPressed,
                      ]}
                    >
                      <View
                        style={[
                          styles.customCircleCheckbox,
                          agreePrivacy && styles.customCircleCheckboxChecked,
                        ]}
                      >
                        {agreePrivacy && (
                          <Ionicons
                            name="checkmark"
                            size={12}
                            color={Palette.bgCard}
                          />
                        )}
                      </View>
                      <Text style={styles.termLabel}>
                        (필수) 개인정보 수집 및 이용 동의
                      </Text>
                    </Pressable>
                  </View>
                </View>
              </ScrollView>

              {/* 하단 고정 버튼 영역 */}
              <View style={styles.bottomButtonSection}>
                {error ? (
                  <Text style={styles.formErrorText}>{error}</Text>
                ) : null}
                <Pressable
                  onPress={handleSignUp}
                  disabled={!isFormValid || submitting}
                  style={({ pressed }) => [
                    styles.signUpButton,
                    !isFormValid && styles.signUpButtonDisabled,
                    pressed && isFormValid && styles.signUpButtonPressed,
                  ]}
                >
                  {submitting ? (
                    <ActivityIndicator size="small" color={Palette.bgCard} />
                  ) : (
                    <Text style={styles.signUpButtonText}>계정 생성하기</Text>
                  )}
                </Pressable>
              </View>
            </View>
          )}
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.bgPage,
  },
  gradientHeaderBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '35%',
    backgroundColor: Palette.primaryLight,
  },
  keyboardView: {
    flex: 1,
  },
  animatedContent: {
    flex: 1,
  },
  /* ========================================================
     1. 랜딩 화면 스타일
     ======================================================== */
  landingContainer: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 40 : 64,
    paddingBottom: Platform.OS === 'ios' ? 40 : 64,
  },
  logoSection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
  },
  appIconBadge: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: Palette.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Palette.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  brandTitle: {
    fontSize: 40,
    color: Palette.textPrimary,
    marginTop: 10,
    fontFamily: Fonts.googleSansFlexBold,
    letterSpacing: -0.5,
  },
  actionSection: {
    width: '100%',
    marginTop: 20,
  },
  landingTitleBox: {
    marginBottom: 32,
    alignItems: 'flex-start',
  },
  landingTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Palette.textPrimary,
    marginBottom: 8,
    fontFamily: Fonts.pretendardExtraBold,
  },
  landingSubtitle: {
    fontSize: 15,
    color: Palette.textSecondary,
    fontFamily: Fonts.pretendardRegular,
  },
  socialBtnGroup: {
    gap: 12,
  },
  socialButton: {
    width: '100%',
    backgroundColor: Palette.bgCard,
    borderWidth: 1,
    borderColor: Palette.borderDark,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  socialBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  googleIconContainer: {
    marginRight: 10,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mailIconContainer: {
    marginRight: 10,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  socialButtonText: {
    fontSize: 15,
    color: Palette.textPrimary,
    fontFamily: Fonts.pretendardRegular,
  },
  landingLoader: {
    marginTop: 20,
    alignSelf: 'center',
  },
  landingFooter: {
    alignItems: 'center',
    gap: 6,
    marginTop: 40,
  },
  landingFooterText: {
    fontSize: 15,
    color: Palette.textOpMuted,
    fontFamily: Fonts.pretendardRegular,
  },
  landingFooterLink: {
    fontSize: 15,
    color: Palette.primary,
    fontFamily: Fonts.pretendardRegular,
  },
  /* ========================================================
     2. 폼 상세 화면 스타일
     ======================================================== */
  formContainer: {
    flex: 1,
    backgroundColor: Palette.bgPage,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    height: 56,
    backgroundColor: Palette.bgPage,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingLeft: 16,
  },
  headerBarTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Palette.textDarkSlate,
    fontFamily: Fonts.pretendardBold,
  },
  headerBarPlaceholder: {
    width: 40,
  },
  scrollContainer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 60,
  },
  titleSection: {
    marginBottom: 32,
    gap: 8,
  },
  titleText: {
    fontSize: 24,
    fontWeight: '800',
    color: Palette.textPrimary,
    fontFamily: Fonts.pretendardBold,
  },
  subtitleText: {
    fontSize: 15,
    color: Palette.textPrimary,
    opacity: 0.5,
    fontFamily: Fonts.pretendardRegular,
  },
  inputSection: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 15,
    color: Palette.textPrimary,
    marginBottom: 4,
    fontFamily: Fonts.pretendardRegular,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    backgroundColor: Palette.primaryMuted,
    borderWidth: 1,
    borderColor: Palette.borderDark,
    borderRadius: 16,
    paddingHorizontal: 16,
  },
  inputWrapperFocused: {
    borderColor: Palette.primary,
  },
  inputWrapperError: {
    borderColor: Palette.error,
  },
  inputWrapperSuccess: {
    borderColor: Palette.success,
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: Palette.textPrimary,
    fontFamily: Fonts.pretendardRegular,
    height: '100%',
  },
  eyeButton: {
    padding: 6,
  },
  errorText: {
    fontSize: 12,
    color: Palette.error,
    marginTop: 6,
    fontWeight: '600',
    fontFamily: Fonts.pretendardSemiBold,
  },
  successText: {
    fontSize: 12,
    color: Palette.success,
    marginTop: 6,
    fontWeight: '600',
    fontFamily: Fonts.pretendardSemiBold,
  },
  helperText: {
    fontSize: 12,
    color: Palette.textSecondary,
    marginTop: 6,
    lineHeight: 16,
    fontFamily: Fonts.pretendardRegular,
  },
  helperTextError: {
    color: Palette.error,
    fontWeight: '600',
  },
  helperTextSuccess: {
    color: Palette.success,
    fontWeight: '600',
  },
  termsContainer: {
    borderWidth: 1,
    borderColor: Palette.borderDark,
    borderRadius: 16,
    padding: 16,
    gap: 16,
    marginTop: 4,
  },
  termRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  customCircleCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Palette.borderDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  customCircleCheckboxChecked: {
    backgroundColor: Palette.primary,
    borderColor: Palette.primary,
  },
  termLabel: {
    fontSize: 15,
    color: Palette.textPrimary,
    fontFamily: Fonts.pretendardRegular,
  },
  actionPressed: {
    opacity: 0.7,
  },
  signUpButton: {
    backgroundColor: Palette.primary,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signUpButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  signUpButtonDisabled: {
    backgroundColor: Palette.disabled,
  },
  signUpButtonText: {
    fontSize: 15,
    color: Palette.bgCard,
    fontFamily: Fonts.pretendardMedium,
  },
  bottomLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    gap: 8,
  },
  bottomInfoText: {
    fontSize: 13,
    color: Palette.textSecondary,
    fontFamily: Fonts.pretendardRegular,
  },
  bottomLinkText: {
    fontSize: 13,
    fontWeight: '700',
    color: Palette.primary,
    fontFamily: Fonts.pretendardBold,
  },
  formErrorText: {
    fontSize: 13,
    color: Palette.error,
    marginBottom: 10,
    fontWeight: '600',
    fontFamily: Fonts.pretendardSemiBold,
    textAlign: 'center',
  },
  bottomButtonSection: {
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 20 : 32,
    paddingTop: 12,
    backgroundColor: Palette.bgPage,
  },
});
