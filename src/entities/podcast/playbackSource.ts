import { podcastRepository } from './repository';
import { mmkvStore } from '@/src/services/storage/mmkv';
import type { AudioFormat, Podcast, TtsVoice } from './model';

/**
 * 플레이어가 호출하는 단일 진입점.
 * 오프라인 다운로드된 파일이 있으면 로컬 경로를, 없으면 서버 audioUrl을 반환한다.
 */
export async function resolvePlaybackSource(
  podcastId: string,
): Promise<string> {
  const offline = mmkvStore.getOfflineMap()[podcastId];
  if (offline) return `file://${offline.localPath}`;

  const podcast = await podcastRepository.getDetail(podcastId);
  if (!podcast.audioUrl) {
    throw new Error(`Audio not ready for podcastId=${podcastId}`);
  }
  return podcast.audioUrl;
}

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

function pickPlaybackUrl(podcast: Podcast): string {
  const offline = mmkvStore.getOfflineMap()[podcast.id];
  if (offline) return `file://${offline.localPath}`;
  if (podcast.status !== 'done' || !podcast.audioUrl) {
    throw new Error(`Audio not ready for podcastId=${podcast.id}`);
  }
  return podcast.audioUrl;
}

export async function resolvePlaybackTrack(
  podcastId: string,
): Promise<AudioTrack> {
  const podcast = await podcastRepository.getDetail(podcastId);
  const url = pickPlaybackUrl(podcast);

  return {
    id: podcast.id,
    url,
    title: podcast.title,
    artist: TTS_VOICE_ARTIST[podcast.ttsVoice],
    album: FORMAT_ALBUM[podcast.format],
    duration: podcast.duration * 60,
    description: buildDescription(podcast.script),
  };
}
