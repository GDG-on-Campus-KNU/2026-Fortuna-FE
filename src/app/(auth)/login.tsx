import { Link } from 'expo-router';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/src/components/themed-text';
import { ThemedView } from '@/src/components/themed-view';
import { AuthForm } from '@/src/features/auth';

export default function LoginScreen() {
  return (
    <ThemedView style={styles.flex}>
      <SafeAreaView style={styles.flex}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.content}>
            <View style={styles.header}>
              <ThemedText type="title">StudyCast</ThemedText>
              <ThemedText type="default">
                이동 중 낭비되는 시간을 공부 시간으로
              </ThemedText>
            </View>

            <AuthForm mode="login" />

            <View style={styles.footer}>
              <ThemedText type="default">계정이 없으신가요? </ThemedText>
              <Link href="/signup">
                <ThemedText type="link">계정 만들기</ThemedText>
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
