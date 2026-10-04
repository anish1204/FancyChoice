import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native';
import { COLORS } from '../../config/constants';
import { FONTS } from '../../config/theme';
import { adminAPI } from '../../services/api';

// Admin: business overview — users, subs, today's deliveries, revenue, status split.
export const DashboardScreen = () => {
  const [stats, setStats] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      setStats(await adminAPI.dashboard());
    } catch (e) {
      Alert.alert('Error', e.response?.data?.message || e.message);
    }
  };
  useEffect(() => { load(); }, []);

  const Tile = ({ label, value }) => (
    <View style={styles.tile}>
      <Text style={styles.tileV}>{value ?? '—'}</Text>
      <Text style={styles.tileL}>{label}</Text>
    </View>
  );

  return (
    <ScrollView
      style={styles.c}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }} />}
    >
      <Text style={styles.t}>Dashboard</Text>
      <View style={styles.grid}>
        <Tile label="Users" value={stats?.users} />
        <Tile label="Active subs" value={stats?.activeSubscriptions} />
        <Tile label="Today's deliveries" value={stats?.todayDeliveries} />
        <Tile label="Revenue (₹)" value={stats?.totalRevenue} />
      </View>
      <Text style={styles.sec}>Deliveries by status</Text>
      {(stats?.deliveryStats || []).map((s) => (
        <View key={s._id || 'none'} style={styles.card}>
          <Text style={styles.cardT}>{s._id || 'unknown'}: {s.count}</Text>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: COLORS.bg, padding: 16 },
  t: { fontFamily: FONTS.bold, fontSize: 22, color: COLORS.text, marginVertical: 8 },
  sec: { fontSize: 17, fontFamily: FONTS.semiBold, marginTop: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tile: { backgroundColor: COLORS.card, borderRadius: 14, padding: 14, minWidth: '47%', flexGrow: 1, borderWidth: 1, borderColor: COLORS.border, marginBottom: 8 },
  tileV: { fontSize: 22, fontFamily: FONTS.bold, color: COLORS.primary },
  tileL: { color: COLORS.muted },
  card: { backgroundColor: COLORS.card, borderRadius: 14, padding: 12, marginVertical: 4, borderWidth: 1, borderColor: COLORS.border },
  cardT: { fontFamily: FONTS.semiBold },
});
