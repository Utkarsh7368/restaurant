import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Platform, TextInput, FlatList } from 'react-native';
import MapView from 'react-native-maps';
import * as Location from 'expo-location';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';

const PRIMARY = '#e23744';

export default function MapScreen() {
  const { skipOnboarding } = useAuth();
  const navigation = useNavigation();
  const [region, setRegion] = useState({
    latitude: 28.6139,
    longitude: 77.2090, 
    latitudeDelta: 0.005,
    longitudeDelta: 0.005,
  });
  
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Search logic using Nominatim OpenStreetMap (Free, NO API Key)
  useEffect(() => {
    if (searchQuery.trim().length > 2) {
      const delay = setTimeout(async () => {
        try {
          // Indian country code by default
          const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=jsonv2&limit=5&countrycodes=in`, {
            headers: { 'User-Agent': 'SwadSadanApp/1.0' }
          });
          const data = await res.json();
          setSuggestions(data);
        } catch(e) {}
      }, 600);
      return () => clearTimeout(delay);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchQuery]);

  const handleSelectPlace = (place) => {
    setSearchQuery(place.display_name.split(',')[0]); // Only show the tightest area name locally
    setShowSuggestions(false);
    setRegion(prev => ({
      ...prev,
      latitude: parseFloat(place.lat),
      longitude: parseFloat(place.lon)
    }));
  };

  // Request permissions and zoom to current location instantly
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        try {
          let loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          setRegion(prev => ({ 
            ...prev, 
            latitude: loc.coords.latitude, 
            longitude: loc.coords.longitude 
          }));
        } catch(e) {}
      }
      setLocating(false);
    })();
  }, []);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const [addressObj] = await Location.reverseGeocodeAsync({
        latitude: region.latitude,
        longitude: region.longitude
      });
      
      let formatted = '';
      if (addressObj) {
        const parts = [
          addressObj.name, 
          addressObj.street, 
          addressObj.subregion, 
          addressObj.city, 
          addressObj.region, 
          addressObj.postalCode
        ].filter(Boolean);
        // Map unique array chunks to comma string
        formatted = [...new Set(parts)].join(', ');
      }
      
      setLoading(false);
      // Navigate to Step 2
      navigation.navigate('CompleteProfile', { 
        lat: region.latitude, 
        lng: region.longitude, 
        address: formatted 
      });
    } catch (e) {
      setLoading(false);
      // Fallback if geocoding fails
      navigation.navigate('CompleteProfile', { 
        lat: region.latitude, 
        lng: region.longitude, 
        address: '' 
      });
    }
  };

  return (
    <View style={styles.container}>
      <MapView 
        style={styles.map}
        region={region}
        onRegionChangeComplete={(newRegion) => setRegion(newRegion)}
        showsUserLocation={true}
      />
      
      {/* Floating Center Pin */}
      <View style={styles.markerFixed}>
        <View style={styles.pinBubble}>
          <Text style={styles.pinIcon}>📍</Text>
        </View>
        <View style={styles.pinStem} />
        <View style={styles.pinDot} />
      </View>

      {/* Top Banner & Custom Autocomplete Search */}
      <View style={styles.topCard}>
        <SafeAreaView edges={['top']}>
          <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12}}>
            <Text style={styles.topTitle}>Delivery Location</Text>
            <TouchableOpacity onPress={skipOnboarding}>
              <Text style={{color: PRIMARY, fontWeight: '700', fontSize: 13}}>Skip for now</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.searchBox}>
            <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
            <TextInput 
              style={styles.searchInput}
              placeholder="Search area or landmark..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={(t) => {
                setSearchQuery(t);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => {setSearchQuery(''); setSuggestions([])}} style={styles.clearIcon}>
                 <Ionicons name="close-circle" size={20} color="#999" />
              </TouchableOpacity>
            )}
          </View>
        </SafeAreaView>
      </View>

      {/* Floating Suggestions List */}
      {showSuggestions && suggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
           <FlatList 
             data={suggestions}
             keyExtractor={(item) => item.place_id.toString()}
             keyboardShouldPersistTaps="handled"
             renderItem={({item}) => (
               <TouchableOpacity style={styles.suggestionItem} onPress={() => handleSelectPlace(item)}>
                  <Ionicons name="location-outline" size={20} color="#666" style={{marginRight: 10}} />
                  <Text style={styles.suggestionText} numberOfLines={2}>{item.display_name}</Text>
               </TouchableOpacity>
             )}
           />
        </View>
      )}

      {/* Bottom Banner */}
      <View style={styles.bottomCard}>
        <View style={styles.infoRow}>
          {locating && <ActivityIndicator size="small" color={PRIMARY} style={{marginRight: 8}}/>}
          <Text style={styles.infoTxt}>
            {locating ? 'Locating you...' : 'Move the map to adjust the pin'}
          </Text>
        </View>
        <SafeAreaView edges={['bottom']}>
          <TouchableOpacity 
            style={[styles.btn, loading && styles.disabled]} 
            activeOpacity={0.8}
            onPress={handleConfirm}
            disabled={loading || locating}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Confirm Location</Text>}
          </TouchableOpacity>
        </SafeAreaView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  map: { flex: 1 },
  
  markerFixed: {
    position: 'absolute', left: '50%', top: '50%',
    marginLeft: -24, marginTop: -48,
    alignItems: 'center', width: 48
  },
  pinBubble: { backgroundColor: PRIMARY, width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', elevation: 5, shadowColor: '#000', shadowOffset: {width:0, height:2}, shadowOpacity: 0.25, shadowRadius: 3.84 },
  pinIcon: { fontSize: 20, color: '#fff', textAlign: 'center' },
  pinStem: { width: 3, height: 12, backgroundColor: PRIMARY },
  pinDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#000', opacity: 0.2, marginTop: -4 },

  topCard: {
    position: 'absolute', top: 0, width: '100%',
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 20, paddingBottom: 16, paddingTop: 10,
    borderBottomLeftRadius: 24, borderBottomRightRadius: 24,
    shadowColor: '#000', shadowOffset: { width:0, height:4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5
  },
  topTitle: { fontSize: 18, fontWeight: '800', color: '#1c1c1c', marginBottom: 12 },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f0f0f0', borderRadius: 12, height: 48, paddingHorizontal: 12 },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 15, color: '#1c1c1c', height: '100%', paddingVertical: 0 },
  clearIcon: { padding: 4 },

  suggestionsContainer: {
    position: 'absolute', top: 130, left: 20, right: 20,
    backgroundColor: '#fff', borderRadius: 12,
    maxHeight: 220,
    shadowColor: '#000', shadowOffset: { width:0, height:4 }, shadowOpacity: 0.15, shadowRadius: 10, elevation: 6
  },
  suggestionItem: { flexDirection: 'row', alignItems: 'center', padding: 14, borderBottomWidth: 0.5, borderBottomColor: '#eee' },
  suggestionText: { flex: 1, fontSize: 13, color: '#333' },

  bottomCard: {
    position: 'absolute', bottom: 0, width: '100%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: 20, paddingTop: 16, paddingBottom:Platform.OS === 'ios' ? 0 : 16,
    shadowColor: '#000', shadowOffset: { width:0, height:-4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 10
  },
  infoRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  infoTxt: { fontSize: 13, fontWeight: '600', color: '#6b6b6b' },
  
  btn: { backgroundColor: PRIMARY, borderRadius: 16, height: 54, alignItems: 'center', justifyContent: 'center' },
  disabled: { opacity: 0.7 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' }
});
