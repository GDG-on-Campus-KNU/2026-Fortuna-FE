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
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

import { Fonts, Palette } from '@/src/shared/constants/theme';
import { useAuthForm } from '@/src/entities/auth';

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [focusedInput, setFocusedInput] = useState<'email' | 'password' | null>(
    null,
  );
  const [showPassword, setShowPassword] = useState(false);

  const { submit, submitting, error, clearError } = useAuthForm('login');

  const onChangeEmail = (val: string) => {
    if (error) clearError();
    setEmail(val);
  };

  const onChangePassword = (val: string) => {
    if (error) clearError();
    setPassword(val);
  };

  // 이메일 정규식 유효성 검사
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isFormValid = isEmailValid && password.trim().length >= 6;

  // 일반 이메일 로그인
  const handleSignIn = () => {
    if (!isFormValid || submitting) return;
    submit({ email, password });
  };

  // Google 소셜 로그인은 P1으로 보류(Firebase 제거 → 추후 FastAPI OAuth).
  // MVP에서는 버튼을 숨겨 깨진 동작이 노출되지 않게 한다.

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
        colors={[Palette.primaryLight, Palette.bgPage]}
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
              <Image
                source={require('../../assets/images/icon.png')}
                style={styles.logoImage}
              />
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
                  placeholderTextColor={Palette.textPlaceholder}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={email}
                  onChangeText={onChangeEmail}
                  onFocus={() => setFocusedInput('email')}
                  onBlur={() => setFocusedInput(null)}
                />
                {email.length > 0 && (
                  <Ionicons
                    name={isEmailValid ? 'checkmark-circle' : 'alert-circle'}
                    size={20}
                    color={isEmailValid ? Palette.success : Palette.error}
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
                    color={Palette.textOpMuted}
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

          {/* 에러 메시지 표시 */}
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {/* 로그인 버튼 */}
          <Pressable
            onPress={handleSignIn}
            disabled={!isFormValid || submitting}
            style={({ pressed }) => [
              styles.signInButton,
              !isFormValid && styles.signInButtonDisabled,
              pressed && isFormValid && styles.signInButtonPressed,
            ]}
          >
            {submitting ? (
              <ActivityIndicator size="small" color={Palette.bgCard} />
            ) : (
              <Text style={styles.signInButtonText}>로그인</Text>
            )}
          </Pressable>

          {/* Google 소셜 로그인 버튼은 P1 보류로 MVP에서 숨김 (위 주석 참고) */}

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
    backgroundColor: Palette.bgPage,
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
    backgroundColor: Palette.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoImage: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
  brandTitle: {
    fontSize: 40,
    color: Palette.textPrimary,
    marginTop: 10,
    fontFamily: Fonts.googleSansFlexBold,
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
    color: Palette.textPrimary,
    fontFamily: Fonts.pretendardBold,
  },
  subtitleText: {
    fontSize: 15,
    color: Palette.textPrimary,
    opacity: 0.5,
    fontFamily: Fonts.pretendardRegular,
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
    color: Palette.textPrimary,
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
    backgroundColor: Palette.primaryHover,
  },
  inputWrapperError: {
    borderColor: Palette.error,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: Palette.textPrimary,
    fontFamily: Fonts.pretendardRegular,
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
    color: Palette.primary,
    fontFamily: Fonts.pretendardRegular,
  },
  actionPressed: {
    opacity: 0.7,
  },
  signInButton: {
    backgroundColor: Palette.primary,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  signInButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  signInButtonDisabled: {
    backgroundColor: Palette.disabled,
    shadowOpacity: 0,
    elevation: 0,
  },
  signInButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: Palette.bgPage,
    fontFamily: Fonts.pretendardMedium,
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
    backgroundColor: Palette.textPrimary,
    opacity: 0.1,
  },
  dividerText: {
    fontSize: 15,
    color: Palette.textPrimary,
    marginHorizontal: 10,
    fontFamily: Fonts.pretendardRegular,
  },
  googleButton: {
    height: 56,
    borderWidth: 1,
    borderColor: Palette.borderDark,
    backgroundColor: Palette.bgCard,
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
    color: Palette.textPrimary,
    fontFamily: Fonts.pretendardRegular,
  },
  signUpLinkContainer: {
    marginTop: 32,
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  signUpLinkText: {
    fontSize: 15,
    color: Palette.primary,
    fontFamily: Fonts.pretendardRegular,
  },
  errorText: {
    fontSize: 13,
    color: Palette.error,
    marginTop: 8,
    fontWeight: '600',
    fontFamily: Fonts.pretendardSemiBold,
    textAlign: 'center',
  },
});
