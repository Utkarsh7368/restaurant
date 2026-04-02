import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity,
  ScrollView, StatusBar, Animated, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CATEGORIES } from '../data/menuData';
import { useFocusEffect } from '@react-navigation/native';
import { API_URL } from '../context/AuthContext';
import axios from 'axios';
import GridFoodCard from '../components/GridFoodCard';
import { useBranch } from '../context/BranchContext';
import { useAuth } from '../context/AuthContext';
import LocationStatusOverlay from '../components/LocationStatusOverlay';
import { Ionicons } from '@expo/vector-icons';

const PRIMARY = '#e23744';

export default function MenuScreen() {
  const { selectedBranch, locationStatus, BRANCHES } = useBranch();
  const { user, activeAddress, activeAddressType, setActiveAddressType } = useAuth();
  const [MENU_ITEMS, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCat, setCat] = useState('all');
  const [showLocationModal, setShowLocationModal] = useState(false);
  const fade = useRef(new Animated.Value(0)).current;

  // Load cache on mount
  useEffect(() => {
    (async () => {
      const cache = await AsyncStorage.getItem('@swadsadan_menu_cache');
      if (cache) {
        setMenuItems(JSON.parse(cache));
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    Animated.timing(fade, { toValue: 1, duration: 350, useNativeDriver: true }).start();
  }, []);

  useFocusEffect(useCallback(() => {
    axios.get(`${API_URL}/menu`).then(async (res) => {
      setMenuItems(res.data);
      setLoading(false);
      await AsyncStorage.setItem('@swadsadan_menu_cache', JSON.stringify(res.data));
    }).catch(err => {
      console.warn(err);
      setLoading(false);
    });
  }, []));

  const filtered = useCallback(() => {
    let items = MENU_ITEMS;
    if (activeCat !== 'all') items = items.filter(i => i.tags?.includes(activeCat));
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      items = items.filter(i => i.name.toLowerCase().includes(q));
    }
    return items;
  }, [search, activeCat, MENU_ITEMS]);

  const data = filtered();

  return (
    <Animated.View style={[styles.container, { opacity: fade }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <SafeAreaView edges={['top']} style={styles.safe}>
        <View style={styles.header}>
          <Text style={styles.title}>Menu</Text>
          <Text style={styles.count}>{data.length} items</Text>
        </View>
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput style={styles.searchInput} placeholder="Search menu" placeholderTextColor="#bbb" value={search} onChangeText={setSearch} />
          {search.length > 0 && <TouchableOpacity onPress={() => setSearch('')}><Text style={styles.clear}>✕</Text></TouchableOpacity>}
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catRow}>
          {CATEGORIES.map(cat => {
            const active = activeCat === cat.id;
            return (
              <TouchableOpacity key={cat.id} style={[styles.catPill, active && styles.catActive]} onPress={() => setCat(cat.id)} activeOpacity={0.7}>
                <Text style={[styles.catTxt, active && styles.catTxtActive]}>{cat.name}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </SafeAreaView>
      {locationStatus === 'valid' ? (
        <FlatList data={data} keyExtractor={i=> i._id} numColumns={2} renderItem={({item})=> <GridFoodCard item={item} />}
          contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false} columnWrapperStyle={styles.colWrap}
          ListEmptyComponent={
            loading ? (
              <View style={styles.empty}>
                <ActivityIndicator size="large" color={PRIMARY} />
                <Text style={[styles.emptyTxt, {marginTop: 10}]}>Loading menu...</Text>
              </View>
            ) : (
              <View style={styles.empty}>
                <Text style={styles.emptyIcon}>🍽️</Text>
                <Text style={styles.emptyTxt}>No items</Text>
              </View>
            )
          }
        />
      ) : (
        <LocationStatusOverlay 
          type={locationStatus} 
          onShowModal={() => setShowLocationModal(true)} 
        />
      )}

      {/* Location Modal Sync */}
      {showLocationModal && (
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setShowLocationModal(false)}
        >
          <Animated.View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Delivery Location</Text>
            <ScrollView style={{maxHeight: 400}}>
              <TouchableOpacity 
                style={[styles.currentLocBox, activeAddressType === 'primary' && styles.activeLocBox]}
                onPress={() => { setActiveAddressType('primary'); setShowLocationModal(false); }}
              >
                <View style={[styles.locIconCirc, activeAddressType === 'primary' && {backgroundColor: PRIMARY}]}>
                  <Ionicons name="location" size={20} color={activeAddressType === 'primary' ? "#fff" : PRIMARY} />
                </View>
                <View style={{flex: 1}}>
                  <Text style={styles.locLabel}>{user?.addressLabel || 'Home'}</Text>
                  <Text style={styles.locValue} numberOfLines={2}>{user?.address}</Text>
                </View>
                {activeAddressType === 'primary' && <Ionicons name="checkmark-circle" size={24} color={PRIMARY} />}
              </TouchableOpacity>

              {user?.secondaryAddress && (
                <TouchableOpacity 
                  style={[styles.currentLocBox, activeAddressType === 'secondary' && styles.activeLocBox]}
                  onPress={() => { setActiveAddressType('secondary'); setShowLocationModal(false); }}
                >
                  <View style={[styles.locIconCirc, activeAddressType === 'secondary' && {backgroundColor: PRIMARY}]}>
                    <Ionicons name="location" size={20} color={activeAddressType === 'secondary' ? "#fff" : PRIMARY} />
                  </View>
                  <View style={{flex: 1}}>
                    <Text style={styles.locLabel}>{user?.secondaryAddressLabel || 'Work'}</Text>
                    <Text style={styles.locValue} numberOfLines={2}>{user?.secondaryAddress}</Text>
                  </View>
                  {activeAddressType === 'secondary' && <Ionicons name="checkmark-circle" size={24} color={PRIMARY} />}
                </TouchableOpacity>
              )}
            </ScrollView>
            <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setShowLocationModal(false)}>
              <Text style={styles.modalCloseTxt}>Close</Text>
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  safe: { backgroundColor: '#fff' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 10 },
  title: { fontSize: 22, fontWeight: '800', color: '#1c1c1c' },
  count: { fontSize: 12, color: '#aaa' },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f7f7f7', borderRadius: 14, marginHorizontal: 16, paddingHorizontal: 14, height: 42, marginBottom: 10 },
  searchIcon: { fontSize: 14, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14, color: '#1c1c1c', height: '100%' },
  clear: { fontSize: 14, color: '#aaa', paddingHorizontal: 4 },
  catRow: { paddingHorizontal: 16, paddingBottom: 8 },
  catPill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 18, backgroundColor: '#f7f7f7', marginRight: 8 },
  catActive: { backgroundColor: '#fce8ea' },
  catTxt: { fontSize: 12, fontWeight: '600', color: '#6b6b6b' },
  catTxtActive: { color: PRIMARY, fontWeight: '700' },
  grid: { paddingHorizontal: 8, paddingBottom: 90 },
  colWrap: { justifyContent: 'space-between' },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 40, marginBottom: 8 },
  emptyTxt: { fontSize: 14, color: '#aaa' },

  // Modal Styles (to match Home)
  modalOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end', zIndex: 200 },
  modalSheet: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalHandle: { width: 40, height: 4, backgroundColor: '#eee', borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '900', color: '#1a1a1a', marginBottom: 24 },
  currentLocBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#edf2f7', marginBottom: 12 },
  activeLocBox: { borderColor: PRIMARY, backgroundColor: '#fff5f5' },
  locIconCirc: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', marginRight: 12, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5 },
  locLabel: { fontSize: 10, fontWeight: '800', color: '#a0aec0', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  locValue: { fontSize: 14, fontWeight: '600', color: '#2d3748', lineHeight: 20 },
  modalCloseBtn: { alignItems: 'center', padding: 12 },
  modalCloseTxt: { fontSize: 14, fontWeight: '700', color: '#a0aec0' },
});
