import type { ReactNode } from "react";
import { createContext, useCallback, useContext, useRef } from "react";

// Context to manage which select dropdown is currently open
type SelectCloseCallback = (exceptId: string | null) => void;

type SelectContextType = {
  registerCloseCallback: (callback: SelectCloseCallback) => () => void;
  closeAllExcept: (exceptId: string) => void;
  closeAll: () => void;
};

const SelectContext = createContext<SelectContextType | null>(null);

type SelectProviderProps = {
  children: ReactNode;
};

export const SelectProvider = ({ children }: SelectProviderProps) => {
  const closeCallbacksRef = useRef<Set<SelectCloseCallback>>(new Set());

  const registerCloseCallback = useCallback((callback: SelectCloseCallback) => {
    closeCallbacksRef.current.add(callback);
    return () => closeCallbacksRef.current.delete(callback);
  }, []);

  const closeAllExcept = useCallback((exceptId: string) => {
    closeCallbacksRef.current.forEach((callback) => {
      callback(exceptId);
    });
  }, []);

  const closeAll = useCallback(() => {
    closeCallbacksRef.current.forEach((callback) => {
      callback(null);
    });
  }, []);

  return (
    <SelectContext.Provider
      value={{ registerCloseCallback, closeAllExcept, closeAll }}
    >
      {children}
    </SelectContext.Provider>
  );
};

export const useSelectContext = () => {
  const context = useContext(SelectContext);
  // Return a default object if no provider is found (for backward compatibility)
  if (!context) {
    return {
      registerCloseCallback: () => () => {},
      closeAllExcept: () => {},
      closeAll: () => {},
    };
  }
  return context;
};

export default SelectContext;
