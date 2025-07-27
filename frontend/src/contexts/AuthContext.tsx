import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { User } from '../types';
import { apiService } from '../services/api';

interface AuthContextType {
  currentUser: User | null;
  accessToken: string | null;
  isLoading: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const {
    isAuthenticated,
    isLoading: auth0Loading,
    getAccessTokenSilently,
    logout,
    user,
  } = useAuth0();

  const fetchUser = async () => {
    if (isAuthenticated && user && !auth0Loading) {
      try {
        setIsLoading(true);
        const token = await getAccessTokenSilently();
        setAccessToken(token);

        const backendUser = await apiService.getCurrentUser(token);
        
        // Transform backend user to include legacy compatibility fields
        const transformedUser: User = {
          ...backendUser,
          id: backendUser._id, // Legacy compatibility
          name: backendUser.username, // Legacy compatibility
          createdTECs: backendUser.tecs.map((tec) => tec._id), // Extract TEC IDs
          createdPACs: backendUser.pacs.map((pac) => pac._id), // Extract PAC IDs
          createdSnippets: backendUser.tecs.map((tec) => tec._id), // Legacy compatibility
        };

        setCurrentUser(transformedUser);
      } catch (error) {
        console.error('Error fetching user:', error);
        if (error === 'UNAUTHORIZED') {
          logout();
        }
        setCurrentUser(null);
        setAccessToken(null);
      } finally {
        setIsLoading(false);
      }
    } else {
      setCurrentUser(null);
      setAccessToken(null);
      setIsLoading(auth0Loading);
    }
  };

  useEffect(() => {
    fetchUser();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user, auth0Loading]);

  const refreshUser = async () => {
    await fetchUser();
  };

  const value: AuthContextType = {
    currentUser,
    accessToken,
    isLoading,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};