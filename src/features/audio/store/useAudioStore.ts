import {
  createAudioPlayer,
  setAudioModeAsync,
  type AudioPlayer,
  type AudioStatus,
} from 'expo-audio';
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

let soundInstance: AudioPlayer | undefined;
let setupPromise: Promise<AudioPlayer> | undefined;
let statusListenerSubscription: { remove: () => void } | undefined;

const handlePlaybackStatusUpdate = (status: AudioStatus, set: any) => {
  if (!status.isLoaded) {
    return;
  }

  set({
    error: undefined,
    durationMillis: (status.duration ?? 0) * 1000,
    playbackState: status.didJustFinish
      ? 'ended'
      : status.playing
        ? 'playing'
        : status.isBuffering
          ? 'loading'
          : 'paused',
    positionMillis: (status.currentTime ?? 0) * 1000,
    rate: status.playbackRate,
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
        await setAudioModeAsync({
          allowsRecording: false,
          interruptionMode: 'doNotMix',
          playsInSilentMode: true,
          shouldPlayInBackground: true,
          shouldRouteThroughEarpiece: false,
        });

        const player = createAudioPlayer(track.url, {
          updateInterval: 500,
        });

        // Set playback configurations
        player.setPlaybackRate(get().rate, 'medium');

        statusListenerSubscription = player.addListener(
          'playbackStatusUpdate',
          (status) => {
            handlePlaybackStatusUpdate(status, set);
          },
        );

        soundInstance = player;
        set({ activeTrack: track, isReady: true });

        // Update the initial state
        set({
          error: undefined,
          durationMillis: (player.duration ?? 0) * 1000,
          playbackState: player.playing
            ? 'playing'
            : player.isBuffering
              ? 'loading'
              : 'paused',
          positionMillis: (player.currentTime ?? 0) * 1000,
          rate: player.playbackRate,
        });

        return player;
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

    if (statusListenerSubscription) {
      statusListenerSubscription.remove();
      statusListenerSubscription = undefined;
    }

    currentSound.remove();

    set({ isReady: false, playbackState: 'idle', activeTrack: undefined });
  },

  togglePlayback: async () => {
    if (!soundInstance) return;

    if (soundInstance.playing) {
      soundInstance.pause();
    } else {
      soundInstance.play();
    }
  },

  stop: async () => {
    if (!soundInstance) return;
    soundInstance.pause();
    await soundInstance.seekTo(0);
  },

  seek: async (positionSeconds) => {
    if (!soundInstance) return;
    await soundInstance.seekTo(positionSeconds);
  },

  jump: async (offsetSeconds) => {
    if (!soundInstance) return;

    const currentPosition = soundInstance.currentTime ?? 0;
    const duration = soundInstance.duration ?? 0;
    const nextPosition = Math.min(
      Math.max(currentPosition + offsetSeconds, 0),
      duration,
    );
    await soundInstance.seekTo(nextPosition);
  },

  setRate: async (rate) => {
    if (soundInstance) {
      soundInstance.setPlaybackRate(rate, 'medium');
    }
    set({ rate });
  },
}));
