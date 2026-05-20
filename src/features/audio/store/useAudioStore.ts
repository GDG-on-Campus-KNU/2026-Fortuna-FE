import {
  Audio,
  InterruptionModeAndroid,
  InterruptionModeIOS,
  PitchCorrectionQuality,
  type AVPlaybackStatus,
} from 'expo-av';
import { create } from 'zustand';

export type AudioPlaybackState =
  | 'idle'
  | 'loading'
  | 'ready'
  | 'playing'
  | 'paused'
  | 'ended'
  | 'error';

export type AudioTrack = {
  id: string;
  url: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  description: string;
};

export const PLAYBACK_RATES = [0.75, 1, 1.25, 1.5, 2] as const;

type AudioStore = {
  // States
  activeTrack?: AudioTrack;
  error?: string;
  interruption?: string;
  isBusy: boolean;
  isReady: boolean;
  playbackState: AudioPlaybackState;
  positionMillis: number;
  durationMillis: number;
  rate: number;

  // Actions
  init: (track: AudioTrack) => Promise<void>;
  unload: () => Promise<void>;
  togglePlayback: () => Promise<void>;
  stop: () => Promise<void>;
  seek: (positionSeconds: number) => Promise<void>;
  jump: (offsetSeconds: number) => Promise<void>;
  setRate: (rate: number) => Promise<void>;
  setBusy: (isBusy: boolean) => void;
};

let soundInstance: Audio.Sound | undefined;
let setupPromise: Promise<Audio.Sound> | undefined;

const handlePlaybackStatusUpdate = (status: AVPlaybackStatus, set: any) => {
  if (!status.isLoaded) {
    if (status.error) {
      set({ error: status.error, playbackState: 'error' });
    }
    return;
  }

  set({
    error: undefined,
    durationMillis: status.durationMillis ?? 0,
    playbackState: status.didJustFinish
      ? 'ended'
      : status.isPlaying
        ? 'playing'
        : status.isBuffering
          ? 'loading'
          : 'paused',
    positionMillis: status.positionMillis,
    rate: status.rate,
  });
};

export const useAudioStore = create<AudioStore>((set, get) => ({
  durationMillis: 0,
  isBusy: false,
  isReady: false,
  playbackState: 'idle',
  positionMillis: 0,
  rate: 1,

  setBusy: (isBusy) => set({ isBusy }),

  init: async (track) => {
    // If already playing the same track, just return
    if (soundInstance && get().activeTrack?.id === track.id) return;

    // If playing a different track, unload first
    if (soundInstance) {
      await get().unload();
    }

    if (setupPromise) {
      await setupPromise;
      return;
    }

    set({ isBusy: true, playbackState: 'loading' });

    setupPromise = (async () => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
          interruptionModeIOS: InterruptionModeIOS.DoNotMix,
          playThroughEarpieceAndroid: false,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: false,
          staysActiveInBackground: true,
        });

        const { sound, status } = await Audio.Sound.createAsync(
          { uri: track.url },
          {
            progressUpdateIntervalMillis: 500,
            rate: get().rate,
            shouldCorrectPitch: true,
            shouldPlay: false,
          },
          (status) => handlePlaybackStatusUpdate(status, set),
        );

        soundInstance = sound;
        set({ activeTrack: track, isReady: true });
        handlePlaybackStatusUpdate(status, set);

        return sound;
      } catch (error) {
        setupPromise = undefined;
        const errorMessage =
          error instanceof Error
            ? error.message
            : '플레이어 초기화에 실패했습니다.';
        set({ error: errorMessage, playbackState: 'error' });
        throw error;
      } finally {
        set({ isBusy: false });
        setupPromise = undefined;
      }
    })();

    await setupPromise;
  },

  unload: async () => {
    if (!soundInstance) return;

    const currentSound = soundInstance;
    soundInstance = undefined;
    setupPromise = undefined;
    currentSound.setOnPlaybackStatusUpdate(null);
    await currentSound.unloadAsync();

    set({ isReady: false, playbackState: 'idle', activeTrack: undefined });
  },

  togglePlayback: async () => {
    if (!soundInstance) return;

    const status = await soundInstance.getStatusAsync();
    if (status.isLoaded && status.isPlaying) {
      await soundInstance.pauseAsync();
    } else {
      await soundInstance.playAsync();
    }
  },

  stop: async () => {
    if (!soundInstance) return;
    await soundInstance.stopAsync();
    await soundInstance.setPositionAsync(0);
  },

  seek: async (positionSeconds) => {
    if (!soundInstance) return;
    const positionMillis = Math.max(positionSeconds, 0) * 1000;
    await soundInstance.setPositionAsync(positionMillis);
  },

  jump: async (offsetSeconds) => {
    if (!soundInstance) return;
    const status = await soundInstance.getStatusAsync();
    if (!status.isLoaded) return;

    const durationMillis = status.durationMillis ?? 0;
    const nextPositionMillis = Math.min(
      Math.max(status.positionMillis + offsetSeconds * 1000, 0),
      durationMillis,
    );
    await soundInstance.setPositionAsync(nextPositionMillis);
  },

  setRate: async (rate) => {
    if (soundInstance) {
      await soundInstance.setRateAsync(
        rate,
        true,
        PitchCorrectionQuality.Medium,
      );
    }
    set({ rate });
  },
}));
