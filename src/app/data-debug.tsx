// 데이터 모델 디버그 화면 (Expo Router 라우트: /data-debug).
//
// _layout.tsx 의 <Stack> 은 file-based routing 으로 이 파일을 자동 발견한다.
// 별도 등록 불필요. dev 메뉴나 `router.push('/data-debug')` 로 진입.
//
// 1주차 데이터 모델 검증 포인트:
//  1. mock-adapter 가 axios 요청을 가로채는지
//  2. stale-while-revalidate (캐시 즉시 → 갱신) 동작
//  3. snake_case → camelCase 인터셉터
//  4. MMKV 영속화 (앱 재시작 후에도 데이터 유지)
//  5. resolvePlaybackTrack 이 정희균 player AudioTrack shape 으로 반환되는지

import { useEffect } from 'react';
import {
  Alert,
  Button,
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  resolvePlaybackTrack,
  useContents,
  usePreferences,
  type Content,
} from '@/src/entities';
import { installMockAdapter } from '@/src/services/api';
import { mmkvStore } from '@/src/services/storage';

// 모듈 로드 시점에 1회만 설치. __DEV__ false 인 운영 빌드에서는 no-op.
installMockAdapter();

export default function DataDebugScreen() {
  const { data, loading, refresh } = useContents();
  const { prefs, set } = usePreferences();

  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log('[data-debug] contents count =', data.length, 'loading=', loading);
  }, [data.length, loading]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>StudyCast — Data Debug</Text>

      <View style={styles.row}>
        <Button title="Refresh" onPress={refresh} />
        <Button
          title="Clear MMKV"
          color="#c0392b"
          onPress={() => {
            mmkvStore.clear();
            refresh();
          }}
        />
        <Button
          title={`Speed ${prefs.playbackSpeed.toFixed(2)}x`}
          onPress={() =>
            set({
              playbackSpeed:
                prefs.playbackSpeed >= 2 ? 1 : prefs.playbackSpeed + 0.25,
            })
          }
        />
      </View>

      <Text style={styles.subtitle}>
        {loading ? 'Loading…' : `${data.length} contents`}
      </Text>

      <FlatList
        data={data}
        keyExtractor={(c) => c.id}
        renderItem={({ item }) => <ContentRow item={item} />}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

function ContentRow({ item }: { item: Content }) {
  const onTestTrack = async () => {
    try {
      const track = await resolvePlaybackTrack(item.id);
      Alert.alert('AudioTrack', JSON.stringify(track, null, 2));
    } catch (err) {
      Alert.alert(
        'resolvePlaybackTrack 실패',
        err instanceof Error ? err.message : String(err),
      );
    }
  };

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{item.title}</Text>
      <Text style={styles.cardMeta}>
        {item.duration}min · {item.format} · {item.ttsVoice} · {item.status}
      </Text>
      <View style={styles.cardActions}>
        <Button title="Test resolvePlaybackTrack" onPress={onTestTrack} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: '#fafafa',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1c1c1e',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13,
    color: '#666',
    marginVertical: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  list: {
    paddingBottom: 32,
  },
  card: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1c1c1e',
  },
  cardMeta: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  cardActions: {
    marginTop: 8,
    alignItems: 'flex-start',
  },
});
