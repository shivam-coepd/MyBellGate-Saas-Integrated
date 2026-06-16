import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import apiClient from '../services/api';
import { requestFirebasePermission } from '../services/fcmService';

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'super_admin' | 'admin' | 'resident' | 'guard' | 'staff';
  society_id?: number;
  society_name?: string;
  society_code?: string;
  flat_id?: number;
  status?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (phone: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isSuperAdmin: boolean;
  isAdmin: boolean;
  isResident: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // Check if token exists in window.State (legacy SPA compatibility)
      if (typeof window !== 'undefined' && (window as any).State?.token) {
        apiClient.setToken((window as any).State.token);
      }
      
      const response = await apiClient.getMe();
      if (response.success) {
        const userData = response.data as User;
        console.log('User data loaded:', userData);
        setUser(userData);
        // Sync to window.State for legacy SPA
        if (typeof window !== 'undefined') {
          (window as any).State = (window as any).State || {};
          (window as any).State.user = userData;
        }
      }
    } catch (error) {
      // User is not authenticated
      console.log('Not authenticated');
    } finally {
      setLoading(false);
    }
  };

  const login = async (phone: string, password: string) => {
    try {
      const response = await apiClient.login(phone, password);
      if (response.success) {
        const data = response.data as { token: string; user: User };
        const token = data.token;
        apiClient.setToken(token);
        setUser(data.user);
        // Save user to localStorage for routing decisions
        localStorage.setItem('user', JSON.stringify(data.user));
        // Also set token in window.State for legacy SPA compatibility
        if (typeof window !== 'undefined') {
          (window as any).State = (window as any).State || {};
          (window as any).State.token = token;
          (window as any).State.user = data.user;
        }
        // Register FCM web push token after successful login
        requestFirebasePermission().catch((e) =>
          console.warn('FCM registration skipped:', e)
        );
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await apiClient.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      apiClient.clearToken();
      setUser(null);
      localStorage.removeItem('user');
      // Also clear window.State for legacy SPA compatibility
      if (typeof window !== 'undefined') {
        (window as any).State = (window as any).State || {};
        (window as any).State.token = null;
        (window as any).State.user = null;
      }
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    isSuperAdmin: user?.role === 'super_admin',
    isAdmin: user?.role === 'admin',
    isResident: user?.role === 'resident',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
