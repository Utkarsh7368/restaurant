import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  StatusBar, KeyboardAvoidingView, Platform, Animated, ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';

const PRIMARY = '#e23744';

export default function CompleteProfileScreen({ route, navigation }) {
  const { user, updateProfile, addAddress } = useAuth();
  
  // Passed from MapScreen (if present)
  const mapAddress = route.params?.address || '';
  const lat = route.params?.lat || null;
  const lng = route.params?.lng || null;
  const isSecondary = route.params?.isSecondary || false;
  
  const [phone, setPhone] = useState(user?.phone || '');
  const [altPhone, setAltPhone] = useState('');
  
  const [address, setAddress] = useState(mapAddress);
  const [landmark, setLandmark] = useState('');
  const [houseNo, setHouseNo] = useState('');
  const [label, setLabel] = useState('Home'); // Default label

  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const fade = useRef(new Animated.Value(0)).current;

  // Auto-fill effect when route params arrive (if user went back to map)
  useEffect(() => {
    if (mapAddress) setAddress(mapAddress);
  }, [mapAddress]);

  useEffect(() => {
    Animated.timing(fade, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, []);

  const validate = () => {
    if (!phone.trim()) return 'Mobile number is required';
    if (!/^\d{10}$/.test(phone.trim())) return 'Phone number must be exactly 10 digits';
    if (!houseNo.trim()) return 'House / Flat No. is required';
    if (!landmark.trim()) return 'Landmark is required';
    if (!address.trim()) return 'Address details are required';
    return null;
  };

  const handleSave = async () => {
    const err = validate();
    if (err) { setError(err); return; }
    setError('');
    setBusy(true);
    
    try {
      // Build profile data payload
      const payload = {
        phone,
        alternatePhone: altPhone,
        address,
        landmark,
        lat,
        lng,
        houseNo,
        isSecondary // Backend uses this to determine which fields to fill
      };

      await updateProfile(payload);
      navigation.navigate('MainTabs');
    } catch (e) {
      setError(e.message);
    }
    setBusy(false);
  };

  const isValid = phone.trim().length === 10 && houseNo.trim() && landmark.trim() && address.trim();

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#f7f7f7" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <Animated.View style={[styles.container, { opacity: fade }]}>
          
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Text style={styles.backTxt}>‹</Text>
            </TouchableOpacity>
            <View>
              <Text style={styles.title}>Address Details</Text>
              <Text style={styles.subtitle}>Step 2 • Confirm your delivery info</Text>
            </View>
          </View>

          <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
            {/* Read-only name purely for UX context */}
            <View style={styles.inputWrap}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput style={[styles.input, styles.readOnly]} value={user?.name || ''} editable={false} />
            </View>

            {/* Address Label Display */}
            <View style={styles.inputWrap}>
              <Text style={styles.label}>Saving As</Text>
              <View style={[styles.labelPill, styles.labelPillActive]}>
                <Text style={styles.labelPillTxtActive}>
                  {isSecondary ? 'Secondary Address' : 'Home (Primary)'}
                </Text>
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.inputWrap, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.label}>Phone Number *</Text>
                <TextInput
                  style={styles.input} placeholder="10 Digits" placeholderTextColor="#ccc"
                  value={phone} onChangeText={t => { setPhone(t); setError(''); }}
                  keyboardType="numeric" maxLength={10}
                />
              </View>
              <View style={[styles.inputWrap, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.label}>Alternate Phone</Text>
                <TextInput
                  style={styles.input} placeholder="Optional" placeholderTextColor="#ccc"
                  value={altPhone} onChangeText={setAltPhone}
                  keyboardType="numeric" maxLength={10}
                />
              </View>
            </View>

            <View style={styles.inputWrap}>
              <Text style={styles.label}>House / Flat / Floor No. *</Text>
              <TextInput
                style={styles.input} placeholder="E.g. Flat 402, Block A" placeholderTextColor="#ccc"
                value={houseNo} onChangeText={t => { setHouseNo(t); setError(''); }}
              />
            </View>

            <View style={styles.inputWrap}>
              <Text style={styles.label}>Nearby Landmark *</Text>
              <TextInput
                style={styles.input} placeholder="E.g. Near XYZ Park or Temple" placeholderTextColor="#ccc"
                value={landmark} onChangeText={t => { setLandmark(t); setError(''); }}
              />
            </View>

            <View style={styles.inputWrap}>
              <Text style={styles.label}>Area / Sector / Locality *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Google pulled area..."
                placeholderTextColor="#ccc"
                value={address} onChangeText={t => { setAddress(t); setError(''); }}
                multiline numberOfLines={3} textAlignVertical="top"
              />
            </View>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <TouchableOpacity
              style={[styles.btn, (!isValid || busy) && styles.btnDisabled]}
              onPress={handleSave}
              activeOpacity={0.85}
              disabled={!isValid || busy}
            >
              <Text style={styles.btnTxt}>{busy ? 'Saving...' : 'Save & Enter App'}</Text>
            </TouchableOpacity>
            
            <View style={{height: 40}} /> 
          </ScrollView>

        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  flex: { flex: 1 },
  container: { flex: 1, paddingTop: 12 },

  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginBottom: 24 },
  backBtn: { marginRight: 16, width: 32 },
  backTxt: { fontSize: 34, fontWeight: '300', color: '#1c1c1c', lineHeight: 36, marginTop: -4 },
  title: { fontSize: 24, fontWeight: '800', color: '#1c1c1c' },
  subtitle: { fontSize: 13, color: '#PRIMARY', fontWeight: '600', color: PRIMARY },

  form: { paddingHorizontal: 24 },
  row: { flexDirection: 'row' },
  
  inputWrap: { marginBottom: 18 },
  label: { fontSize: 12, fontWeight: '700', color: '#6b6b6b', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: {
    backgroundColor: '#f7f7f7', borderRadius: 12, paddingHorizontal: 16,
    height: 52, fontSize: 15, color: '#1c1c1c', fontWeight: '500'
  },
  readOnly: { backgroundColor: '#f0f0f0', color: '#999' },
  textArea: { height: 80, paddingTop: 14 },

  error: { color: PRIMARY, fontSize: 13, marginBottom: 16, textAlign: 'center', fontWeight: '600' },

  btn: {
    backgroundColor: PRIMARY, borderRadius: 16, height: 54,
    alignItems: 'center', justifyContent: 'center', marginTop: 12,
  },
  btnDisabled: { opacity: 0.5 },
  btnTxt: { color: '#fff', fontSize: 16, fontWeight: '800' },

  labelRow: { flexDirection: 'row', marginTop: 4 },
  labelPill: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12,
    borderWidth: 1, borderColor: '#eee', marginRight: 10, backgroundColor: '#fff'
  },
  labelPillActive: { backgroundColor: PRIMARY, borderColor: PRIMARY },
  labelPillTxt: { fontSize: 13, fontWeight: '700', color: '#6b6b6b' },
  labelPillTxtActive: { color: '#fff' },
});
