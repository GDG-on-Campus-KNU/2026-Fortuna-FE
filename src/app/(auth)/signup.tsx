import { Link } from 'expo-router';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/src/components/themed-text';
import { ThemedView } from '@/src/components/themed-view';
import { AuthForm } from '@/src/features/auth';

export default function SignupScreen() {
  return (
    <ThemedView style={styles.flex}>
      <SafeAreaView style={styles.flex}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.content}>
            <View style={styles.header}>
              <ThemedText type="title">계정 만들기</ThemedText>
              <ThemedText type="default">
                소셜 계정 또는 이메일로 시작하세요
              </ThemedText>
            </View>

            <AuthForm mode="signup" />

            <View style={styles.footer}>
              <ThemedText type="default">이미 계정이 있으신가요? </ThemedText>
              <Link href="/login">
                <ThemedText type="link">로그인</ThemedText>
              </Link>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 32,
  },
  header: { gap: 8, alignItems: 'center' },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
