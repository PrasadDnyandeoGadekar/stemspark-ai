import React, { createContext, useState, useContext } from 'react';

// Create the context
const AuthContext = createContext();

// Create a provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Fake login function (we will connect this to real database later)
  const login = (email, password) => {
    setUser({ email: email, name: "Student" });
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context easily
export const useAuth = () => useContext(AuthContext);