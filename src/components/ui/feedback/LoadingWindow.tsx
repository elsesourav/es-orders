import type { CSSProperties } from "react";
import { useEffect, useId, useState } from "react";

type LoadingWindowProps = {
  open: boolean;
  title?: string;
  message?: string;
  scale?: number;
};

const LOADING_WINDOW_TRANSITION_MS = 240;

export default function LoadingWindow({
  open,
  title = "Loading Orders",
  message = "Please wait while we process the latest data...",
  scale = 1,
}: LoadingWindowProps) {
  const clipId = useId().replace(/:/g, "");

  const [isMounted, setIsMounted] = useState(open);
  const [isVisible, setIsVisible] = useState(open);

  useEffect(() => {
    if (open) {
      setIsMounted(true);

      const frameId = window.requestAnimationFrame(() => {
        setIsVisible(true);
      });

      return () => {
        window.cancelAnimationFrame(frameId);
      };
    }

    setIsVisible(false);
    const timeoutId = window.setTimeout(() => {
      setIsMounted(false);
    }, LOADING_WINDOW_TRANSITION_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [open]);

  if (!isMounted) {
    return null;
  }

  return (
    <>
      <div
        className={`fixed left-1/2 bottom-4 z-2147483649 w-fit pointer-events-none ${
          isVisible
            ? "-translate-x-1/2 translate-y-0 scale-100 opacity-100"
            : "-translate-x-1/2 translate-y-5 scale-[0.98] opacity-0"
        }`}
        style={{
          transition: `transform ${LOADING_WINDOW_TRANSITION_MS}ms cubic-bezier(0.22, 1, 0.36, 1), opacity ${LOADING_WINDOW_TRANSITION_MS}ms ease`,
        }}
        aria-live="polite"
        aria-busy={open}
      >
        <div
          className={`min-w-65 max-w-[min(420px,calc(100vw-1.25rem))] rounded-[20px] border border-surface bg-surface/60 shadow-[0_16px_34px_rgba(0,0,0,0.34),inset_0_1px_0_rgba(255,255,255,0.12)] py-3 px-[0.8rem] flex items-center gap-3 backdrop-blur-sm pointer-events-none motion-reduce:animate-none ${
            isVisible
              ? "animate-[loading-window-breathe_2.2s_ease-in-out_infinite]"
              : ""
          }`}
        >
          <div
            className="loading-window-loader"
            style={
              {
                "--size": scale,
                "--color-one": "var(--color-warning-light, #ffbf48)",
                "--color-two": "var(--color-warning-dark, #be4a1d)",
                "--color-three":
                  "hsl(var(--warning-h) var(--warning-s) var(--warning-l) / 0.5)",
                "--color-four":
                  "hsl(var(--danger-h) var(--danger-s) var(--danger-l) / 0.5)",
                "--color-five":
                  "hsl(var(--warning-h) var(--warning-s) var(--warning-l) / 0.25)",
              } as CSSProperties
            }
          >
            <svg width="100" height="100" viewBox="0 0 100 100" aria-hidden>
              <defs>
                <mask id={clipId}>
                  <polygon points="0,0 100,0 100,100 0,100" fill="black" />
                  <polygon points="25,25 75,25 50,75" fill="white" />
                  <polygon points="50,25 75,75 25,75" fill="white" />
                  <polygon points="35,35 65,35 50,65" fill="white" />
                  <polygon points="35,35 65,35 50,65" fill="white" />
                  <polygon points="35,35 65,35 50,65" fill="white" />
                  <polygon points="35,35 65,35 50,65" fill="white" />
                </mask>
              </defs>
            </svg>

            <div
              className="loading-window-box"
              style={{
                mask: `url(#${clipId})`,
                WebkitMask: `url(#${clipId})`,
              }}
            />
          </div>

          <div className="text-left text-fg-primary">
            <p className="m-0 text-[0.86rem] font-bold tracking-[0.02em] text-primary">
              {title}
            </p>
            <p className="m-0 mt-[0.2rem] text-[0.74rem] leading-[1.3] text-secondary">
              {message}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
