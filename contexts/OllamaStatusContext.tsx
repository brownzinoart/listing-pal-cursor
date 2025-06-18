import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";

interface OllamaStatusContextType {
  isOllamaOnline: boolean;
  checkStatus: () => Promise<void>;
  isLoadingStatus: boolean;
}

const OllamaStatusContext = createContext<OllamaStatusContextType | undefined>(
  undefined,
);

interface OllamaStatusProviderProps {
  children: ReactNode;
}

const OLLAMA_BASE_URL =
  process.env.REACT_APP_OLLAMA_URL || "http://localhost:11434";

export const OllamaStatusProvider: React.FC<OllamaStatusProviderProps> = ({
  children,
}) => {
  const [isOllamaOnline, setIsOllamaOnline] = useState<boolean>(false);
  const [isLoadingStatus, setIsLoadingStatus] = useState<boolean>(true);

  const checkStatus = useCallback(async () => {
    setIsLoadingStatus(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const response = await fetch(OLLAMA_BASE_URL, {
        method: "HEAD",
        signal: controller.signal,
        mode: "cors",
      });

      clearTimeout(timeoutId);
      setIsOllamaOnline(true);
    } catch (error) {
      setIsOllamaOnline(false);
      console.warn("Ollama service is offline or not accessible.", error);
    } finally {
      setIsLoadingStatus(false);
    }
  }, []);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  const value = { isOllamaOnline, checkStatus, isLoadingStatus };

  return (
    <OllamaStatusContext.Provider value={value}>
      {children}
    </OllamaStatusContext.Provider>
  );
};

export const useOllamaStatus = (): OllamaStatusContextType => {
  const context = useContext(OllamaStatusContext);
  if (context === undefined) {
    throw new Error(
      "useOllamaStatus must be used within a OllamaStatusProvider",
    );
  }
  return context;
};
