// src/context/AuthContext.js
// Global authentication state shared across the whole app.

import React, { createContext, useContext, useState, useMemo } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // { name, email, method }
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [permissionsGranted, setPermissionsGranted] = useState(false);

  const login = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setPermissionsGranted(false);
  };

  const grantPermissions = () => setPermissionsGranted(true);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated,
      permissionsGranted,
      login,
      logout,
      grantPermissions,
    }),
    [user, isAuthenticated, permissionsGranted]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};

export default AuthContext;
