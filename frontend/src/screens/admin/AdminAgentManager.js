import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, 
  ActivityIndicator, StatusBar, Alert, Modal, TextInput, ScrollView,
  KeyboardAvoidingView, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useAuth, API_URL } from '../../context/AuthContext';

const PRIMARY = '#e23744';

export default function AdminAgentManager() {
  const { user, token } = useAuth();
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('agent123');
  const [newAgentCreds, setNewAgentCreds] = useState(null);

  const fetchAgents = async () => {
    try {
      const res = await axios.get(`${API_URL}/admin/agents`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAgents(res.data);
    } catch (err) {
      console.warn(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  const handleCreate = async () => {
    if (!name || !phone) {
      Alert.alert('Error', 'Name and Phone are required');
      return;
    }
    setIsSaving(true);
    try {
      const res = await axios.post(`${API_URL}/admin/agents`, {
        name, phone, password
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setNewAgentCreds({
        id: res.data.agentId,
        pass: res.data.password,
        name: name
      });
      
      // Reset form
      setName('');
      setPhone('');
      fetchAgents();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.msg || 'Failed to create agent');
    } finally {
      setIsSaving(false);
    }
  };

  const renderAgent = ({ item }) => (
    <View style={styles.agentCard}>
      <View style={styles.agentIcon}>
        <Ionicons name="bicycle" size={24} color={PRIMARY} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.agentName}>{item.name}</Text>
        <Text style={styles.agentId}>ID: {item.agentId}</Text>
        <Text style={styles.agentPhone}>📞 {item.phone}</Text>
      </View>
      <View style={styles.branchBadge}>
        <Text style={styles.branchTxt}>{item.branch}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Delivery Agents</Text>
          <Text style={styles.headerSub}>Manage partners for {user?.branch}</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => {setNewAgentCreds(null); setModalVisible(true)}}>
          <Ionicons name="person-add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={PRIMARY} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={agents}
          keyExtractor={item => item._id}
          renderItem={renderAgent}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="people-outline" size={60} color="#ddd" />
              <Text style={styles.emptyTxt}>No agents in this branch yet</Text>
            </View>
          }
        />
      )}

      {/* Creation Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Agent</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={28} color="#666" />
              </TouchableOpacity>
            </View>

            {newAgentCreds ? (
              <View style={styles.successBox}>
                <View style={styles.successIcon}>
                  <Ionicons name="checkmark-circle" size={50} color="#10b981" />
                </View>
                <Text style={styles.successTitle}>Agent Created!</Text>
                <Text style={styles.successDesc}>Please share these credentials with {newAgentCreds.name}:</Text>
                
                <View style={styles.credsBox}>
                  <View style={styles.credRow}>
                    <Text style={styles.credLabel}>Agent ID:</Text>
                    <Text style={styles.credVal}>{newAgentCreds.id}</Text>
                  </View>
                  <View style={styles.credRow}>
                    <Text style={styles.credLabel}>Password:</Text>
                    <Text style={styles.credVal}>{newAgentCreds.pass}</Text>
                  </View>
                </View>

                <TouchableOpacity style={styles.doneBtn} onPress={() => setModalVisible(false)}>
                  <Text style={styles.doneBtnTxt}>Done</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <ScrollView style={styles.form}>
                <Text style={styles.inputLabel}>Full Name</Text>
                <TextInput style={styles.input} placeholder="e.g. Rahul Kumar" value={name} onChangeText={setName} />

                <Text style={styles.inputLabel}>Phone Number</Text>
                <TextInput style={styles.input} placeholder="10-digit number" keyboardType="numeric" value={phone} onChangeText={setPhone} maxLength={10} />

                <Text style={styles.inputLabel}>Initial Password</Text>
                <TextInput style={styles.input} placeholder="Default: agent123" value={password} onChangeText={setPassword} />

                <TouchableOpacity 
                  style={[styles.createBtn, isSaving && {opacity: 0.7}]} 
                  onPress={handleCreate}
                  disabled={isSaving}
                >
                  {isSaving ? <ActivityIndicator color="#fff" /> : <Text style={styles.createBtnTxt}>Generate Credentials</Text>}
                </TouchableOpacity>
              </ScrollView>
            )}
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fcfcfc' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  headerTitle: { fontSize: 24, fontWeight: '900', color: '#1a1a1a' },
  headerSub: { fontSize: 13, color: '#a0aec0', fontWeight: '600' },
  addBtn: { backgroundColor: PRIMARY, width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center', elevation: 4 },

  list: { padding: 20 },
  agentCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 20, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#f0f0f0', elevation: 1 },
  agentIcon: { width: 50, height: 50, borderRadius: 15, backgroundColor: '#fdf2f2', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  agentName: { fontSize: 16, fontWeight: '800', color: '#1a1a1a' },
  agentId: { fontSize: 12, fontWeight: '700', color: PRIMARY, marginTop: 2 },
  agentPhone: { fontSize: 12, color: '#718096', marginTop: 2 },
  branchBadge: { backgroundColor: '#f0fdf4', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  branchTxt: { fontSize: 10, fontWeight: '800', color: '#10b981', textTransform: 'uppercase' },

  empty: { marginTop: 100, alignItems: 'center' },
  emptyTxt: { marginTop: 10, color: '#cbd5e0', fontWeight: '600' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 24, height: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '900', color: '#1a1a1a' },

  form: { flex: 1 },
  inputLabel: { fontSize: 12, fontWeight: '800', color: '#a0aec0', textTransform: 'uppercase', marginBottom: 8, marginTop: 16 },
  input: { backgroundColor: '#f8fafc', borderRadius: 14, padding: 16, fontSize: 16, color: '#1a1a1a', borderWidth: 1, borderColor: '#edf2f7' },
  createBtn: { backgroundColor: PRIMARY, borderRadius: 16, paddingVertical: 18, alignItems: 'center', marginTop: 30 },
  createBtnTxt: { color: '#fff', fontSize: 16, fontWeight: '800' },

  successBox: { alignItems: 'center', paddingVertical: 20 },
  successIcon: { marginBottom: 16 },
  successTitle: { fontSize: 22, fontWeight: '900', color: '#1a1a1a', marginBottom: 8 },
  successDesc: { fontSize: 14, color: '#718096', textAlign: 'center', marginBottom: 24 },
  credsBox: { width: '100%', backgroundColor: '#f8fafc', borderRadius: 20, padding: 20, borderStyle: 'dashed', borderWidth: 1.5, borderColor: '#e2e8f0' },
  credRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  credLabel: { fontWeight: '700', color: '#4a5568' },
  credVal: { fontWeight: '900', color: PRIMARY, fontSize: 16 },
  doneBtn: { width: '100%', backgroundColor: '#1a1a1a', borderRadius: 16, paddingVertical: 18, alignItems: 'center', marginTop: 30 },
  doneBtnTxt: { color: '#fff', fontSize: 16, fontWeight: '800' }
});
