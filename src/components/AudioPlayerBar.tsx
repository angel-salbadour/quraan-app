import React, { useMemo, useState } from 'react';
import {
  ChevronUp,
  Clock,
  Headphones,
  Loader2,
  Pause,
  Play,
  Repeat,
  Repeat1,
  SkipBack,
  SkipForward,
  X,
} from 'lucide-react';
import { SURAHS } from '../data/surahs';
import type { AudioPlayerController } from '../hooks/useAudioPlayer';
import { formatDuration, toArabicDigits } from '../utils/quranHelpers';

interface AudioPlayerBarProps {
  audio: AudioPlayerController;
  onOpenReciters: () => void;
}

const SPEED_OPTIONS = [0.75, 1, 1.25, 1.5];
const SLEEP_OPTIONS: Array<{ value: number | null; label: string }> = [
  { value: null, label: 'إيقاف' },
  { value: 15, label: '١٥ د' },
  { value: 30, label: '٣٠ د' },
  { value: 60, label: '٦٠ د' },
];
const AYAH_REPEAT_OPTIONS: Array<{ value: number; label: string }> = [
  { value: 1, label: '١×' },
  { value: 2, label: '٢×' },
  { value: 3, label: '٣×' },
  { value: 0, label: '∞' },
];

export const AudioPlayerBar: React.FC<AudioPlayerBarProps> = ({ audio, onOpenReciters }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const surahMeta = useMemo(
    () => SURAHS.find((s) => s.number === audio.surahNumber) ?? SURAHS[0],
    [audio.surahNumber]
  );

  // Render nothing until the user initiates playback (preserves 15% mobile sticky cap on initial screen)
  if (!audio.hasStarted) {
    return null;
  }

  const activeReciterName =
    audio.mode === 'ayah' ? audio.selectedAyahReciter.name : audio.selectedReciter.name;
  const activeSubtitle =
    audio.mode === 'ayah' && audio.activeAyahNumber !== null
      ? `${activeReciterName} · الآية ${toArabicDigits(audio.activeAyahNumber)}`
      : `${activeReciterName} · ${audio.selectedMoshaf.name}`;

  return (
    <>
      {/* Compact Docked Player Bar */}
      <div
        role="region"
        aria-label="مشغل التلاوة الصوتية"
        className="fixed bottom-[60px] md:bottom-0 inset-x-0 z-30 border-t border-[var(--border-hairline)] bg-[var(--bg-surface)]/95 backdrop-blur-md shadow-sm"
      >
        {/* Error Notice */}
        {audio.error && (
          <div className="flex items-center justify-between gap-2 bg-rose-600 px-4 py-1.5 text-xs text-white">
            <span>{audio.error}</span>
            <button
              type="button"
              onClick={audio.clearError}
              aria-label="إغلاق التنبيه"
              className="p-1 hover:opacity-80"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-3 px-3 py-2 md:px-6 md:py-2.5">
          {/* Track Info */}
          <button
            type="button"
            onClick={() => setIsExpanded(true)}
            className="flex min-w-0 flex-1 items-center gap-3 text-right focus-visible:outline-2 focus-visible:outline-[var(--accent-primary)] rounded-lg"
            aria-label="فتح لوحة المشغل الكاملة"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent-primary)]">
              <ChevronUp className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-quran text-base md:text-lg font-bold text-[var(--text-primary)] truncate leading-tight">
                {surahMeta.name}
              </p>
              <p className="text-xs text-[var(--text-muted)] truncate">{activeSubtitle}</p>
            </div>
          </button>

          {/* Center Transport Controls */}
          <div className="flex items-center gap-1 md:gap-2 shrink-0">
            <button
              type="button"
              onClick={audio.prevTrack}
              aria-label={audio.mode === 'ayah' ? 'الآية السابقة' : 'السورة السابقة'}
              className="hidden sm:flex h-10 w-10 items-center justify-center rounded-xl text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"
            >
              <SkipForward className="h-4 w-4" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={audio.togglePlayPause}
              aria-label={audio.isPlaying ? 'إيقاف مؤقت' : 'تشغيل'}
              className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--accent-btn-bg)] text-white hover:bg-[var(--accent-btn-hover)] transition-colors"
            >
              {audio.isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
              ) : audio.isPlaying ? (
                <Pause className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Play className="h-5 w-5" aria-hidden="true" />
              )}
            </button>

            <button
              type="button"
              onClick={audio.nextTrack}
              aria-label={audio.mode === 'ayah' ? 'الآية التالية' : 'السورة التالية'}
              className="hidden sm:flex h-10 w-10 items-center justify-center rounded-xl text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"
            >
              <SkipBack className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          {/* Desktop Scrubber & Extras */}
          <div className="hidden lg:flex flex-1 items-center gap-3 max-w-md" dir="ltr">
            <span className="text-xs text-[var(--text-muted)] tabular-nums w-11 text-right">
              {formatDuration(audio.currentTime)}
            </span>
            <input
              type="range"
              min={0}
              max={audio.duration || 100}
              value={Math.min(audio.currentTime, audio.duration || 100)}
              onChange={(e) => audio.seekTo(Number(e.target.value))}
              aria-label="شريط تقدم التلاوة"
              className="quran-range flex-1"
            />
            <span className="text-xs text-[var(--text-muted)] tabular-nums w-11">
              {formatDuration(audio.duration)}
            </span>
          </div>

          {/* Right Quick Actions */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={audio.cycleRepeatMode}
              aria-label="تغيير وضع التكرار"
              className={`hidden md:flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${
                audio.repeatMode !== 'off'
                  ? 'bg-[var(--accent-soft)] text-[var(--accent-primary)]'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]'
              }`}
            >
              {audio.repeatMode === 'one' ? (
                <Repeat1 className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Repeat className="h-4 w-4" aria-hidden="true" />
              )}
            </button>

            <button
              type="button"
              onClick={audio.stopAndClose}
              aria-label="إغلاق المشغل"
              className="flex h-10 w-10 items-center justify-center rounded-xl text-[var(--text-muted)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {/* Expanded Bottom Sheet / Full Player Modal */}
      {isExpanded && (
        <div
          className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/55 backdrop-blur-xs p-0 md:p-4"
          role="dialog"
          aria-modal="true"
          aria-label="مشغل القرآن الكريم"
          onClick={() => setIsExpanded(false)}
        >
          <div
            className="w-full max-w-lg rounded-t-3xl md:rounded-3xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-5 md:p-7 pb-safe shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile Drag Handle */}
            <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-[var(--border-hairline)] md:hidden" />

            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[var(--text-muted)]">
                {audio.mode === 'ayah' ? 'تلاوة متزامنة آية بآية' : 'تلاوة السورة كاملة'}
              </span>
              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                aria-label="تصغير المشغل"
                className="flex h-10 w-10 items-center justify-center rounded-xl text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Surah Display */}
            <div className="my-5 text-center">
              <h2 className="font-quran text-3xl font-bold text-[var(--text-primary)]">
                {surahMeta.name}
              </h2>
              <p className="mt-1.5 text-sm text-[var(--text-secondary)]">{activeSubtitle}</p>
              <button
                type="button"
                onClick={() => {
                  setIsExpanded(false);
                  onOpenReciters();
                }}
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--accent-primary)] hover:underline min-h-[36px] px-2"
              >
                <Headphones className="h-3.5 w-3.5" aria-hidden="true" />
                <span>تغيير القارئ</span>
              </button>
            </div>

            {/* Seek Scrubber */}
            <div className="mb-6" dir="ltr">
              <input
                type="range"
                min={0}
                max={audio.duration || 100}
                value={Math.min(audio.currentTime, audio.duration || 100)}
                onChange={(e) => audio.seekTo(Number(e.target.value))}
                aria-label="تقديم أو تأخير التلاوة"
                className="quran-range w-full"
              />
              <div className="mt-1.5 flex justify-between text-xs text-[var(--text-muted)] tabular-nums">
                <span>{formatDuration(audio.currentTime)}</span>
                <span>{formatDuration(audio.duration)}</span>
              </div>
            </div>

            {/* Primary Controls */}
            <div className="mb-6 flex items-center justify-center gap-5">
              <button
                type="button"
                onClick={audio.prevTrack}
                aria-label={audio.mode === 'ayah' ? 'الآية السابقة' : 'السورة السابقة'}
                className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--border-hairline)] text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]"
              >
                <SkipForward className="h-5 w-5" aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={audio.togglePlayPause}
                aria-label={audio.isPlaying ? 'إيقاف مؤقت' : 'تشغيل'}
                className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--accent-btn-bg)] text-white hover:bg-[var(--accent-btn-hover)] shadow-sm"
              >
                {audio.isLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin" aria-hidden="true" />
                ) : audio.isPlaying ? (
                  <Pause className="h-6 w-6" aria-hidden="true" />
                ) : (
                  <Play className="h-6 w-6" aria-hidden="true" />
                )}
              </button>

              <button
                type="button"
                onClick={audio.nextTrack}
                aria-label={audio.mode === 'ayah' ? 'الآية التالية' : 'السورة التالية'}
                className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--border-hairline)] text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]"
              >
                <SkipBack className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            {/* Playback Speed, Hifz Repeat & Sleep Timer */}
            <div className="space-y-4 border-t border-[var(--border-hairline)] pt-4">
              {/* Speed */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-[var(--text-secondary)]">سرعة التلاوة</span>
                <div className="flex items-center gap-1">
                  {SPEED_OPTIONS.map((rate) => (
                    <button
                      key={rate}
                      type="button"
                      onClick={() => audio.setPlaybackRate(rate)}
                      className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold tabular-nums min-h-[34px] ${
                        audio.playbackRate === rate
                          ? 'bg-[var(--accent-btn-bg)] text-white'
                          : 'bg-[var(--bg-subtle)] text-[var(--text-secondary)]'
                      }`}
                    >
                      {rate}×
                    </button>
                  ))}
                </div>
              </div>

              {/* Ayah Repeat (visible in Ayah mode) */}
              {audio.mode === 'ayah' && (
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-[var(--text-secondary)]">
                    تكرار الآية (للحفظ)
                  </span>
                  <div className="flex items-center gap-1">
                    {AYAH_REPEAT_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => audio.setAyahRepeatTarget(opt.value)}
                        className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold min-h-[34px] ${
                          audio.ayahRepeatTarget === opt.value
                            ? 'bg-[var(--accent-btn-bg)] text-white'
                            : 'bg-[var(--bg-subtle)] text-[var(--text-secondary)]'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Sleep Timer */}
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--text-secondary)]">
                  <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>
                    مؤقت النوم
                    {audio.sleepRemainingSec !== null
                      ? ` (${formatDuration(audio.sleepRemainingSec)})`
                      : ''}
                  </span>
                </span>
                <div className="flex items-center gap-1">
                  {SLEEP_OPTIONS.map((opt) => (
                    <button
                      key={String(opt.value)}
                      type="button"
                      onClick={() => audio.setSleepTimer(opt.value)}
                      className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold min-h-[34px] ${
                        audio.sleepTimerMinutes === opt.value
                          ? 'bg-[var(--accent-btn-bg)] text-white'
                          : 'bg-[var(--bg-subtle)] text-[var(--text-secondary)]'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
