import { createContext, useEffect, useState } from "react";

type FontSizeOption = "small" | "medium" | "large";

type FontSizeContextValue = {
  fontSize: FontSizeOption;
  changeFontSize: (newSize: FontSizeOption) => void;
};

export const FontSizeContext = createContext<FontSizeContextValue | null>(null);

export const FontSizeProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [fontSize, setFontSize] = useState<FontSizeOption>("medium"); // small, medium, large

  // Load font size from localStorage on mount
  useEffect(() => {
    const savedFontSize = localStorage.getItem("es_orders_font_size");
    if (savedFontSize && ["small", "medium", "large"].includes(savedFontSize)) {
      const normalized = savedFontSize as FontSizeOption;
      setFontSize(normalized);
      applyFontSize(normalized);
    } else {
      // Set default to medium
      applyFontSize("medium");
    }
  }, []);

  // Apply font size to document root
  const applyFontSize = (size: FontSizeOption) => {
    const root = document.documentElement;

    // Remove existing font size classes
    root.classList.remove(
      "font-size-small",
      "font-size-medium",
      "font-size-large",
    );

    // Add new font size class
    root.classList.add(`font-size-${size}`);
  };

  // Change font size
  const changeFontSize = (newSize: FontSizeOption) => {
    if (["small", "medium", "large"].includes(newSize)) {
      setFontSize(newSize);
      localStorage.setItem("es_orders_font_size", newSize);
      applyFontSize(newSize);
    }
  };

  const value = {
    fontSize,
    changeFontSize,
  };

  return (
    <FontSizeContext.Provider value={value}>
      {children}
    </FontSizeContext.Provider>
  );
};
