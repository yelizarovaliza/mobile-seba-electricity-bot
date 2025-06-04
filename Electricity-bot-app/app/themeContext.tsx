import React, { createContext, useContext, useState } from 'react';

const lightTheme = {
  background: '#f5f5f5',
  text: '#1c1c1e',
  card: '#ffffff',
  icon: '#000000',
  accent: '#007aff',
  success: '#00cc66',
  muted: '#555',
};

const darkTheme = {
  background: '#1c1c1e',
  text: '#ffffff',
  card: '#2c2c2e',
  icon: '#ffffff',
  accent: '#0a84ff',
  success: '#00ff90',
  muted: '#aaa',
};

const ThemeContext = createContext({
  theme: darkTheme,
  toggleTheme: () => {},
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [isDark, setIsDark] = useState(true);
  const toggleTheme = () => {
    console.log('Toggling theme');
    setIsDark((prev) => !prev);
  };

  return (
    <ThemeContext.Provider value={{ theme: isDark ? darkTheme : lightTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);