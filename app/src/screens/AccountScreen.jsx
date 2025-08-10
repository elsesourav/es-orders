import { SafeAreaView } from "react-native-safe-area-context";
import { AccountPage } from "../components/pages/AccountPage";
import { useTheme } from "../lib/ThemeContext";

export const AccountScreen = () => {
   const { theme } = useTheme();

   return (
      <SafeAreaView
         className="flex-1"
         style={{ backgroundColor: theme.colors.background }}
      >
         <AccountPage />
      </SafeAreaView>
   );
};
