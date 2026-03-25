import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TextInput,
  TouchableOpacity, ScrollView, StatusBar, Animated, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CATEGORIES } from '../data/menuData';
import { useFocusEffect } from '@react-navigation/native';
import { API_URL } from '../context/AuthContext';
import axios from 'axios';
import FoodCard from '../components/FoodCard';

const PRIMARY = '#e23744';

// ─── Popular chip (horizontal scroll) ──────────────────────────
function PopularChip({ item }) {
  return (
    <View style={styles.popChip}>
      <Image source={{ uri: item.image }} style={styles.popImg} />
      <Text style={styles.popName} numberOfLines={1}>{item.name}</Text>
      <Text style={styles.popPrice}>₹{item.price}</Text>
    </View>
  );
}

// ─── Main HomeScreen ───────────────────────────────────────────
export default function HomeScreen() {
  const [MENU_ITEMS, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCat, setCat] = useState('all');
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
            <Text style={styles.location}>📍 Auraiya, Uttar Pradesh</Text>
          </View>
          <View style={styles.ratingPill}>
            <Text style={styles.ratingTxt}>⭐ 5.0</Text>
          </View>
        </View>

        {/* Search */}
        <View style={styles.searchWrap}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search dishes"
            placeholderTextColor="#bbb"
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Text style={styles.clearBtn}>✕</Text>
            </TouchableOpacity>
          )}
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
  flex: { flex: 1, backgroundColor: '#fff' },
  safeTop: { backgroundColor: '#fff' },

  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12,
  },
  brandName: { fontSize: 22, fontWeight: '800', color: '#1c1c1c', letterSpacing: -0.3 },
  location: { fontSize: 12, color: '#6b6b6b', marginTop: 2 },
  ratingPill: {
    backgroundColor: '#f0faf0', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8,
  },
  ratingTxt: { fontSize: 13, fontWeight: '700', color: '#27ae60' },

  searchWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#f7f7f7', borderRadius: 14,
    marginHorizontal: 16, paddingHorizontal: 14, height: 44, marginBottom: 12,
  },
  searchIcon: { fontSize: 15, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14, color: '#1c1c1c', height: '100%' },
  clearBtn: { fontSize: 14, color: '#aaa', paddingHorizontal: 4 },

  catRow: { paddingHorizontal: 16, paddingBottom: 8 },
  catPill: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
    backgroundColor: '#f7f7f7', marginRight: 8,
  },
  catPillActive: { backgroundColor: '#fce8ea' },
  catTxt: { fontSize: 13, fontWeight: '600', color: '#6b6b6b' },
  catTxtActive: { color: PRIMARY, fontWeight: '700' },

  listContent: { paddingBottom: 90 },

  sectionHead: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingTop: 16, paddingBottom: 10,
  },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#1c1c1c' },
  sectionCount: { fontSize: 12, color: '#aaa' },

  popRow: { paddingLeft: 16, paddingRight: 8, paddingBottom: 8 },
  popChip: {
    width: 120, marginRight: 12, backgroundColor: '#f7f7f7',
    borderRadius: 14, overflow: 'hidden',
  },
  popImg: { width: '100%', height: 80, resizeMode: 'cover' },
  popName: { fontSize: 12, fontWeight: '700', color: '#1c1c1c', paddingHorizontal: 8, paddingTop: 6 },
  popPrice: { fontSize: 12, fontWeight: '600', color: '#6b6b6b', paddingHorizontal: 8, paddingBottom: 8 },

  emptyWrap: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 40, marginBottom: 10 },
  emptyTxt: { fontSize: 16, fontWeight: '600', color: '#aaa' },
});
