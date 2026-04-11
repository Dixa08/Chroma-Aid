import { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export const fallbackDemoData = {
  name: "Alex Demo",
  cvdType: "Moderate Deutan", // Deutan relates to Deuteranopia
  score: 68,
  testsTaken: 12,
  imagesAnalyzed: 24,
  gameStats: {
    accuracy: 78,
    bestScore: 120,
    reactionTime: 1.2
  },
  voiceSettings: {
    speed: 1,
    voiceURI: null
  }
};

export const AppProvider = ({ children }) => {
  const [userData, setUserData] = useState(fallbackDemoData);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Load from localStorage if present
  useEffect(() => {
    const stored = localStorage.getItem('chroma_user');
    if (stored) {
      setUserData(JSON.parse(stored));
      setIsAuthenticated(true);
    }
  }, []);

  // Sync to LS on change
  const updateUserData = (newData) => {
    const updated = { ...userData, ...newData };
    setUserData(updated);
    if(isAuthenticated) {
      localStorage.setItem('chroma_user', JSON.stringify(updated));
    }
  };

  const login = () => {
    setIsAuthenticated(true);
    localStorage.setItem('chroma_user', JSON.stringify(userData));
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('chroma_user');
  };

  return (
    <AppContext.Provider value={{ 
      userData, 
      updateUserData, 
      isAuthenticated, 
      login, 
      logout 
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
