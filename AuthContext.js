import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { auth } from '../config/firebaseConfig'; 
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [permissionsGranted, setPermissionsGranted] = useState(false);

  // Check if the user is already logged in when the app opens
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    });
    return () => unsubscribe(); // Cleanup function
  }, []);

  // Firebase login function
  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setUser(userCredential.user);
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Login Error: ", error.message);
      alert("Login Failed: " + error.message);
    }
  };

  // Firebase logout function
  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error("Logout Error: ", error.message);
    }
  };

  const grantPermissions = () => setPermissionsGranted(true);

  const value = useMemo(() => ({
    user,
    isAuthenticated,
    permissionsGranted,
    login,
    logout,
    grantPermissions,
  }), [user, isAuthenticated, permissionsGranted]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};

export default AuthContext;
    ;
