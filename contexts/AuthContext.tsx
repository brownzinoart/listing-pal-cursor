
import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import { User } from '../types';
// import * as authService from '../services/authService'; // No longer needed for mock

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User | null>;
  signup: (email: string, password: string) => Promise<User | null>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Define a mock user for testing
const MOCK_USER: User = {
  id: 'mock-user-id',
  email: 'test@example.com',
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize user state with MOCK_USER and isLoading to false
  const [user, setUser] = useState<User | null>(MOCK_USER);
  const [isLoading, setIsLoading] = useState(false); // Assume user is immediately "loaded"

  // The useEffect for checking loggedIn status is removed to enforce mock user state
  // useEffect(() => {
  //   const checkLoggedIn = async () => {
  //     setIsLoading(true);
  //     try {
  //       const currentUser = authService.getCurrentUser();
  //       setUser(currentUser);
  //     } catch (error) {
  //       console.error("Error checking user status:", error);
  //       setUser(null);
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };
  //   checkLoggedIn();
  // }, []);

  const login = useCallback(async (email: string, password: string): Promise<User | null> => {
    console.log('Mock login attempt with:', email); // Log for clarity during testing
    setUser(MOCK_USER); // Ensure mock user is set
    return MOCK_USER;
  }, []);

  const signup = useCallback(async (email: string, password: string): Promise<User | null> => {
    console.log('Mock signup attempt with:', email); // Log for clarity
    setUser(MOCK_USER); // Ensure mock user is set
    return MOCK_USER; 
  }, []);

  const logout = useCallback(() => {
    console.log('Mock logout attempt. User will remain mock user for testing.');
    // To truly skip login, logout might also set MOCK_USER or do nothing
    // If you want to test the logout flow later, this should be setUser(null)
    // For "skip login page to test", we want to stay logged in.
    setUser(MOCK_USER); 
    // Or, if you want to allow actual logout for other testing phases:
    // authService.logout(); // if you had a real service
    // setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
