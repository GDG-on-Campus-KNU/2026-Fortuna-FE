import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { ThemedText } from '@/src/components/themed-text';
import { useThemeColor } from '@/src/shared/hooks/use-theme-color';
import { Colors } from '@/src/shared/constants/theme';
import { useColorScheme } from '@/src/shared/hooks/use-color-scheme';
import { useAuthForm } from '@/src/entities/auth';

interface AuthFormProps {
  mode: 'login' | 'signup';
}

const SUBMIT_LABEL: Record<AuthFormProps['mode'], string> = {
  login: '로그인',
  signup: '가입하기',
};

// 로그인/회원가입 공용 입력 폼. 상태/제출/에러는 useAuthForm에 위임하고
// 여기서는 표현만 담당한다. 성공 시 전역 인증 상태가 바뀌며 가드가 화면을 전환한다.
export function AuthForm({ mode }: AuthFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { submit, submitting, error, clearError } = useAuthForm(mode);

  const scheme = useColorScheme() ?? 'light';
  const tint = Colors[scheme].tint;
  const textColor = useThemeColor({}, 'text');
  const borderColor = scheme === 'dark' ? '#3A3F42' : '#D9DDE0';
  const placeholderColor = Colors[scheme].icon;

  const onChange = (setter: (v: string) => void) => (v: string) => {
    if (error) clearError();
    setter(v);
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={[styles.input, { color: textColor, borderColor }]}
        value={email}
        onChangeText={onChange(setEmail)}
        placeholder="이메일"
        placeholderTextColor={placeholderColor}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="email"
        editable={!submitting}
      />
      <TextInput
        style={[styles.input, { color: textColor, borderColor }]}
        value={password}
        onChangeText={onChange(setPassword)}
        placeholder="비밀번호 (8자 이상)"
        placeholderTextColor={placeholderColor}
        secureTextEntry
        autoCapitalize="none"
        autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
        editable={!submitting}
      />

      {error ? (
        <ThemedText
          style={styles.error}
          lightColor="#D7263D"
          darkColor="#FF6B7A"
        >
          {error}
        </ThemedText>
      ) : null}

      <Pressable
        style={[
          styles.submit,
          { backgroundColor: tint },
          submitting && styles.submitDisabled,
        ]}
        disabled={submitting}
        onPress={() => submit({ email, password })}
      >
        {submitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <ThemedText
            style={styles.submitLabel}
            lightColor="#fff"
            darkColor="#fff"
          >
            {SUBMIT_LABEL[mode]}
          </ThemedText>
        )}
      </Pressable>

      {/* Google 소셜 로그인은 BE 미구현(P1, Firebase 예정)이라 비활성 스텁으로 둔다. */}
      <Pressable style={[styles.google, { borderColor }]} disabled>
        <ThemedText
          style={styles.googleLabel}
          lightColor={placeholderColor}
          darkColor={placeholderColor}
        >
          Google로 계속하기 (준비 중)
        </ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 12, width: '100%' },
  input: {
    height: 52,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  error: { fontSize: 14, marginTop: -2 },
  submit: {
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  submitDisabled: { opacity: 0.6 },
  submitLabel: { fontSize: 16, fontWeight: '600' },
  google: {
    height: 52,
    borderWidth: 1,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleLabel: { fontSize: 15 },
});
