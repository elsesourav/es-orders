/// <reference types="vite/client" />

declare global {
  interface Window {
    isAndroid?: boolean;
    AndroidClipboard?: {
      setText: (text: string) => Promise<void> | void;
      getText: () => Promise<string> | string;
    };
  }
}

export {};
