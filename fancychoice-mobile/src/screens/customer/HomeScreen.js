import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native';
import { COLORS } from '../../config/constants';
import { FONTS } from '../../config/theme';
import { Btn } from '../../components/Button';
import { subscriptionAPI, deliveryAPI } from '../../services/api';
import { useAuthStore } from '../../store/authStore';

export const HomeScreen = ({ navigation }) => {
  const { user } = useAuthStore();
  const [sub, setSub] = useState(null);
  const [today, setToday] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const [s, t] = await Promise.all([
        subscriptionAPI.active().catch(() => null),
        deliveryAPI.today().catch(() => []),
      ]);
      setSub(s);
      setToday(Array.isArray(t) ? t : t?.deliveries || []);
    } catch (e) {
      Alert.alert('Error', e.response?.data?.message || e.message);
    }
  };

  useEffect(() => { load(); }, []);
  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  return (
    <ScrollView style={styles.c} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      <Text style={styles.hi}>Hi {user?.name || 'Foodie'} 👋</Text>
      {sub ? (
        <View style={styles.card}>
          <Text style={styles.cardT}>Active plan: {sub.plan?.name || `${sub.rotisPerDay} rotis/day`}</Text>
          <Text>Status: {sub.status} | Slots: {(sub.deliverySlots || []).join(', ')}</Text>
          <Text>Ends: {sub.endDate ? new Date(sub.endDate).toDateString() : '-'}</Text>
          <Btn title="Manage subscription" onPress={() => navigation.navigate('Subscription')} />
        </View>
      ) : (
        <View style={styles.card}>
          <Text style={styles.cardT}>No active subscription</Text>
          <Text style={{ color: COLORS.muted }}>Pick a roti plan to start daily delivery.</Text>
          <Btn title="Browse plans" onPress={() => navigation.navigate('Plans')} />
        </View>
      )}

      <Text style={styles.sec}>Today's deliveries ({today.length})</Text>
      {today.map((d) => (
        <View key={d._id} style={styles.card}>
          <Text style={styles.cardT}>{d.slot} • {d.rotisCount} rotis • {d.status}</Text>
          <Text style={{ color: COLORS.muted }}>{new Date(d.scheduledDate).toDateString()}</Text>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: COLORS.bg, padding: 16 },
  hi: { fontFamily: FONTS.bold, fontSize: 22, marginVertical: 8 },
  sec: { fontSize: 18, fontFamily: FONTS.semiBold, marginVertical: 10 },
  card: { backgroundColor: COLORS.card, borderRadius: 14, padding: 14, marginVertical: 6, borderWidth: 1, borderColor: COLORS.border },
  cardT: { fontFamily: FONTS.semiBold, fontSize: 16, marginBottom: 4 },
});
