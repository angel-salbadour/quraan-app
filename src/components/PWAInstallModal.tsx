import React from 'react';
import { CheckCircle2, Download, Share, Smartphone, X } from 'lucide-react';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  isInstallable: boolean;
  isInstalled: boolean;
  isIOS: boolean;
  onTriggerNativeInstall: () => Promise<boolean>;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({
  isOpen,
  onClose,
  isInstallable,
  isInstalled,
  isIOS,
  onTriggerNativeInstall,
}) => {
  if (!isOpen) return null;

  const handleInstallClick = async () => {
    const accepted = await onTriggerNativeInstall();
    if (accepted) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/55 backdrop-blur-xs p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pwa-install-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-t-3xl sm:rounded-3xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-6 pb-safe shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-[var(--border-hairline)] sm:hidden" />

        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--accent-btn-bg)] text-white">
              <Smartphone className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h2 id="pwa-install-title" className="text-lg font-bold text-[var(--text-primary)]">
                تثبيت المصحف المرتل
              </h2>
              <p className="text-xs text-[var(--text-muted)]">
                يعمل كتطبيق مستقل على أندرويد وآيفون
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق نافذة التثبيت"
            className="flex h-10 w-10 items-center justify-center rounded-xl text-[var(--text-muted)] hover:bg-[var(--bg-subtle)]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 space-y-4 text-sm text-[var(--text-secondary)]">
          {isInstalled ? (
            <div className="flex items-center gap-2.5 rounded-xl bg-[var(--accent-soft)] p-4 text-[var(--accent-primary)] font-semibold">
              <CheckCircle2 className="h-5 w-5 shrink-0" aria-hidden="true" />
              <span>التطبيق مثبت بالفعل على جهازك ويعمل بوضع ملء الشاشة.</span>
            </div>
          ) : (
            <>
              {isInstallable && (
                <button
                  type="button"
                  onClick={handleInstallClick}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--accent-btn-bg)] py-3 text-sm font-semibold text-white hover:bg-[var(--accent-btn-hover)] transition-colors min-h-[48px]"
                >
                  <Download className="h-4 w-4" aria-hidden="true" />
                  <span>تثبيت التطبيق الآن على جهازك</span>
                </button>
              )}

              {/* Android Instructions */}
              <div className="rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] p-4 space-y-1.5">
                <h3 className="text-sm font-bold text-[var(--text-primary)]">
                  لأجهزة أندرويد (Android — Chrome)
                </h3>
                <ol className="list-decimal list-inside space-y-1 text-xs leading-relaxed">
                  <li>افتح التطبيق في متصفح Google Chrome.</li>
                  <li>اضغط على قائمة المتصفح (⋮) في الأعلى ثم اختر «تثبيت التطبيق» أو «الإضافة إلى الشاشة الرئيسية».</li>
                </ol>
              </div>

              {/* iPhone / iPad Instructions */}
              <div className="rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] p-4 space-y-1.5">
                <h3 className="flex items-center gap-1.5 text-sm font-bold text-[var(--text-primary)]">
                  <span>لأجهزة آيفون وآيباد (iPhone — Safari)</span>
                  {isIOS && <Share className="h-3.5 w-3.5 text-[var(--accent-primary)]" aria-hidden="true" />}
                </h3>
                <ol className="list-decimal list-inside space-y-1 text-xs leading-relaxed">
                  <li>افتح الرابط في متصفح Safari.</li>
                  <li>اضغط على زر «المشاركة» أسفل الشاشة.</li>
                  <li>مرّر للأسفل ثم اختر «إضافة إلى الشاشة الرئيسية» (Add to Home Screen).</li>
                </ol>
              </div>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-5 w-full rounded-xl bg-[var(--bg-subtle)] py-2.5 text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--border-hairline)]/70 transition-colors min-h-[44px]"
        >
          حسناً
        </button>
      </div>
    </div>
  );
};
