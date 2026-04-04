/// <reference types="vite/client" />

declare module "swiper/css";
declare module "swiper/css/*";

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
