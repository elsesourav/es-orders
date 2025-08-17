import { SafeAreaView } from "react-native-safe-area-context";
import { AccountPage } from "../components/pages/AccountPage";
import { useTheme } from "../lib/ThemeContext";

export const AccountScreen = () => {
   const { theme } = useTheme();

   return (
      <SafeAreaView
         style={{ flex: 1, backgroundColor: theme.colors.background }}
         edges={["left", "right"]}
      >
         <AccountPage />
      </SafeAreaView>
   );
};
