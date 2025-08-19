import { useEffect, useState } from "react";
import { VoiceSettingsContext } from "./voiceSettingsContext";

export const VoiceSettingsProvider = ({ children }) => {
   const [actionTalkEnabled, setActionTalkEnabled] = useState(true);
   const [showMicButton, setShowMicButton] = useState(true);

   // Load settings from localStorage on mount
   useEffect(() => {
      const savedActionTalk = localStorage.getItem("es_orders_action_talk");
      const savedShowMic = localStorage.getItem("es_orders_show_mic");

      if (savedActionTalk !== null) {
         setActionTalkEnabled(JSON.parse(savedActionTalk));
      }
      if (savedShowMic !== null) {
         setShowMicButton(JSON.parse(savedShowMic));
      }
   }, []);

   // Toggle action talk setting
   const toggleActionTalk = () => {
      const newValue = !actionTalkEnabled;
      setActionTalkEnabled(newValue);
      localStorage.setItem("es_orders_action_talk", JSON.stringify(newValue));
   };

   // Toggle show mic button setting
   const toggleShowMicButton = () => {
      const newValue = !showMicButton;
      setShowMicButton(newValue);
      localStorage.setItem("es_orders_show_mic", JSON.stringify(newValue));
   };

   const value = {
      actionTalkEnabled,
      showMicButton,
      toggleActionTalk,
      toggleShowMicButton,
   };

   return (
      <VoiceSettingsContext.Provider value={value}>
         {children}
      </VoiceSettingsContext.Provider>
   );
};
