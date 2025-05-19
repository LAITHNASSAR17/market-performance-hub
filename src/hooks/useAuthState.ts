
import { useState, useEffect } from 'react';
import { User } from '@/types/auth';

const USER_STORAGE_KEY = 'trackmind_user';
const AUTH_STATUS_KEY = 'trackmind_auth_status';

export function useAuthState() {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem(USER_STORAGE_KEY);
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    const storedUser = localStorage.getItem(USER_STORAGE_KEY);
    return storedUser ? JSON.parse(storedUser)?.role === 'admin' : false;
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem(AUTH_STATUS_KEY) === 'true';
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_STORAGE_KEY);
    }
    
    localStorage.setItem(AUTH_STATUS_KEY, isAuthenticated.toString());
  }, [user, isAuthenticated]);

  return {
    user,
    setUser,
    isAdmin,
    setIsAdmin,
    isAuthenticated,
    setIsAuthenticated,
    loading,
    setLoading,
    users,
    setUsers,
  };
}
