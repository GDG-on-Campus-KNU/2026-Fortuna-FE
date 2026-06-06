import { Stack } from 'expo-router';

// 인증 라우트 그룹. (tabs)와 분리된 별도 스택이라 탭 구조와 충돌하지 않는다.
// 실제 진입(가드 리다이렉트)은 PR #12 머지 후 루트 _layout.tsx 연결 시 활성화된다.
export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="signIn" />
      <Stack.Screen name="signUp" />
    </Stack>
  );
}
