import { useState } from "react";

type AlertState = {
  type: "success" | "error";
  message: string;
};

type UseAccountSwitchParams = {
  user: any;
  switchAccount: (
    username: string,
  ) => Promise<{ success: boolean; error?: string }>;
  t: (key: string) => string;
};

export default function useAccountSwitch({
  user,
  switchAccount,
  t,
}: UseAccountSwitchParams) {
  const [showSwitchPopup, setShowSwitchPopup] = useState(false);
  const [switchPopupVisible, setSwitchPopupVisible] = useState(false);
  const [switchingUsername, setSwitchingUsername] = useState<string | null>(
    null,
  );
  const [alert, setAlert] = useState<AlertState | null>(null);

  const openSwitchPopup = () => {
    setShowSwitchPopup(true);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setSwitchPopupVisible(true));
    });
  };

  const closeSwitchPopup = () => {
    setSwitchPopupVisible(false);
    setTimeout(() => setShowSwitchPopup(false), 180);
  };

  const handleQuickSwitch = async (username: string) => {
    if (
      String(username).toLowerCase() === String(user?.username).toLowerCase()
    ) {
      return;
    }

    setSwitchingUsername(username);
    const result = await switchAccount(username);
    setSwitchingUsername(null);

    if (!result.success) {
      setAlert({
        type: "error",
        message: result.error || t("settings.switchFailed"),
      });
      return;
    }

    setAlert({
      type: "success",
      message: `${t("settings.switchedTo")} @${username}`,
    });
    closeSwitchPopup();
  };

  return {
    showSwitchPopup,
    switchPopupVisible,
    switchingUsername,
    alert,
    setAlert,
    openSwitchPopup,
    closeSwitchPopup,
    handleQuickSwitch,
  };
}
