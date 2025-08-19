import { useContext } from "react";
import { VoiceSettingsContext } from "./voiceSettingsContext";

export const useVoiceSettings = () => {
   const context = useContext(VoiceSettingsContext);
   if (!context) {
      throw new Error(
         "useVoiceSettings must be used within a VoiceSettingsProvider"
      );
   }
   return context;
};
