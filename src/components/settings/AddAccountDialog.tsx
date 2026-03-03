import { useEffect, useState } from "react";
import { useLanguage } from "../../lib/useLanguage";

type AddAccountDialogProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: { username: string; password: string }) => Promise<any>;
};

export default function AddAccountDialog({
  open,
  onClose,
  onSubmit,
}: AddAccountDialogProps) {
  const { t } = useLanguage();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [inlineError, setInlineError] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (open) {
      setShouldRender(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setIsVisible(true));
      });
      return undefined;
    }

    setIsVisible(false);
    const timer = setTimeout(() => {
      setShouldRender(false);
      setUsername("");
      setPassword("");
      setSubmitting(false);
      setInlineError("");
    }, 220);

    return () => clearTimeout(timer);
  }, [open]);

  if (!shouldRender) return null;

  const handleSubmit = async () => {
    if (!username.trim()) {
      setInlineError(t("settings.accountUsernameRequired"));
      return;
    }
    if (!password.trim()) {
      setInlineError(t("settings.accountPasswordRequired"));
      return;
    }

    setInlineError("");
    setSubmitting(true);
    const result = await onSubmit({
      username: username.trim(),
      password,
    });
    if (!result?.success) {
      setInlineError(result?.error || t("settings.accountUnableToAdd"));
    }
    setSubmitting(false);
  };

  return (
    <div
      className={`fixed inset-0 z-2147483647 flex items-center justify-center p-4 transition-all duration-200 ${
        isVisible
          ? "bg-black/40 backdrop-blur-sm opacity-100"
          : "bg-black/0 backdrop-blur-none opacity-0"
      }`}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className={`w-full max-w-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 transform transition-all duration-200 ${
          isVisible
            ? "scale-100 translate-y-0 opacity-100"
            : "scale-95 translate-y-3 opacity-0"
        }`}
      >
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
          {t("settings.addAccount")}
        </h3>

        <div className="space-y-3">
          <input
            type="text"
            placeholder={t("auth.username")}
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            className="w-full h-10 px-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
          <input
            type="password"
            placeholder={t("auth.password")}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full h-10 px-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
          {inlineError && (
            <p className="text-xs text-red-600 dark:text-red-400">
              {inlineError}
            </p>
          )}
        </div>

        <div className="flex gap-2 justify-end mt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-2 rounded-lg text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200"
          >
            {t("common.cancel")}
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="px-3 py-2 rounded-lg text-sm bg-primary text-white disabled:opacity-60"
          >
            {submitting ? t("settings.addingAccount") : t("settings.add")}
          </button>
        </div>
      </div>
    </div>
  );
}
