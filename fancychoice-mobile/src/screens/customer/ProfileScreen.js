import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { COLORS } from '../../config/constants';
import { FONTS } from '../../config/theme';
import { Btn } from '../../components/Button';
import { Field } from '../../components/Field';
import { userAPI, paymentAPI } from '../../services/api';
import { useAuthStore } from '../../store/authStore';

export const ProfileScreen = () => {
  const { user, logout } = useAuthStore();
  const [payments, setPayments] = useState([]);
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');

  useEffect(() => {
    paymentAPI.mine().then((d) => setPayments(Array.isArray(d) ? d : d?.payments || d?.docs || [])).catch(() => {});
  }, []);

  const addAddress = async () => {
    try {
      await userAPI.addAddress({ label: 'Home', street, city, state: 'Maharashtra', pincode: '411001' });
      Alert.alert('Added', 'Address saved');
      setStreet(''); setCity('');
    } catch (e) {
      Alert.alert('Failed', e.response?.data?.message || e.message);
    }
  };

  return (
    <ScrollView style={styles.c}>
      <Text style={styles.t}>Profile</Text>
      <View style={styles.card}>
        <Text style={styles.cardT}>{user?.name}</Text>
        <Text>{user?.phone} {user?.email ? `• ${user.email}` : ''}</Text>
        <Text style={{ color: COLORS.muted }}>{user?.role}</Text>
      </View>

      <Text style={styles.sec}>Add address</Text>
      <Field label="Street" value={street} onChangeText={setStreet} />
      <Field label="City" value={city} onChangeText={setCity} />
      <Btn title="Save address" onPress={addAddress} />

      <Text style={styles.sec}>Payments ({payments.length})</Text>
      {payments.map((p) => (
        <View key={p._id} style={styles.card}>
          <Text style={styles.cardT}>₹{p.amount} • {p.status}</Text>
          <Text style={{ color: COLORS.muted }}>{new Date(p.createdAt).toLocaleString()}</Text>
        </View>
      ))}

      <Btn title="Logout" danger onPress={logout} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: COLORS.bg, padding: 16 },
  t: { fontFamily: FONTS.bold, fontSize: 22, color: COLORS.text, marginVertical: 8 },
  sec: { fontSize: 17, fontFamily: FONTS.semiBold, marginTop: 12 },
  card: { backgroundColor: COLORS.card, borderRadius: 14, padding: 14, marginVertical: 6, borderWidth: 1, borderColor: COLORS.border },
  cardT: { fontFamily: FONTS.semiBold, fontSize: 16 },
});
