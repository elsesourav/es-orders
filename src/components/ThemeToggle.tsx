import { Moon, Sun } from "lucide-react";
import { useTheme } from "../lib/ThemeContext";

const ThemeToggle = () => {
   const { isDark, toggleTheme } = useTheme();

   return (
      <button
         onClick={toggleTheme}
         className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
         aria-label="Toggle theme"
      >
         {isDark ? (
            <Sun size={20} className="text-yellow-500" />
         ) : (
            <Moon size={20} className="text-gray-600 dark:text-gray-300" />
         )}
      </button>
   );
};

export default ThemeToggle;
