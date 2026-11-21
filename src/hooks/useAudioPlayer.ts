import { useCallback, useEffect, useRef, useState } from 'react';
import { AYAH_RECITERS, FEATURED_RECITERS } from '../data/reciters';
import { SURAHS } from '../data/surahs';
import type { AyahReciter, PlaybackMode, Reciter, ReciterMoshaf, RepeatMode } from '../types/quran';
import { buildAyahAudioUrl, buildSurahAudioUrl, getGlobalAyahNumber } from '../utils/quranHelpers';

export interface AudioPlayerController {
  isPlaying: boolean;
  isLoading: boolean;
  hasStarted: boolean;
  error: string | null;
  mode: PlaybackMode;
  surahNumber: number;
  activeAyahNumber: number | null;
  currentTime: number;
  duration: number;
  playbackRate: number;
  repeatMode: RepeatMode;
  ayahRepeatTarget: number; // 1, 2, 3, or 0 for infinite
  sleepTimerMinutes: number | null;
  sleepRemainingSec: number | null;
  selectedReciter: Reciter;
  selectedMoshaf: ReciterMoshaf;
  selectedAyahReciter: AyahReciter;
  playSurah: (surahNum: number, reciter?: Reciter, moshaf?: ReciterMoshaf) => void;
  playAyah: (surahNum: number, ayahNum: number, ayahReciter?: AyahReciter) => void;
  togglePlayPause: () => void;
  stopAndClose: () => void;
  seekTo: (seconds: number) => void;
  nextTrack: () => void;
  prevTrack: () => void;
  setPlaybackRate: (rate: number) => void;
  cycleRepeatMode: () => void;
  setAyahRepeatTarget: (count: number) => void;
  setSleepTimer: (minutes: number | null) => void;
  selectReciter: (reciter: Reciter, moshaf?: ReciterMoshaf) => void;
  selectAyahReciter: (ayahReciter: AyahReciter) => void;
  clearError: () => void;
}

const DEFAULT_RECITER = FEATURED_RECITERS[0];
const DEFAULT_MOSHAF = DEFAULT_RECITER.moshafs[0];
const DEFAULT_AYAH_RECITER = AYAH_RECITERS[0];

export function useAudioPlayer(onSurahChange?: (surahNum: number) => void): AudioPlayerController {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<PlaybackMode>('surah');
  const [surahNumber, setSurahNumber] = useState<number>(1);
  const [activeAyahNumber, setActiveAyahNumber] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRateState] = useState(1);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('off');
  const [ayahRepeatTarget, setAyahRepeatTarget] = useState<number>(1);
  const [sleepTimerMinutes, setSleepTimerMinutes] = useState<number | null>(null);
  const [sleepRemainingSec, setSleepRemainingSec] = useState<number | null>(null);

  const [selectedReciter, setSelectedReciter] = useState<Reciter>(DEFAULT_RECITER);
  const [selectedMoshaf, setSelectedMoshaf] = useState<ReciterMoshaf>(DEFAULT_MOSHAF);
  const [selectedAyahReciter, setSelectedAyahReciter] = useState<AyahReciter>(DEFAULT_AYAH_RECITER);

  // Refs for fresh state inside native Audio event listeners
  const stateRef = useRef({
    mode,
    surahNumber,
    activeAyahNumber,
    repeatMode,
    ayahRepeatTarget,
    ayahRepeatCount: 0,
    playbackRate,
    selectedReciter,
    selectedMoshaf,
    selectedAyahReciter,
    onSurahChange,
  });

  stateRef.current = {
    ...stateRef.current,
    mode,
    surahNumber,
    activeAyahNumber,
    repeatMode,
    ayahRepeatTarget,
    playbackRate,
    selectedReciter,
    selectedMoshaf,
    selectedAyahReciter,
    onSurahChange,
  };

  const getAudio = useCallback(() => {
    if (!audioRef.current) {
      const el = new Audio();
      el.preload = 'metadata';
      audioRef.current = el;
    }
    return audioRef.current;
  }, []);

  const updateMediaSession = useCallback(
    (sNum: number, reciterName: string, ayahNum: number | null) => {
      if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;
      const surahMeta = SURAHS.find((s) => s.number === sNum);
      const title = ayahNum
        ? `${surahMeta?.name ?? `سورة ${sNum}`} — الآية ${ayahNum}`
        : surahMeta?.name ?? `سورة ${sNum}`;

      try {
        navigator.mediaSession.metadata = new MediaMetadata({
          title,
          artist: reciterName,
          album: 'المصحف المرتل',
          artwork: [
            { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
            { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          ],
        });
      } catch {
        // MediaMetadata unsupported on older browsers
      }
    },
    []
  );

  const loadAndPlayUrl = useCallback(
    (url: string, rate: number) => {
      const audio = getAudio();
      setError(null);
      setIsLoading(true);
      setHasStarted(true);
      audio.src = url;
      audio.playbackRate = rate;
      audio.load();
      audio
        .play()
        .then(() => {
          setIsPlaying(true);
          setIsLoading(false);
        })
        .catch((err: unknown) => {
          setIsLoading(false);
          setIsPlaying(false);
          if (err instanceof DOMException && err.name === 'AbortError') {
            return;
          }
          setError('تعذر تشغيل التلاوة حاليًا. جرّب قارئًا آخر أو تحقق من الاتصال.');
        });
    },
    [getAudio]
  );

  const playSurah = useCallback(
    (surahNum: number, reciter?: Reciter, moshaf?: ReciterMoshaf) => {
      const targetReciter = reciter ?? stateRef.current.selectedReciter;
      const targetMoshaf = moshaf ?? (reciter ? reciter.moshafs[0] : stateRef.current.selectedMoshaf);

      if (reciter) setSelectedReciter(targetReciter);
      if (targetMoshaf) setSelectedMoshaf(targetMoshaf);

      setMode('surah');
      setSurahNumber(surahNum);
      setActiveAyahNumber(null);
      stateRef.current.ayahRepeatCount = 0;

      const url = buildSurahAudioUrl(targetMoshaf.server, surahNum);
      updateMediaSession(surahNum, targetReciter.name, null);
      loadAndPlayUrl(url, stateRef.current.playbackRate);
    },
    [loadAndPlayUrl, updateMediaSession]
  );

  const playAyah = useCallback(
    (surahNum: number, ayahNum: number, ayahReciter?: AyahReciter) => {
      const targetAyahReciter = ayahReciter ?? stateRef.current.selectedAyahReciter;
      if (ayahReciter) setSelectedAyahReciter(targetAyahReciter);

      setMode('ayah');
      setSurahNumber(surahNum);
      setActiveAyahNumber(ayahNum);
      stateRef.current.ayahRepeatCount = 0;

      const globalNum = getGlobalAyahNumber(surahNum, ayahNum);
      const url = buildAyahAudioUrl(targetAyahReciter.id, globalNum, targetAyahReciter.bitrate);
      updateMediaSession(surahNum, targetAyahReciter.name, ayahNum);
      loadAndPlayUrl(url, stateRef.current.playbackRate);
    },
    [loadAndPlayUrl, updateMediaSession]
  );

  const togglePlayPause = useCallback(() => {
    const audio = getAudio();
    if (!audio.src) {
      playSurah(stateRef.current.surahNumber);
      return;
    }
    if (audio.paused) {
      setError(null);
      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setError('اضغط مجددًا لتشغيل التلاوة.'));
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  }, [getAudio, playSurah]);

  const stopAndClose = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    setIsPlaying(false);
    setIsLoading(false);
    setHasStarted(false);
    setActiveAyahNumber(null);
    setError(null);
  }, []);

  const seekTo = useCallback(
    (seconds: number) => {
      const audio = getAudio();
      if (Number.isFinite(seconds) && audio.duration) {
        audio.currentTime = Math.max(0, Math.min(seconds, audio.duration));
        setCurrentTime(audio.currentTime);
      }
    },
    [getAudio]
  );

  const nextTrack = useCallback(() => {
    const s = stateRef.current;
    if (s.mode === 'ayah' && s.activeAyahNumber !== null) {
      const surahMeta = SURAHS.find((item) => item.number === s.surahNumber);
      if (surahMeta && s.activeAyahNumber < surahMeta.ayahCount) {
        playAyah(s.surahNumber, s.activeAyahNumber + 1);
        return;
      }
      if (s.surahNumber < 114) {
        s.onSurahChange?.(s.surahNumber + 1);
        playAyah(s.surahNumber + 1, 1);
      }
      return;
    }
    const nextSurah = s.surahNumber < 114 ? s.surahNumber + 1 : 1;
    s.onSurahChange?.(nextSurah);
    playSurah(nextSurah);
  }, [playAyah, playSurah]);

  const prevTrack = useCallback(() => {
    const s = stateRef.current;
    if (s.mode === 'ayah' && s.activeAyahNumber !== null) {
      if (s.activeAyahNumber > 1) {
        playAyah(s.surahNumber, s.activeAyahNumber - 1);
        return;
      }
      if (s.surahNumber > 1) {
        const prevMeta = SURAHS.find((item) => item.number === s.surahNumber - 1);
        s.onSurahChange?.(s.surahNumber - 1);
        playAyah(s.surahNumber - 1, prevMeta?.ayahCount ?? 1);
      }
      return;
    }
    const prevSurah = s.surahNumber > 1 ? s.surahNumber - 1 : 114;
    s.onSurahChange?.(prevSurah);
    playSurah(prevSurah);
  }, [playAyah, playSurah]);

  const setPlaybackRate = useCallback(
    (rate: number) => {
      setPlaybackRateState(rate);
      if (audioRef.current) {
        audioRef.current.playbackRate = rate;
      }
    },
    []
  );

  const cycleRepeatMode = useCallback(() => {
    setRepeatMode((prev) => (prev === 'off' ? 'one' : prev === 'one' ? 'all' : 'off'));
  }, []);

  const setSleepTimer = useCallback((minutes: number | null) => {
    setSleepTimerMinutes(minutes);
    setSleepRemainingSec(minutes ? minutes * 60 : null);
  }, []);

  const selectReciter = useCallback(
    (reciter: Reciter, moshaf?: ReciterMoshaf) => {
      const targetMoshaf = moshaf ?? reciter.moshafs[0];
      setSelectedReciter(reciter);
      setSelectedMoshaf(targetMoshaf);
      if (stateRef.current.mode === 'surah' && isPlaying) {
        playSurah(stateRef.current.surahNumber, reciter, targetMoshaf);
      }
    },
    [isPlaying, playSurah]
  );

  const selectAyahReciter = useCallback(
    (ayahReciter: AyahReciter) => {
      setSelectedAyahReciter(ayahReciter);
      if (stateRef.current.mode === 'ayah' && stateRef.current.activeAyahNumber !== null && isPlaying) {
        playAyah(stateRef.current.surahNumber, stateRef.current.activeAyahNumber, ayahReciter);
      }
    },
    [isPlaying, playAyah]
  );

  // Bind HTML5 Audio events once
  useEffect(() => {
    const audio = getAudio();

    const onTimeUpdate = () => setCurrentTime(audio.currentTime || 0);
    const onLoadedMetadata = () => setDuration(audio.duration || 0);
    const onWaiting = () => setIsLoading(true);
    const onCanPlay = () => setIsLoading(false);
    const onPause = () => setIsPlaying(false);
    const onPlay = () => setIsPlaying(true);

    const onError = () => {
      setIsLoading(false);
      setIsPlaying(false);
      if (audio.src) {
        setError('تعذر تحميل ملف الصوت لهذه السورة لدى هذا القارئ. يمكنك اختيار قارئ آخر.');
      }
    };

    const onEnded = () => {
      const s = stateRef.current;
      if (s.mode === 'ayah' && s.activeAyahNumber !== null) {
        // Ayah repeat logic (0 = infinite repeat)
        if (s.ayahRepeatTarget === 0) {
          audio.currentTime = 0;
          audio.play().catch(() => {});
          return;
        }
        if (s.ayahRepeatCount + 1 < s.ayahRepeatTarget) {
          s.ayahRepeatCount += 1;
          audio.currentTime = 0;
          audio.play().catch(() => {});
          return;
        }
        s.ayahRepeatCount = 0;
        const meta = SURAHS.find((item) => item.number === s.surahNumber);
        if (meta && s.activeAyahNumber < meta.ayahCount) {
          playAyah(s.surahNumber, s.activeAyahNumber + 1);
          return;
        }
        if (s.repeatMode === 'one') {
          playAyah(s.surahNumber, 1);
          return;
        }
        if (s.repeatMode === 'all' && s.surahNumber < 114) {
          s.onSurahChange?.(s.surahNumber + 1);
          playAyah(s.surahNumber + 1, 1);
          return;
        }
        setIsPlaying(false);
        return;
      }

      // Surah playback ended
      if (s.repeatMode === 'one') {
        audio.currentTime = 0;
        audio.play().catch(() => {});
      } else if (s.repeatMode === 'all') {
        const nextNum = s.surahNumber < 114 ? s.surahNumber + 1 : 1;
        s.onSurahChange?.(nextNum);
        playSurah(nextNum);
      } else {
        setIsPlaying(false);
      }
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('waiting', onWaiting);
    audio.addEventListener('canplay', onCanPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('error', onError);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('waiting', onWaiting);
      audio.removeEventListener('canplay', onCanPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('error', onError);
      audio.removeEventListener('ended', onEnded);
    };
  }, [getAudio, playAyah, playSurah]);

  // Register MediaSession handlers for iOS Lock Screen & Android Notification controls
  useEffect(() => {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;
    try {
      navigator.mediaSession.setActionHandler('play', () => togglePlayPause());
      navigator.mediaSession.setActionHandler('pause', () => togglePlayPause());
      navigator.mediaSession.setActionHandler('nexttrack', () => nextTrack());
      navigator.mediaSession.setActionHandler('previoustrack', () => prevTrack());
    } catch {
      // Ignore unsupported handlers
    }
  }, [nextTrack, prevTrack, togglePlayPause]);

  // Sleep timer countdown
  useEffect(() => {
    if (sleepRemainingSec === null) return;
    if (sleepRemainingSec <= 0) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsPlaying(false);
      setSleepTimerMinutes(null);
      setSleepRemainingSec(null);
      return;
    }
    const timer = window.setInterval(() => {
      setSleepRemainingSec((prev) => (prev !== null ? Math.max(0, prev - 1) : null));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [sleepRemainingSec]);

  return {
    isPlaying,
    isLoading,
    hasStarted,
    error,
    mode,
    surahNumber,
    activeAyahNumber,
    currentTime,
    duration,
    playbackRate,
    repeatMode,
    ayahRepeatTarget,
    sleepTimerMinutes,
    sleepRemainingSec,
    selectedReciter,
    selectedMoshaf,
    selectedAyahReciter,
    playSurah,
    playAyah,
    togglePlayPause,
    stopAndClose,
    seekTo,
    nextTrack,
    prevTrack,
    setPlaybackRate,
    cycleRepeatMode,
    setAyahRepeatTarget,
    setSleepTimer,
    selectReciter,
    selectAyahReciter,
    clearError: () => setError(null),
  };
}
