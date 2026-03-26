import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const AuthContext = createContext();
const TOKEN_KEY = '@swadsadan_token';
const USER_KEY = '@swadsadan_user';
const SKIPPED_KEY = '@swadsadan_skipped';

// NOTE: Replace with your actual local IP or production URL
export const API_URL = 'https://restaurant-lovat-rho.vercel.app/api'; 

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasSkipped, setHasSkipped] = useState(false);

  // Check for existing session on app start
  useEffect(() => {
    (async () => {
      try {
        // SILENT PING: Wakes up Vercel cold starts while loading session
        fetch(API_URL.replace('/api', '')).catch(() => {});

        const storedToken = await AsyncStorage.getItem(TOKEN_KEY);
        const storedUser = await AsyncStorage.getItem(USER_KEY);
        const storedSkipped = await AsyncStorage.getItem(SKIPPED_KEY);
        
        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        }
        if (storedSkipped === 'true') {
          setHasSkipped(true);
        }
      } catch (e) { console.warn(e); }
      setLoading(false);
    })();
  }, []);

  const saveAuthInfo = async (tkn, usr) => {
    await AsyncStorage.setItem(TOKEN_KEY, tkn);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(usr));
    // Reset skip state on new login so we can re-check their profile
    await AsyncStorage.removeItem(SKIPPED_KEY);
    setHasSkipped(false);
    setToken(tkn);
    setUser(usr);
    axios.defaults.headers.common['Authorization'] = `Bearer ${tkn}`;
  };

  // Register
  const register = async (name, email, password) => {
    try {
      const res = await axios.post(`${API_URL}/auth/register`, { name, email, password });
      await saveAuthInfo(res.data.token, res.data.user);
    } catch (err) {
      throw new Error(err.response?.data?.msg || 'Registration failed');
    }
  };

  // Login
  const login = async (email, password) => {
    try {
      const res = await axios.post(`${API_URL}/auth/login`, { email, password });
      await saveAuthInfo(res.data.token, res.data.user);
    } catch (err) {
      throw new Error(err.response?.data?.msg || 'Invalid email or password');
    }
  };

  // Google Login
  const googleLogin = async (idToken) => {
    try {
      const res = await axios.post(`${API_URL}/auth/google-login`, { idToken });
      await saveAuthInfo(res.data.token, res.data.user);
    } catch (err) {
      throw new Error(err.response?.data?.msg || 'Google Sign-In failed');
    }
  };

  // Update profile
  const updateProfile = async (profileData) => {
    try {
      const res = await axios.put(`${API_URL}/user/update-profile`, profileData);
      const updatedUser = { ...user, ...res.data };
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (err) {
      throw new Error(err.response?.data?.msg || 'Failed to update profile');
    }
  };

  // Logout
  const logout = async () => {
    await AsyncStorage.removeItem(TOKEN_KEY);
    await AsyncStorage.removeItem(USER_KEY);
    await AsyncStorage.removeItem(SKIPPED_KEY);
    delete axios.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
    setHasSkipped(false);
  };

  const skipOnboarding = async () => {
    await AsyncStorage.setItem(SKIPPED_KEY, 'true');
    setHasSkipped(true);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, logout, login, register, googleLogin, updateProfile, hasSkipped, skipOnboarding }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
