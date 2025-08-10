import { useAuth } from "../lib/AuthContext";
import { LoginPage } from "./login/LoginPage";
import { UserProfile } from "./login/UserProfile";

export const AccountPage = () => {
   const { user, isAuthenticated, logout } = useAuth();

   // If not authenticated, show login page
   if (!isAuthenticated) {
      return <LoginPage />;
   }

   // User is authenticated, show user profile
   return <UserProfile user={user} onLogout={logout} />;
};
