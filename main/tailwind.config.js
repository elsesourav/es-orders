import scrollbar from "tailwind-scrollbar";

/** @type {import('tailwindcss').Config} */
export default {
   content: ["./src/**/*.{js,jsx,ts,tsx}", "./popup.html", "./options.html"],
   darkMode: "class",
   plugins: [scrollbar],
};
