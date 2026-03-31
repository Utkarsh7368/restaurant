import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';

const BranchContext = createContext();

export const BRANCHES = [
  { id: 'Auraiya', name: 'Swad Sadan (Auraiya)', city: 'Auraiya', lat: 26.4693, lng: 79.5086 },
  { id: 'Dibiyapur', name: 'Swad Sadan (Dibiyapur)', city: 'Dibiyapur', lat: 26.6346, lng: 79.5714 },
];

const MAX_DISTANCE_KM = 12; // 12km delivery radius

export const BranchProvider = ({ children }) => {
  const { user, activeAddress } = useAuth();
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [locationStatus, setLocationStatus] = useState('no_address'); // no_address | valid | out_of_range
  
  // Haversine distance formula
  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const calculateBranch = useCallback(async (lat, lng) => {
    if (!lat || !lng) {
      setLocationStatus('no_address');
      return;
    }

    let nearest = null;
    let minDis = 999999;

    BRANCHES.forEach(branch => {
      const dis = getDistance(lat, lng, branch.lat, branch.lng);
      if (dis < minDis) {
        minDis = dis;
        nearest = branch;
      }
    });

    if (nearest && minDis <= MAX_DISTANCE_KM) {
      setSelectedBranch(nearest.id);
      setLocationStatus('valid');
      await AsyncStorage.setItem('@swadsadan_branch', nearest.id);
    } else {
      setLocationStatus('out_of_range');
    }
  }, []);

  // Update branch whenever active address changes
  useEffect(() => {
    if (activeAddress?.lat && activeAddress?.lng) {
      calculateBranch(activeAddress.lat, activeAddress.lng);
    } else if (user) {
      setLocationStatus('no_address');
    }
  }, [activeAddress, user]);

  return (
    <BranchContext.Provider value={{ 
      selectedBranch, 
      locationStatus, 
      BRANCHES,
      calculateBranch
    }}>
      {children}
    </BranchContext.Provider>
  );
};

export const useBranch = () => useContext(BranchContext);
