import { SafeAreaView } from "react-native-safe-area-context";
import { LoginPage } from "../components/login/LoginPage";
import { useTheme } from "../lib/ThemeContext";

export const LoginScreen = () => {
   const { theme } = useTheme();

   return (
      <SafeAreaView
         style={{ flex: 1, backgroundColor: theme.colors.background }}
         edges={["left", "right", "top", "bottom"]}
      >
         <LoginPage />
      </SafeAreaView>
   );
};
