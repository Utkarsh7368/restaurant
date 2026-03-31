import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const PRIMARY = '#e23744';

export default function MyAddressesScreen() {
  const { user } = useAuth();
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <SafeAreaView edges={['top']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#1a1a1a" />
        </TouchableOpacity>
        <View>
          <Text style={styles.title}>My Addresses</Text>
          <Text style={styles.subtitle}>Saved delivery spots</Text>
        </View>
      </SafeAreaView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.addressList}>
          {/* Primary Address */}
          <View style={styles.addressCard}>
            <View style={styles.addrIconBox}>
              <Ionicons name="home-outline" size={20} color={PRIMARY} />
            </View>
            <View style={{flex: 1}}>
              <Text style={styles.addrLabel}>{user?.addressLabel || 'Home'}</Text>
              <Text style={styles.addrText} numberOfLines={2}>{user?.address || 'Set your primary address'}</Text>
              {(user?.houseNo || user?.landmark) && (
                <Text style={styles.addrDetailTxt}>
                  {user?.houseNo ? `${user.houseNo}, ` : ''}{user?.landmark}
                </Text>
              )}
            </View>
            <TouchableOpacity 
              style={styles.addrEditBtn} 
              onPress={() => navigation.navigate('MapScreen', { isSecondary: false })}
            >
              <Text style={styles.addrEditTxt}>Edit</Text>
            </TouchableOpacity>
          </View>

          {/* Secondary Address (If it exists) */}
          {user?.secondaryAddress ? (
            <View style={styles.addressCard}>
              <View style={[styles.addrIconBox, {backgroundColor: '#f0fdf4'}]}>
                <Ionicons name="briefcase-outline" size={20} color="#10b981" />
              </View>
              <View style={{flex: 1}}>
                <Text style={styles.addrLabel}>{user?.secondaryAddressLabel || 'Work'}</Text>
                <Text style={styles.addrText} numberOfLines={2}>{user?.secondaryAddress}</Text>
                {(user?.secondaryHouseNo || user?.secondaryLandmark) && (
                  <Text style={styles.addrDetailTxt}>
                    {user?.secondaryHouseNo ? `${user.secondaryHouseNo}, ` : ''}{user?.secondaryLandmark}
                  </Text>
                )}
              </View>
              <TouchableOpacity 
                style={styles.addrEditBtn} 
                onPress={() => navigation.navigate('MapScreen', { isSecondary: true })}
              >
                <Text style={styles.addrEditTxt}>Edit</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTxt}>You haven't added a secondary address yet.</Text>
            </View>
          )}
        </View>

        {/* Global Add New Address Button (Always at bottom) */}
        {!user?.secondaryAddress && (
          <TouchableOpacity 
            style={styles.addNewCard} 
            onPress={() => navigation.navigate('MapScreen', { isSecondary: true })}
          >
            <View style={styles.addIconCirc}>
              <Ionicons name="add" size={24} color="#fff" />
            </View>
            <View>
              <Text style={styles.addNewTitle}>Add New Address</Text>
              <Text style={styles.addNewSub}>Save another spot for delivery</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#cbd5e0" style={{marginLeft: 'auto'}} />
          </TouchableOpacity>
        )}

        {/* If secondary exists, we still show the option to update or add others if model expanded */}
         {user?.secondaryAddress && (
           <Text style={styles.limitTxt}>You can save up to 2 delivery addresses.</Text>
         )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fcfcfc' },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingTop: 15, 
    paddingBottom: 20, 
    backgroundColor: '#fff', 
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  backBtn: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', marginRight: 12 },
  title: { fontSize: 22, fontWeight: '900', color: '#1a1a1a', letterSpacing: -0.5 },
  subtitle: { fontSize: 13, color: '#a0aec0', fontWeight: '600', marginTop: 1 },
  
  scroll: { paddingBottom: 40, paddingTop: 20 },

  addressList: { marginHorizontal: 20, marginBottom: 20 },
  addressCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#fff', 
    padding: 16, 
    borderRadius: 24, 
    borderWidth: 1, 
    borderColor: '#f0f0f0',
    marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 10, elevation: 2
  },
  addrIconBox: { width: 48, height: 48, borderRadius: 14, backgroundColor: '#fdf2f2', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  addrLabel: { fontSize: 15, fontWeight: '900', color: '#1a1a1a', marginBottom: 2 },
  addrText: { fontSize: 13, color: '#718096', fontWeight: '500', lineHeight: 18 },
  addrDetailTxt: { fontSize: 11, color: '#a0aec0', fontWeight: '600', marginTop: 4 },
  addrEditBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10, backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0' },
  addrEditTxt: { fontSize: 12, fontWeight: '800', color: PRIMARY },
  
  emptyCard: { backgroundColor: '#f8fafc', padding: 20, borderRadius: 24, alignItems: 'center', borderStyle: 'dashed', borderWidth: 1.5, borderColor: '#e2e8f0', marginBottom: 20 },
  emptyTxt: { fontSize: 13, color: '#a0aec0', fontWeight: '600', textAlign: 'center' },

  addNewCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginHorizontal: 20,
    backgroundColor: '#fff', 
    padding: 20, 
    borderRadius: 24, 
    borderWidth: 1, 
    borderColor: PRIMARY, 
    borderStyle: 'dashed'
  },
  addIconCirc: { width: 40, height: 40, borderRadius: 20, backgroundColor: PRIMARY, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  addNewTitle: { fontSize: 16, fontWeight: '900', color: '#1a1a1a' },
  addNewSub: { fontSize: 12, color: '#a0aec0', fontWeight: '600' },

  limitTxt: { fontSize: 12, color: '#cbd5e0', textAlign: 'center', fontWeight: '600', marginTop: 20 },
});
