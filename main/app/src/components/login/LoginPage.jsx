import { useState } from "react";
import { useAuth } from "../../lib/AuthContext";
import { SignIn } from "./SignIn";
import { SignUp } from "./SignUp";
import { UserProfile } from "./UserProfile";

export const LoginPage = () => {
   const { user, isAuthenticated, login, register, logout } = useAuth();
   const [currentView, setCurrentView] = useState("signin"); // 'signin' or 'signup'

   // If user is authenticated, show user profile
   if (isAuthenticated && user) {
      return <UserProfile user={user} onLogout={logout} />;
   }

   // If not authenticated, show sign in or sign up forms
   return (
      <>
         {currentView === "signin" ? (
            <SignIn
               onSignIn={login}
               onSwitchToSignUp={() => setCurrentView("signup")}
            />
         ) : (
            <SignUp
               onSignUp={register}
               onSwitchToSignIn={() => setCurrentView("signin")}
            />
         )}
      </>
   );
};
