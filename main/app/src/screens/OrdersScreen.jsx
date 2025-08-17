import { SafeAreaView } from "react-native-safe-area-context";
import { OrdersPage } from "../components/pages/OrdersPage";
import { useTheme } from "../lib/ThemeContext";

export const OrdersScreen = ({ navigation, route }) => {
   const { theme } = useTheme();

   return (
      <SafeAreaView
         style={{ flex: 1, backgroundColor: theme.colors.background }}
         edges={["left", "right"]}
      >
         <OrdersPage navigation={navigation} route={route} />
      </SafeAreaView>
   );
};
