import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

import { Fonts } from '@/src/shared/constants/theme';

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [focusedInput, setFocusedInput] = useState<'email' | 'password' | null>(
    null,
  );
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 이메일 정규식 유효성 검사
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isFormValid = isEmailValid && password.trim().length >= 6;

  // 일반 이메일 로그인 시뮬레이션
  const handleSignIn = () => {
    if (!isFormValid || isSubmitting) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      // 홈 화면(tabs)으로 이동
      router.replace('/(tabs)');
    }, 1200);
  };

  // Google 소셜 로그인 시뮬레이션
  const handleGoogleSignIn = () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      router.replace('/(tabs)');
    }, 1000);
  };

  const handleForgotPassword = () => {
    Alert.alert(
      '비밀번호 재설정',
      '비밀번호 재설정 링크가 가입하신 이메일로 전송됩니다.',
      [{ text: '확인' }],
    );
  };

  const handleNavigateToSignUp = () => {
    router.push('/signup');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 백그라운드 피그마 소프트 블루 그라데이션 */}
      <LinearGradient
        colors={['#EBF2FE', '#FDFDFD']}
        locations={[0.20445, 0.29875]}
        style={StyleSheet.absoluteFillObject}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* 상단 로고 영역 */}
          <View style={styles.logoSection}>
            <View style={styles.appIconBadge}>
              <Ionicons name="school" size={32} color="#FFFFFF" />
            </View>
            <Text style={styles.brandTitle}>Studycast</Text>
          </View>

          {/* 타이틀 및 서브타이틀 영역 */}
          <View style={styles.titleSection}>
            <Text style={styles.titleText}>로그인</Text>
            <Text style={styles.subtitleText}>학습을 이어가세요</Text>
          </View>

          {/* 입력 폼 영역 */}
          <View style={styles.formContainer}>
            {/* 이메일 입력 */}
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>이메일</Text>
              <View
                style={[
                  styles.inputWrapper,
                  focusedInput === 'email' && styles.inputWrapperFocused,
                  email.length > 0 && !isEmailValid && styles.inputWrapperError,
                ]}
              >
                <TextInput
                  style={styles.textInput}
                  placeholder="example@email.com"
                  placeholderTextColor="rgba(16, 12, 8, 0.3)"
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
                    name={isEmailValid ? 'checkmark-circle' : 'alert-circle'}
                    size={20}
                    color={isEmailValid ? '#10B981' : '#EF4444'}
                  />
                )}
              </View>
            </View>

            {/* 비밀번호 입력 */}
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>비밀번호</Text>
              <View
                style={[
                  styles.inputWrapper,
                  focusedInput === 'password' && styles.inputWrapperFocused,
                ]}
              >
                <TextInput
                  style={styles.textInput}
                  placeholder="••••••••"
                  placeholderTextColor="rgba(16, 12, 8, 0.3)"
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
                    color="rgba(16, 12, 8, 0.5)"
                  />
                </Pressable>
              </View>
              {/* 비밀번호 찾기 */}
              <Pressable
                onPress={handleForgotPassword}
                style={({ pressed }) => [
                  styles.forgotPasswordBox,
                  pressed && styles.actionPressed,
                ]}
              >
                <Text style={styles.forgotPasswordText}>비밀번호 찾기</Text>
              </Pressable>
            </View>
          </View>

          {/* 로그인 버튼 */}
          <Pressable
            onPress={handleSignIn}
            disabled={!isFormValid || isSubmitting}
            style={({ pressed }) => [
              styles.signInButton,
              !isFormValid && styles.signInButtonDisabled,
              pressed && isFormValid && styles.signInButtonPressed,
            ]}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.signInButtonText}>로그인</Text>
            )}
          </Pressable>

          {/* "또는" 구분선 */}
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>또는</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Google 로그인 */}
          <Pressable
            onPress={handleGoogleSignIn}
            disabled={isSubmitting}
            style={({ pressed }) => [
              styles.googleButton,
              pressed && styles.actionPressed,
            ]}
          >
            <View style={styles.googleBtnContent}>
              <View style={styles.googleIconContainer}>
                <Image
                  source={{
                    uri: 'https://developers.google.com/identity/images/g-logo.png',
                  }}
                  style={styles.googleIcon}
                />
              </View>
              <Text style={styles.googleButtonText}>
                Google 계정으로 로그인
              </Text>
            </View>
          </Pressable>

          {/* 회원가입하기 링크 */}
          <Pressable
            onPress={handleNavigateToSignUp}
            style={({ pressed }) => [
              styles.signUpLinkContainer,
              pressed && styles.actionPressed,
            ]}
          >
            <Text style={styles.signUpLinkText}>회원가입하기</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFDFD',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 20 : 40,
    paddingBottom: 48,
    alignItems: 'stretch',
  },
  logoSection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
    marginBottom: 32,
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
    color: '#100C08',
    marginTop: 10,
    fontFamily: Fonts.googleSansFlexBold,
    // fontWeight: 'bold',
    letterSpacing: -0.5,
  },
  titleSection: {
    gap: 8,
    alignItems: 'flex-start',
    marginBottom: 32,
  },
  titleText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#100C08',
    fontFamily: Fonts.pretendard,
  },
  subtitleText: {
    fontSize: 15,
    color: '#100C08',
    opacity: 0.5,
    fontFamily: Fonts.pretendard,
  },
  formContainer: {
    gap: 12,
    marginBottom: 12,
  },
  inputSection: {
    gap: 4,
  },
  inputLabel: {
    fontSize: 15,
    color: '#100C08',
    fontFamily: Fonts.pretendard,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    backgroundColor: 'rgba(30, 106, 244, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(16, 12, 8, 0.1)',
    borderRadius: 16,
    paddingHorizontal: 16,
  },
  inputWrapperFocused: {
    borderColor: '#1E6AF4',
    backgroundColor: 'rgba(30, 106, 244, 0.05)',
  },
  inputWrapperError: {
    borderColor: '#EF4444',
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: '#100C08',
    fontFamily: Fonts.pretendard,
    height: '100%',
  },
  eyeButton: {
    padding: 4,
  },
  forgotPasswordBox: {
    alignSelf: 'flex-end',
    paddingVertical: 4,
  },
  forgotPasswordText: {
    fontSize: 13,
    color: '#1E6AF4',
    fontFamily: Fonts.pretendard,
  },
  actionPressed: {
    opacity: 0.7,
  },
  signInButton: {
    backgroundColor: '#1E6AF4',
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#1E6AF4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  signInButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  signInButtonDisabled: {
    backgroundColor: '#CBD5E1',
    shadowOpacity: 0,
    elevation: 0,
  },
  signInButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#FDFDFD',
    fontFamily: Fonts.pretendard,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 24,
    opacity: 0.5,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#100C08',
    opacity: 0.1,
  },
  dividerText: {
    fontSize: 15,
    color: '#100C08',
    marginHorizontal: 10,
    fontFamily: Fonts.pretendard,
  },
  googleButton: {
    height: 56,
    borderWidth: 1,
    borderColor: 'rgba(16, 12, 8, 0.1)',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  googleBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  googleIconContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  googleIcon: {
    width: 16,
    height: 16,
  },
  googleButtonText: {
    fontSize: 15,
    color: '#100C08',
    fontFamily: Fonts.pretendard,
  },
  signUpLinkContainer: {
    marginTop: 32,
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  signUpLinkText: {
    fontSize: 15,
    color: '#1E6AF4',
    fontFamily: Fonts.pretendard,
  },
});
