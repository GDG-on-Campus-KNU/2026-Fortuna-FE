import { contentRepository } from './repository';
import { mmkvStore } from '@/src/services/storage/mmkv';
import type { AudioFormat, Content, TtsVoice } from './model';

/**
 * 정희균(플레이어)이 호출하는 단일 진입점.
 * 오프라인 다운로드된 파일이 있으면 로컬 경로를, 없으면 서버 audioUrl을 반환한다.
 * 오프라인/스트리밍 분기는 엔티티 안에서 캡슐화한다 — 플레이어는 모른다.
 */
export async function resolvePlaybackSource(
  contentId: string,
): Promise<string> {
  const offline = mmkvStore.getOfflineMap()[contentId];
  if (offline) return `file://${offline.localPath}`;

  const content = await contentRepository.getDetail(contentId);
  if (!content.audioUrl) {
    throw new Error(`Audio not ready for contentId=${contentId}`);
  }
  return content.audioUrl;
}

/**
 * 정희균(플레이어)의 useAudioStore.init(track) 에 그대로 넣을 수 있는
 * AudioTrack 객체를 만들어 준다.
 *
 * shape 는 player 브랜치의 useAudioStore 가 받는 AudioTrack 과 100% 동일하게
 * 유지한다. merge 시점에 player 쪽 로컬 타입 정의를 제거하고 이 타입을
 * import 하도록 정리할 예정.
 */
export type AudioTrack = {
  id: string;
  url: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  description: string;
};

const TTS_VOICE_ARTIST: Record<TtsVoice, string> = {
  friend: '친구 톤 · StudyCast',
  professor: '교수 톤 · StudyCast',
  coach: '코치 톤 · StudyCast',
  whisper: '속삭임 톤 · StudyCast',
};

const FORMAT_ALBUM: Record<AudioFormat, string> = {
  dialog: '대화식 팟캐스트',
  quiz: '퀴즈 팟캐스트',
  story: '스토리텔링 팟캐스트',
};

const DESCRIPTION_MAX_LEN = 200;

function buildDescription(script: string): string {
  if (script.length <= DESCRIPTION_MAX_LEN) return script;
  return `${script.slice(0, DESCRIPTION_MAX_LEN)}…`;
}

function pickPlaybackUrl(content: Content): string {
  const offline = mmkvStore.getOfflineMap()[content.id];
  if (offline) return `file://${offline.localPath}`;
  if (content.status !== 'done' || !content.audioUrl) {
    throw new Error(`Audio not ready for contentId=${content.id}`);
  }
  return content.audioUrl;
}

export async function resolvePlaybackTrack(
  contentId: string,
): Promise<AudioTrack> {
  const content = await contentRepository.getDetail(contentId);
  const url = pickPlaybackUrl(content);

  return {
    id: content.id,
    url,
    title: content.title,
    artist: TTS_VOICE_ARTIST[content.ttsVoice],
    album: FORMAT_ALBUM[content.format],
    duration: content.duration * 60,
    description: buildDescription(content.script),
  };
}
