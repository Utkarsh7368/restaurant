import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BranchContext = createContext();

export const BRANCHES = [
  { id: 'Auraiya', name: 'Swad Sadan (Auraiya)', city: 'Auraiya' },
  { id: 'Dibiyapur', name: 'Swad Sadan (Dibiyapur)', city: 'Dibiyapur' },
];

export const BranchProvider = ({ children }) => {
  const [selectedBranch, setSelectedBranch] = useState(BRANCHES[0].id);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem('@swadsadan_branch');
      if (saved) {
        setSelectedBranch(saved);
      }
      setLoading(false);
    })();
  }, []);

  const changeBranch = async (branchId) => {
    setSelectedBranch(branchId);
    await AsyncStorage.setItem('@swadsadan_branch', branchId);
  };

  return (
    <BranchContext.Provider value={{ selectedBranch, changeBranch, loading, BRANCHES }}>
      {children}
    </BranchContext.Provider>
  );
};

export const useBranch = () => useContext(BranchContext);
