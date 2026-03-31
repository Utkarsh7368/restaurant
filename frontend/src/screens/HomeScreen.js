import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TextInput, TouchableOpacity, ScrollView, StatusBar, Animated, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CATEGORIES } from '../data/menuData';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { API_URL } from '../context/AuthContext';
import axios from 'axios';
import FoodCard from '../components/FoodCard';
import { Ionicons } from '@expo/vector-icons';
import { useBranch } from '../context/BranchContext';

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
  const { selectedBranch, changeBranch, BRANCHES } = useBranch();
  const [MENU_ITEMS, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCat, setCat] = useState('all');
  const [showPicker, setShowPicker] = useState(false);
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
              onPress={() => setShowPicker(!showPicker)}
              activeOpacity={0.7}
            >
              <Text style={styles.location}>
                📍 {BRANCHES.find(b => b.id === selectedBranch)?.city} • Tap to change
              </Text>
              <Ionicons name="chevron-down" size={12} color="#a0aec0" style={{marginLeft: 4}} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.ratingPill}>
            <Ionicons name="star" size={14} color="#f59e0b" />
            <Text style={styles.ratingTxt}>5.0</Text>
          </TouchableOpacity>
        </View>

        {/* Branch Picker Dropdown (Simple) */}
        {showPicker && (
          <View style={styles.pickerOverlay}>
            {BRANCHES.map(b => (
              <TouchableOpacity
                key={b.id}
                style={[styles.pickerItem, selectedBranch === b.id && styles.pickerItemActive]}
                onPress={() => {
                  changeBranch(b.id);
                  setShowPicker(false);
                }}
              >
                <Text style={[styles.pickerText, selectedBranch === b.id && styles.pickerTextActive]}>
                  {b.name}
                </Text>
                {selectedBranch === b.id && <Ionicons name="checkmark-circle" size={18} color={PRIMARY} />}
              </TouchableOpacity>
            ))}
          </View>
        )}

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
          {CATEGORIES.map(cat => {
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

      {/* Content */}
      <FlatList
        data={data}
        keyExtractor={item => item._id}
        renderItem={({ item }) => <FoodCard item={item} />}
        showsVerticalScrollIndicator={false}
        initialNumToRender={5}
        maxToRenderPerBatch={5}
        windowSize={3}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          !isFiltering ? (
            <View>
              {/* Popular horizontal */}
              <View style={styles.sectionHead}>
                <Text style={styles.sectionTitle}>Popular</Text>
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
});
