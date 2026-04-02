import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const AuthContext = createContext();
const TOKEN_KEY = '@swadsadan_token';
const USER_KEY = '@swadsadan_user';
const SKIPPED_KEY = '@swadsadan_skipped';
const ACTIVE_TYPE_KEY = '@swadsadan_active_type';

export const API_URL = 'https://restaurant-lovat-rho.vercel.app/api'; 

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasSkipped, setHasSkipped] = useState(false);
  const [activeAddressType, setActiveAddressTypeState] = useState('primary'); // 'primary' | 'secondary'

  // Derived active address object
  const activeAddress = React.useMemo(() => {
    if (!user) return null;
    if (activeAddressType === 'secondary' && user.secondaryAddress) {
      return {
        address: user.secondaryAddress,
        lat: user.secondaryLat,
        lng: user.secondaryLng,
        houseNo: user.secondaryHouseNo,
        landmark: user.secondaryLandmark,
        label: user.secondaryAddressLabel || 'Secondary'
      };
    }
    return {
      address: user.address,
      lat: user.lat,
      lng: user.lng,
      houseNo: user.houseNo,
      landmark: user.landmark,
      label: user.addressLabel || 'Home'
    };
  }, [user, activeAddressType]);

  useEffect(() => {
    // 🛡️ Request Interceptor: Ensures the token is always attached to every request
    const interceptor = axios.interceptors.request.use(
      async (config) => {
        const storedToken = await AsyncStorage.getItem(TOKEN_KEY);
        if (storedToken) {
          config.headers.Authorization = `Bearer ${storedToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    (async () => {
      try {
        fetch(API_URL.replace('/api', '')).catch(() => {});
        const storedToken = await AsyncStorage.getItem(TOKEN_KEY);
        const storedUser = await AsyncStorage.getItem(USER_KEY);
        const storedSkipped = await AsyncStorage.getItem(SKIPPED_KEY);
        const storedType = await AsyncStorage.getItem(ACTIVE_TYPE_KEY);
        
        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
        if (storedSkipped === 'true') setHasSkipped(true);
        if (storedType) setActiveAddressTypeState(storedType);
      } catch (e) { console.warn(e); }
      setLoading(false);
    })();

    return () => axios.interceptors.request.eject(interceptor);
  }, []);

  const saveAuthInfo = async (tkn, usr) => {
    await AsyncStorage.setItem(TOKEN_KEY, tkn);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(usr));
    await AsyncStorage.removeItem(SKIPPED_KEY);
    setHasSkipped(false);
    setToken(tkn);
    setUser(usr);
    axios.defaults.headers.common['Authorization'] = `Bearer ${tkn}`;
  };

  const register = async (name, email, password) => {
    try {
      const res = await axios.post(`${API_URL}/auth/register`, { name, email, password });
      await saveAuthInfo(res.data.token, res.data.user);
    } catch (err) { throw new Error(err.response?.data?.msg || 'Registration failed'); }
  };

  const login = async (identifier, password) => {
    try {
      const isEmail = /\S+@\S+\.\S+/.test(identifier);
      const payload = isEmail ? { email: identifier, password } : { agentId: identifier, password };
      const res = await axios.post(`${API_URL}/auth/login`, payload);
      await saveAuthInfo(res.data.token, res.data.user);
    } catch (err) { throw new Error(err.response?.data?.msg || 'Invalid credentials'); }
  };

  const googleLogin = async (idToken) => {
    try {
      const res = await axios.post(`${API_URL}/auth/google-login`, { idToken });
      await saveAuthInfo(res.data.token, res.data.user);
    } catch (err) { throw new Error(err.response?.data?.msg || 'Google Sign-In failed'); }
  };

  const updateProfile = async (profileData) => {
    try {
      const res = await axios.put(`${API_URL}/user/update-profile`, profileData);
      const updatedUser = { ...user, ...res.data };
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (err) { throw new Error(err.response?.data?.msg || 'Failed to update profile'); }
  };

  const setActiveAddressType = async (type) => {
    setActiveAddressTypeState(type);
    await AsyncStorage.setItem(ACTIVE_TYPE_KEY, type);
  };

  const logout = async () => {
    await AsyncStorage.removeItem(TOKEN_KEY);
    await AsyncStorage.removeItem(USER_KEY);
    await AsyncStorage.removeItem(SKIPPED_KEY);
    await AsyncStorage.removeItem(ACTIVE_TYPE_KEY);
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
    <AuthContext.Provider value={{ 
      user, token, loading, logout, login, register, googleLogin, 
      updateProfile, hasSkipped, skipOnboarding,
      activeAddress, activeAddressType, setActiveAddressType
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
