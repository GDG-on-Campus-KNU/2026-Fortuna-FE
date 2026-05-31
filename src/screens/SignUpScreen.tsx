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

import { Fonts } from '@/src/shared/constants/theme';

export default function SignUpScreen() {
  // 화면 모드: 'landing' (소셜/이메일 선택) | 'email' (이메일 상세 정보 입력)
  const [signUpMode, setSignUpMode] = useState<'landing' | 'email'>('landing');

  // 입력 폼 상태들
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nickname, setNickname] = useState('');

  // 활성화 포커스 상태
  const [focusedInput, setFocusedInput] = useState<
    'email' | 'password' | 'confirmPassword' | 'nickname' | null
  >(null);

  // 비밀번호 보이기 상태
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // 약관 동의 상태들
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [agreeMarketing, setAgreeMarketing] = useState(false);

  // 가입 동작 및 결과 상태들
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [signUpSuccess, setSignUpSuccess] = useState(false);

  // 애니메이션 변수들
  const modeFadeAnim = useRef(new Animated.Value(1)).current; // 모드 트랜지션용 페이드
  const successFadeAnim = useRef(new Animated.Value(0)).current; // 가입 성공 모달용 페이드
  const successScaleAnim = useRef(new Animated.Value(0.7)).current; // 가입 성공 카드 스케일

  // 전체 동의 유도 헬퍼
  const agreeAll = agreeTerms && agreePrivacy && agreeMarketing;
  const handleToggleAgreeAll = () => {
    const nextVal = !agreeAll;
    setAgreeTerms(nextVal);
    setAgreePrivacy(nextVal);
    setAgreeMarketing(nextVal);
  };

  // 실시간 입력값 유효성 검사 규칙
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isPasswordValid =
    password.length >= 8 && /[A-Za-z]/.test(password) && /[0-9]/.test(password);
  const isPasswordMatch =
    password === confirmPassword && confirmPassword.length > 0;
  const isNicknameValid = nickname.trim().length >= 2;
  const areRequiredTermsAgreed = agreeTerms && agreePrivacy;

  // 전체 가입 폼 유효성 체크
  const isFormValid =
    isEmailValid &&
    isPasswordValid &&
    isPasswordMatch &&
    isNicknameValid &&
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
        router.replace('/(tabs)');
      }
    }
  };

  // 소셜 가입 모의 테스트
  const handleSocialSignUp = (provider: 'Google') => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setNickname(provider + ' 유저');
      setSignUpSuccess(true);

      Animated.parallel([
        Animated.timing(successFadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(successScaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    }, 1200);
  };

  // 이메일 회원가입 전송 핸들러
  const handleSignUp = () => {
    if (!isFormValid || isSubmitting) return;

    setIsSubmitting(true);

    // 모의 API 서버 가동 흉내
    setTimeout(() => {
      setIsSubmitting(false);
      setSignUpSuccess(true);

      Animated.parallel([
        Animated.timing(successFadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(successScaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    }, 1500);
  };

  // 가입 완료 후 홈 화면으로 가기
  const handleStartApp = () => {
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 백그라운드 피그마 소프트 블루 그라데이션 */}
      <LinearGradient
        colors={['#EBF2FE', '#FDFDFD']}
        locations={[0.40389, 0.50361]}
        style={StyleSheet.absoluteFillObject}
      />

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
                  <Ionicons name="school" size={32} color="#FFFFFF" />
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
                    disabled={isSubmitting}
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
                    disabled={isSubmitting}
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
                          color="#100C08"
                        />
                      </View>
                      <Text style={styles.socialButtonText}>
                        이메일로 계속하기
                      </Text>
                    </View>
                  </Pressable>
                </View>

                {/* 로딩 인디케이터 (소셜 로그인용) */}
                {isSubmitting && (
                  <ActivityIndicator
                    size="small"
                    color="#1E6AF4"
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
                  <Ionicons name="chevron-back" size={24} color="#0F172A" />
                </Pressable>
                <Text style={styles.headerBarTitle}>이메일 가입</Text>
                <View style={styles.headerBarPlaceholder} />
              </View>

              <ScrollView
                contentContainerStyle={styles.scrollContainer}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                {/* 환영 타이틀 */}
                <View style={styles.titleSection}>
                  <Text style={styles.titleText}>Studycast 가입하기</Text>
                  <Text style={styles.subtitleText}>
                    맞춤형 오디오와 암기송으로 낭비되는 이동 시간을 최고의 공부
                    시간으로 만들어보세요!
                  </Text>
                </View>

                {/* 1. 이메일 주소 입력 */}
                <View style={styles.inputSection}>
                  <Text style={styles.inputLabel}>이메일 주소</Text>
                  <View
                    style={[
                      styles.inputWrapper,
                      focusedInput === 'email' && styles.inputWrapperFocused,
                      email.length > 0 &&
                        !isEmailValid &&
                        styles.inputWrapperError,
                      email.length > 0 &&
                        isEmailValid &&
                        styles.inputWrapperSuccess,
                    ]}
                  >
                    <Ionicons
                      name="mail-outline"
                      size={20}
                      color={focusedInput === 'email' ? '#1E6AF4' : '#94A3B8'}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.textInput}
                      placeholder="example@email.com"
                      placeholderTextColor="#94A3B8"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      value={email}
                      onChangeText={setEmail}
                      onFocus={() => setFocusedInput('email')}
                      onBlur={() => setFocusedInput(null)}
                    />
                    {email.length > 0 && (
                      <Ionicons
                        name={
                          isEmailValid ? 'checkmark-circle' : 'alert-circle'
                        }
                        size={20}
                        color={isEmailValid ? '#10B981' : '#EF4444'}
                      />
                    )}
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
                      password.length > 0 &&
                        isPasswordValid &&
                        styles.inputWrapperSuccess,
                    ]}
                  >
                    <Ionicons
                      name="lock-closed-outline"
                      size={20}
                      color={
                        focusedInput === 'password' ? '#1E6AF4' : '#94A3B8'
                      }
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.textInput}
                      placeholder="비밀번호 조합 입력"
                      placeholderTextColor="#94A3B8"
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                      value={password}
                      onChangeText={setPassword}
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
                        color="#94A3B8"
                      />
                    </Pressable>
                  </View>
                  <Text
                    style={[
                      styles.helperText,
                      password.length > 0 &&
                        !isPasswordValid &&
                        styles.helperTextError,
                      password.length > 0 &&
                        isPasswordValid &&
                        styles.helperTextSuccess,
                    ]}
                  >
                    💡 영문 대소문자 및 숫자를 조합하여 8자 이상 작성해 주세요.
                  </Text>
                </View>

                {/* 3. 비밀번호 확인 */}
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
                      confirmPassword.length > 0 &&
                        isPasswordMatch &&
                        styles.inputWrapperSuccess,
                    ]}
                  >
                    <Ionicons
                      name="checkmark-done-outline"
                      size={20}
                      color={
                        focusedInput === 'confirmPassword'
                          ? '#1E6AF4'
                          : '#94A3B8'
                      }
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.textInput}
                      placeholder="비밀번호 다시 입력"
                      placeholderTextColor="#94A3B8"
                      secureTextEntry={!showConfirmPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
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
                        color="#94A3B8"
                      />
                    </Pressable>
                  </View>
                  {confirmPassword.length > 0 && !isPasswordMatch && (
                    <Text style={styles.errorText}>
                      입력하신 비밀번호와 다릅니다. 다시 확인해 주세요.
                    </Text>
                  )}
                  {confirmPassword.length > 0 && isPasswordMatch && (
                    <Text style={styles.successText}>
                      비밀번호가 안전하게 일치합니다.
                    </Text>
                  )}
                </View>

                {/* 4. 닉네임 입력 */}
                <View style={styles.inputSection}>
                  <Text style={styles.inputLabel}>닉네임</Text>
                  <View
                    style={[
                      styles.inputWrapper,
                      focusedInput === 'nickname' && styles.inputWrapperFocused,
                      nickname.length > 0 &&
                        !isNicknameValid &&
                        styles.inputWrapperError,
                      nickname.length > 0 &&
                        isNicknameValid &&
                        styles.inputWrapperSuccess,
                    ]}
                  >
                    <Ionicons
                      name="person-outline"
                      size={20}
                      color={
                        focusedInput === 'nickname' ? '#1E6AF4' : '#94A3B8'
                      }
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.textInput}
                      placeholder="닉네임 (2글자 이상)"
                      placeholderTextColor="#94A3B8"
                      autoCapitalize="none"
                      autoCorrect={false}
                      maxLength={12}
                      value={nickname}
                      onChangeText={setNickname}
                      onFocus={() => setFocusedInput('nickname')}
                      onBlur={() => setFocusedInput(null)}
                    />
                    {nickname.length > 0 && (
                      <Ionicons
                        name={
                          isNicknameValid ? 'checkmark-circle' : 'alert-circle'
                        }
                        size={20}
                        color={isNicknameValid ? '#10B981' : '#EF4444'}
                      />
                    )}
                  </View>
                  {nickname.length > 0 && !isNicknameValid && (
                    <Text style={styles.errorText}>
                      한글, 영문 구분 없이 최소 2글자 이상 입력해 주세요.
                    </Text>
                  )}
                </View>

                {/* 약관 동의 체크박스 영역 */}
                <View style={styles.termsContainer}>
                  {/* 1. 전체 동의 */}
                  <Pressable
                    onPress={handleToggleAgreeAll}
                    style={({ pressed }) => [
                      styles.agreeAllRow,
                      pressed && styles.actionPressed,
                    ]}
                  >
                    <View
                      style={[
                        styles.customCircleCheckbox,
                        agreeAll && styles.customCheckboxCheckedBlue,
                      ]}
                    >
                      {agreeAll && (
                        <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                      )}
                    </View>
                    <Text style={styles.agreeAllText}>
                      StudyCast 서비스 약관에 모두 동의합니다
                    </Text>
                  </Pressable>

                  <View style={styles.termsDivider} />

                  {/* 2. 이용 약관 (필수) */}
                  <Pressable
                    onPress={() => setAgreeTerms(!agreeTerms)}
                    style={({ pressed }) => [
                      styles.termRow,
                      pressed && styles.actionPressed,
                    ]}
                  >
                    <View
                      style={[
                        styles.customSquareCheckbox,
                        agreeTerms && styles.customSquareCheckboxChecked,
                      ]}
                    >
                      {agreeTerms && (
                        <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                      )}
                    </View>
                    <Text style={styles.termLabel}>
                      <Text style={styles.requiredMark}>(필수)</Text> 서비스
                      이용 약관 동의
                    </Text>
                    <Ionicons
                      name="chevron-forward"
                      size={16}
                      color="#94A3B8"
                      style={styles.termArrow}
                    />
                  </Pressable>

                  {/* 3. 개인정보 처리 (필수) */}
                  <Pressable
                    onPress={() => setAgreePrivacy(!agreePrivacy)}
                    style={({ pressed }) => [
                      styles.termRow,
                      pressed && styles.actionPressed,
                    ]}
                  >
                    <View
                      style={[
                        styles.customSquareCheckbox,
                        agreePrivacy && styles.customSquareCheckboxChecked,
                      ]}
                    >
                      {agreePrivacy && (
                        <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                      )}
                    </View>
                    <Text style={styles.termLabel}>
                      <Text style={styles.requiredMark}>(필수)</Text> 개인정보
                      수집 및 이용 동의
                    </Text>
                    <Ionicons
                      name="chevron-forward"
                      size={16}
                      color="#94A3B8"
                      style={styles.termArrow}
                    />
                  </Pressable>

                  {/* 4. 마케팅 야간 정보 수신 (선택) */}
                  <Pressable
                    onPress={() => setAgreeMarketing(!agreeMarketing)}
                    style={({ pressed }) => [
                      styles.termRow,
                      pressed && styles.actionPressed,
                    ]}
                  >
                    <View
                      style={[
                        styles.customSquareCheckbox,
                        agreeMarketing && styles.customSquareCheckboxChecked,
                      ]}
                    >
                      {agreeMarketing && (
                        <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                      )}
                    </View>
                    <Text style={styles.termLabel}>
                      <Text style={styles.optionalMark}>(선택)</Text> 서비스
                      혜택 및 광고 마케팅 정보 수신 동의
                    </Text>
                  </Pressable>
                </View>

                {/* 가입하기 버튼 */}
                <Pressable
                  onPress={handleSignUp}
                  disabled={!isFormValid || isSubmitting}
                  style={({ pressed }) => [
                    styles.signUpButton,
                    !isFormValid && styles.signUpButtonDisabled,
                    pressed && isFormValid && styles.signUpButtonPressed,
                  ]}
                >
                  {isSubmitting ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.signUpButtonText}>가입 완료하기</Text>
                  )}
                </Pressable>

                <View style={styles.bottomLinkContainer}>
                  <Text style={styles.bottomInfoText}>
                    이미 StudyCast 계정이 있으신가요?
                  </Text>
                  <Pressable
                    onPress={() => {
                      router.push('/signin');
                    }}
                    style={({ pressed }) => pressed && styles.actionPressed}
                  >
                    <Text style={styles.bottomLinkText}>로그인하기</Text>
                  </Pressable>
                </View>
              </ScrollView>
            </View>
          )}
        </Animated.View>
      </KeyboardAvoidingView>

      {/* 회원가입 성공 애니메이션 오버레이 모달 */}
      {signUpSuccess && (
        <Animated.View
          style={[styles.successOverlay, { opacity: successFadeAnim }]}
        >
          <Animated.View
            style={[
              styles.successCard,
              { transform: [{ scale: successScaleAnim }] },
            ]}
          >
            {/* 성공 폭죽 느낌 아이콘 */}
            <View style={styles.successIconBg}>
              <Ionicons
                name="sparkles"
                size={32}
                color="#F59E0B"
                style={styles.sparkleIconLeft}
              />
              <View style={styles.checkInnerCircle}>
                <Ionicons name="checkmark" size={48} color="#FFFFFF" />
              </View>
              <Ionicons
                name="heart"
                size={24}
                color="#EF4444"
                style={styles.heartIconRight}
              />
            </View>

            {/* 환영 정보 */}
            <Text style={styles.successTitle}>반갑습니다, {nickname}님!</Text>
            <Text style={styles.successSub}>
              StudyCast 가입을 진심으로 축하합니다.
            </Text>

            <View style={styles.successTipBox}>
              <Text style={styles.successTipText}>
                🎓 <Text style={styles.successTipBold}>Tip.</Text> 이제 두 번째
                탭인 {"'팟캐스트 생성'"}에서 PDF 파일을 업로드하면 AI 학습
                오디오 및 암기곡을 바로 받아보실 수 있습니다.
              </Text>
            </View>

            {/* 시작하기 단독 버튼 */}
            <Pressable
              onPress={handleStartApp}
              style={({ pressed }) => [
                styles.successAppButton,
                pressed && styles.successAppButtonPressed,
              ]}
            >
              <Text style={styles.successAppButtonText}>학습 시작하기 🎙️</Text>
            </Pressable>
          </Animated.View>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFDFD',
  },
  gradientHeaderBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '35%',
    backgroundColor: '#EBF2FE',
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
    backgroundColor: '#1E6AF4',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#1E6AF4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  brandTitle: {
    fontSize: 40,
    // fontWeight: '800',
    color: '#100C08',
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
    color: '#100C08',
    marginBottom: 8,
    fontFamily: Fonts.pretendardExtraBold,
  },
  landingSubtitle: {
    fontSize: 15,
    color: '#64748B',
    fontFamily: Fonts.pretendardRegular,
  },
  socialBtnGroup: {
    gap: 12,
  },
  socialButton: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(16, 12, 8, 0.1)',
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
    fontWeight: '600',
    color: '#100C08',
    fontFamily: Fonts.pretendardSemiBold,
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
    color: 'rgba(16, 12, 8, 0.5)',
    fontFamily: Fonts.pretendardRegular,
  },
  landingFooterLink: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1E6AF4',
    fontFamily: Fonts.pretendardExtraBold,
  },
  /* ========================================================
     2. 폼 상세 화면 스타일
     ======================================================== */
  formContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 56,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerBarTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    fontFamily: Fonts.pretendardBold,
  },
  headerBarPlaceholder: {
    width: 40,
  },
  scrollContainer: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 60,
  },
  titleSection: {
    marginBottom: 28,
  },
  titleText: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
    fontFamily: Fonts.pretendardExtraBold,
  },
  subtitleText: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
    fontFamily: Fonts.pretendardRegular,
  },
  inputSection: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8,
    fontFamily: Fonts.pretendardBold,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 16,
  },
  inputWrapperFocused: {
    borderColor: '#1E6AF4',
    shadowColor: '#1E6AF4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 1,
  },
  inputWrapperError: {
    borderColor: '#EF4444',
  },
  inputWrapperSuccess: {
    borderColor: '#10B981',
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: '#0F172A',
    fontFamily: Fonts.pretendardRegular,
    height: '100%',
  },
  eyeButton: {
    padding: 6,
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 6,
    fontWeight: '600',
    fontFamily: Fonts.pretendardSemiBold,
  },
  successText: {
    fontSize: 12,
    color: '#10B981',
    marginTop: 6,
    fontWeight: '600',
    fontFamily: Fonts.pretendardSemiBold,
  },
  helperText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 6,
    lineHeight: 16,
    fontFamily: Fonts.pretendardRegular,
  },
  helperTextError: {
    color: '#EF4444',
    fontWeight: '600',
  },
  helperTextSuccess: {
    color: '#10B981',
    fontWeight: '600',
  },
  termsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginTop: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  agreeAllRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  customCircleCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  customCheckboxCheckedBlue: {
    backgroundColor: '#1E6AF4',
    borderColor: '#1E6AF4',
  },
  agreeAllText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1E293B',
    fontFamily: Fonts.pretendardExtraBold,
  },
  termsDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 6,
  },
  termRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  customSquareCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  customSquareCheckboxChecked: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  termLabel: {
    flex: 1,
    fontSize: 13,
    color: '#475569',
    fontFamily: Fonts.pretendardRegular,
  },
  requiredMark: {
    color: '#1E6AF4',
    fontWeight: '700',
  },
  optionalMark: {
    color: '#64748B',
    fontWeight: '600',
  },
  termArrow: {
    paddingLeft: 8,
  },
  actionPressed: {
    opacity: 0.7,
  },
  signUpButton: {
    backgroundColor: '#1E6AF4',
    height: 54,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#1E6AF4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 3,
  },
  signUpButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  signUpButtonDisabled: {
    backgroundColor: '#CBD5E1',
    shadowOpacity: 0,
    elevation: 0,
  },
  signUpButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    fontFamily: Fonts.pretendardExtraBold,
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
    color: '#64748B',
    fontFamily: Fonts.pretendardRegular,
  },
  bottomLinkText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E6AF4',
    fontFamily: Fonts.pretendardBold,
  },
  /* ========================================================
     3. 회원가입 성공 오버레이 모달 스타일
     ======================================================= */
  successOverlay: {
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    zIndex: 9999,
  },
  successCard: {
    backgroundColor: '#FFFFFF',
    width: '100%',
    borderRadius: 28,
    paddingVertical: 36,
    paddingHorizontal: 24,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  successIconBg: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    position: 'relative',
  },
  checkInnerCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sparkleIconLeft: {
    position: 'absolute',
    left: -12,
    top: -4,
  },
  heartIconRight: {
    position: 'absolute',
    right: -10,
    bottom: 4,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
    fontFamily: Fonts.pretendardExtraBold,
    textAlign: 'center',
  },
  successSub: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 24,
    fontFamily: Fonts.pretendardRegular,
    textAlign: 'center',
  },
  successTipBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 28,
  },
  successTipText: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
    fontFamily: Fonts.pretendardRegular,
  },
  successTipBold: {
    fontWeight: '700',
    color: '#1E6AF4',
  },
  successAppButton: {
    backgroundColor: '#1E6AF4',
    width: '100%',
    paddingVertical: 16,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#1E6AF4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 3,
  },
  successAppButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  successAppButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    fontFamily: Fonts.pretendardExtraBold,
  },
});
