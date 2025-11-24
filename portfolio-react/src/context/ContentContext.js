import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import initialContent from "../data/initialContent.json";
import { API_BASE_URL } from "../config";

const ContentContext = createContext(null);

export const ContentProvider = ({ children }) => {
  const [content, setContent] = useState(initialContent);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchContent = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/content`);
      if (!response.ok) {
        throw new Error("Unable to load portfolio content");
      }
      const data = await response.json();
      setContent(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error("[ContentProvider]", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  return (
    <ContentContext.Provider
      value={{
        content,
        loading,
        error,
        refreshContent: fetchContent,
      }}
    >
      {children}
    </ContentContext.Provider>
  );
};

export const useContent = () => {
  const context = useContext(ContentContext);
  if (!context) {
    throw new Error("useContent must be used within a ContentProvider");
  }
  return context;
};
