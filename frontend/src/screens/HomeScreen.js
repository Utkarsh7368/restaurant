import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TextInput, TouchableOpacity, ScrollView, StatusBar, Animated, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import { CATEGORIES } from '../data/menuData'; // DEPRECATED
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { API_URL } from '../context/AuthContext';
import axios from 'axios';
import FoodCard from '../components/FoodCard';
import { Ionicons } from '@expo/vector-icons';
import { useBranch } from '../context/BranchContext';
import { useAuth } from '../context/AuthContext';
import LocationStatusOverlay from '../components/LocationStatusOverlay';

const PRIMARY = '#e23744';

// ─── Popular chip (horizontal scroll) ──────────────────────────
const PopularChip = React.memo(({ item }) => {
  const navigation = useNavigation();
  return (
    <TouchableOpacity 
      style={styles.popChip} 
      activeOpacity={0.9} 
      onPress={() => navigation.navigate('FoodDetail', { item })}
    >
      <Image source={{ uri: item.image }} style={styles.popImg} />
      <View style={styles.popInfo}>
        <Text style={styles.popName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.popPrice}>₹{item.price}</Text>
      </View>
    </TouchableOpacity>
  );
});

// ─── Main HomeScreen ───────────────────────────────────────────
export default function HomeScreen() {
  const { selectedBranch, locationStatus, BRANCHES } = useBranch();
  const { user, activeAddress, activeAddressType, setActiveAddressType } = useAuth();
  const navigation = useNavigation();
  const [MENU_ITEMS, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([{ id: 'all', name: 'All', icon: '🍽️' }]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
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
    Animated.timing(fade, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, []);

  const fetchMenu = useCallback(async () => {
    try {
      const [menuRes, catRes] = await Promise.all([
        axios.get(`${API_URL}/menu`),
        axios.get(`${API_URL}/category`)
      ]);
      
      setMenuItems(menuRes.data);
      // Prepend 'All' to dynamic categories
      setCategories([{ id: 'all', name: 'All', icon: '🍽️' }, ...catRes.data]);
      
      setLoading(false);
      setRefreshing(false);
      await AsyncStorage.setItem('@swadsadan_menu_cache', JSON.stringify(menuRes.data));
    } catch (err) {
      console.warn(err);
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchMenu();      // Refresh Menu
  }, [fetchMenu]);

  useFocusEffect(useCallback(() => {
    fetchMenu();
  }, [fetchMenu]));

  const filtered = useCallback(() => {
    let items = MENU_ITEMS;
    if (activeCat !== 'all') items = items.filter(i => i.tags?.includes(activeCat));
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      items = items.filter(i => i.name.toLowerCase().includes(q));
    }
    return items;
  }, [search, activeCat, MENU_ITEMS]);

  const popular = MENU_ITEMS.filter(i => i.isPopular);
  const data = filtered();
  const isFiltering = search.trim() !== '' || activeCat !== 'all';

  return (
    <Animated.View style={[styles.flex, { opacity: fade }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <SafeAreaView edges={['top']} style={styles.safeTop}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.brandName}>Swad Sadan</Text>
            <TouchableOpacity 
              style={styles.locationContainer} 
              onPress={() => setShowLocationModal(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.location} numberOfLines={1}>
                📍 {activeAddress?.label || 'Set Location'} • {BRANCHES.find(b => b.id === selectedBranch)?.city || 'Set Location'}
              </Text>
              <Ionicons name="chevron-down" size={12} color="#a0aec0" style={{marginLeft: 4}} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.ratingPill}>
            <Ionicons name="star" size={14} color="#f59e0b" />
            <Text style={styles.ratingTxt}>4.9</Text>
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <View style={styles.searchWrap}>
            <Ionicons name="search" size={18} color="#a0aec0" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search your favorite food..."
              placeholderTextColor="#a0aec0"
              value={search}
              onChangeText={setSearch}
              returnKeyType="search"
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')}>
                <Ionicons name="close-circle" size={18} color="#cbd5e0" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Categories */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catRow}>
          {categories.map(cat => {
            const active = activeCat === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[styles.catPill, active && styles.catPillActive]}
                onPress={() => setCat(cat.id)}
                activeOpacity={0.7}
              >
                <Text style={[styles.catTxt, active && styles.catTxtActive]}>{cat.name}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </SafeAreaView>

      {/* Content area: Either the menu or the status overlay */}
      <View style={styles.flex}>
        {locationStatus === 'valid' ? (
          <FlatList
            data={data}
            keyExtractor={item => item._id}
            renderItem={({ item }) => <FoodCard item={item} />}
            showsVerticalScrollIndicator={false}
            initialNumToRender={6}
            maxToRenderPerBatch={10}
            windowSize={5}
            removeClippedSubviews={true}
            getItemLayout={(data, index) => (
              {length: 116, offset: 116 * index, index}
            )}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl 
                refreshing={refreshing} 
                onRefresh={onRefresh} 
                tintColor={PRIMARY} 
                colors={[PRIMARY]}
              />
            }
            ListHeaderComponent={
              !isFiltering ? (
                <View>
                  {/* Popular horizontal */}
                  <View style={styles.sectionHead}>
                    <Text style={styles.sectionTitle}>Popular Today</Text>
                    <Text style={styles.sectionCount}>{popular.length} dishes</Text>
                  </View>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.popRow}>
                    {popular.slice(0, 10).map(item => <PopularChip key={item._id} item={item} />)}
                  </ScrollView>
                  <View style={styles.sectionHead}>
                    <Text style={styles.sectionTitle}>All Dishes</Text>
                    <Text style={styles.sectionCount}>{data.length} items</Text>
                  </View>
                </View>
              ) : (
                <View style={styles.sectionHead}>
                  <Text style={styles.sectionTitle}>Results</Text>
                  <Text style={styles.sectionCount}>{data.length} found</Text>
                </View>
              )
            }
            ListEmptyComponent={
              loading ? (
                <View style={styles.emptyWrap}>
                  <ActivityIndicator size="large" color={PRIMARY} />
                  <Text style={[styles.emptyTxt, {marginTop: 10}]}>Loading fresh menu...</Text>
                </View>
              ) : (
                <View style={styles.emptyWrap}>
                  <Text style={styles.emptyIcon}>🍽️</Text>
                  <Text style={styles.emptyTxt}>No dishes found</Text>
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
      </View>

      {/* Location Picker Bottom Sheet (Simple Modal) */}
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
              {/* Primary Address */}
              <TouchableOpacity 
                style={[styles.currentLocBox, activeAddressType === 'primary' && styles.activeLocBox]}
                onPress={() => {
                  setActiveAddressType('primary');
                  setShowLocationModal(false);
                }}
              >
                <View style={[styles.locIconCirc, activeAddressType === 'primary' && {backgroundColor: PRIMARY}]}>
                  <Ionicons name="location" size={20} color={activeAddressType === 'primary' ? "#fff" : PRIMARY} />
                </View>
                <View style={{flex: 1}}>
                  <Text style={styles.locLabel}>{user?.addressLabel || 'Home'}</Text>
                  <Text style={styles.locValue} numberOfLines={2}>{user?.address || 'Set your primary address'}</Text>
                </View>
                {activeAddressType === 'primary' && <Ionicons name="checkmark-circle" size={24} color={PRIMARY} />}
              </TouchableOpacity>

              {/* Secondary Address (If it exists) */}
              {user?.secondaryAddress ? (
                <TouchableOpacity 
                  style={[styles.currentLocBox, activeAddressType === 'secondary' && styles.activeLocBox]}
                  onPress={() => {
                    setActiveAddressType('secondary');
                    setShowLocationModal(false);
                  }}
                >
                  <View style={[styles.locIconCirc, activeAddressType === 'secondary' && {backgroundColor: PRIMARY}]}>
                    <Ionicons name="location" size={20} color={activeAddressType === 'secondary' ? "#fff" : PRIMARY} />
                  </View>
                  <View style={{flex: 1}}>
                    <Text style={styles.locLabel}>{user?.secondaryAddressLabel || 'Secondary'}</Text>
                    <Text style={styles.locValue} numberOfLines={2}>{user?.secondaryAddress}</Text>
                  </View>
                  {activeAddressType === 'secondary' && <Ionicons name="checkmark-circle" size={24} color={PRIMARY} />}
                </TouchableOpacity>
              ) : (
                <TouchableOpacity 
                  style={styles.addNewBtn}
                  onPress={() => {
                    setShowLocationModal(false);
                    navigation.navigate('MapScreen', { isSecondary: true });
                  }}
                >
                  <Ionicons name="add-circle-outline" size={24} color={PRIMARY} />
                  <View style={{marginLeft: 12}}>
                    <Text style={styles.addNewTxt}>Add New Address</Text>
                  </View>
                </TouchableOpacity>
              )}
            </ScrollView>

            <TouchableOpacity 
              style={styles.modalCloseBtn}
              onPress={() => setShowLocationModal(false)}
            >
              <Text style={styles.modalCloseTxt}>Close</Text>
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#fcfcfc' },
  safeTop: { backgroundColor: '#fff' },

  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 10, paddingBottom: 15,
  },
  brandName: { fontSize: 26, fontWeight: '900', color: '#1a1a1a', letterSpacing: -0.8 },
  locationContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 1 },
  location: { fontSize: 13, color: '#a0aec0', fontWeight: '600' },
  ratingPill: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fffcf0', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12,
    borderWidth: 1, borderColor: '#fef3c7'
  },
  ratingTxt: { fontSize: 14, fontWeight: '800', color: '#f59e0b', marginLeft: 4 },

  searchContainer: { paddingHorizontal: 20, marginBottom: 15 },
  searchWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#f8fafc', borderRadius: 18,
    paddingHorizontal: 15, height: 50,
    borderWidth: 1, borderColor: '#edf2f7'
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 15, color: '#2d3748', height: '100%', fontWeight: '500' },

  catRow: { paddingHorizontal: 20, paddingBottom: 15 },
  catPill: {
    paddingHorizontal: 18, paddingVertical: 10, borderRadius: 14,
    backgroundColor: '#fff', marginRight: 10,
    borderWidth: 1, borderColor: '#edf2f7',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, elevation: 1
  },
  catPillActive: { backgroundColor: PRIMARY, borderColor: PRIMARY },
  catTxt: { fontSize: 14, fontWeight: '700', color: '#4a5568' },
  catTxtActive: { color: '#fff' },

  listContent: { paddingBottom: 100 },

  sectionHead: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 20, paddingBottom: 12,
  },
  sectionTitle: { fontSize: 20, fontWeight: '900', color: '#1a1a1a', letterSpacing: -0.5 },
  sectionCount: { fontSize: 12, color: '#a0aec0', fontWeight: '700' },

  popRow: { paddingLeft: 20, paddingRight: 10, paddingBottom: 10 },
  popChip: {
    width: 140, marginRight: 15, backgroundColor: '#fff',
    borderRadius: 20, overflow: 'hidden',
    borderWidth: 1, borderColor: '#f0f0f0',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2
  },
  popImg: { width: '100%', height: 86, resizeMode: 'cover' },
  popInfo: { padding: 10 },
  popName: { fontSize: 13, fontWeight: '800', color: '#1a1a1a', marginBottom: 2 },
  popPrice: { fontSize: 12, fontWeight: '700', color: PRIMARY },

  emptyWrap: { alignItems: 'center', paddingTop: 80 },
  emptyIcon: { fontSize: 50, marginBottom: 15 },
  emptyTxt: { fontSize: 18, fontWeight: '800', color: '#cbd5e0' },

  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  loadingOverlayTxt: { marginTop: 15, fontSize: 15, color: '#4a5568', fontWeight: '600' },

  outOfRangeOverlay: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  outOfRangeIcon: { fontSize: 80, marginBottom: 24 },
  outOfRangeTitle: { fontSize: 24, fontWeight: '900', color: '#1a1a1a', textAlign: 'center', marginBottom: 12 },
  outOfRangeSub: { fontSize: 15, color: '#718096', textAlign: 'center', lineHeight: 22, marginBottom: 32, fontWeight: '500' },
  retryBtn: { backgroundColor: PRIMARY, paddingHorizontal: 24, height: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  retryBtnTxt: { color: '#fff', fontSize: 15, fontWeight: '800' },

  pickerOverlay: {
    backgroundColor: '#fff', 
    borderBottomWidth: 1, 
    borderBottomColor: '#f0f0f0',
    paddingBottom: 10,
  },
  pickerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  pickerItemActive: {
    backgroundColor: '#fff5f5',
  },
  pickerText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4a5568',
  },
  pickerTextActive: {
    color: PRIMARY,
    fontWeight: '700',
  },

  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
    zIndex: 200,
  },
  modalSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#eee',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1a1a1a',
    marginBottom: 24,
  },
  currentLocBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#edf2f7',
    marginBottom: 12,
  },
  activeLocBox: {
    borderColor: PRIMARY,
    backgroundColor: '#fff5f5'
  },
  locIconCirc: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    elevation: 2,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5
  },
  locLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#a0aec0',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  locValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2d3748',
    lineHeight: 20,
  },
  addNewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#edf2f7',
    marginBottom: 24,
  },
  addNewTxt: {
    marginLeft: 12,
    fontSize: 15,
    fontWeight: '700',
    color: PRIMARY,
  },
  modalCloseBtn: {
    alignItems: 'center',
    padding: 12,
  },
  modalCloseTxt: {
    fontSize: 14,
    fontWeight: '700',
    color: '#a0aec0',
  },
});
