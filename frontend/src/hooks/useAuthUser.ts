import { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { apiService } from '../services/api';
import { User } from '../types';

export const useAuthUser = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(false);
  const [userError, setUserError] = useState<string | null>(null);
  
  const { isAuthenticated, isLoading, getAccessTokenSilently, user, logout } = useAuth0();

  useEffect(() => {
    const fetchUser = async () => {
      if (isAuthenticated && user && !currentUser) {
        setIsLoadingUser(true);
        setUserError(null);
        
        try {
          const accessToken = await getAccessTokenSilently();
          const backendUser = await apiService.getCurrentUser(accessToken);
          setCurrentUser(backendUser);
        } catch (error) {
          console.error('Error fetching user:', error);
          setUserError(error instanceof Error ? error.message : 'Failed to fetch user');
          
          if (error === 'UNAUTHORIZED') {
            logout();
          }
        } finally {
          setIsLoadingUser(false);
        }
      } else if (!isAuthenticated) {
        setCurrentUser(null);
        setUserError(null);
      }
    };

    fetchUser();
  }, [isAuthenticated, user, getAccessTokenSilently, logout, currentUser]);

  const getAccessToken = async () => {
    if (!isAuthenticated) {
      throw new Error('User not authenticated');
    }
    return await getAccessTokenSilently();
  };

  return {
    currentUser,
    isLoadingUser: isLoading || isLoadingUser,
    userError,
    isAuthenticated,
    getAccessToken,
  };
};