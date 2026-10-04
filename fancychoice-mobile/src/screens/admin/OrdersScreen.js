import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native';
import { COLORS } from '../../config/constants';
import { FONTS } from '../../config/theme';
import { Btn } from '../../components/Button';
import { deliveryAPI, adminAPI } from '../../services/api';

// Admin: manage orders — see all of today's, assign / re-assign delivery boys, change status.
export const OrdersScreen = () => {
  const [orders, setOrders] = useState([]);
  const [boys, setBoys] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [busy, setBusy] = useState(null);
  const [assignFor, setAssignFor] = useState(null); // delivery id with picker open

  const load = async () => {
    try {
      const [o, b] = await Promise.all([
        deliveryAPI.today().catch(() => []),
        adminAPI.deliveryBoys().catch(() => []),
      ]);
      setOrders(Array.isArray(o) ? o : []);
      const bl = Array.isArray(b) ? b : b?.docs || [];
      setBoys(bl);
    } catch (e) {
      Alert.alert('Error', e.response?.data?.message || e.message);
    }
  };
  useEffect(() => { load(); }, []);

  const assign = async (orderId, boyId) => {
    setBusy(orderId);
    try {
      await deliveryAPI.assign(orderId, boyId);
      setAssignFor(null);
      await load();
      Alert.alert('Assigned', 'Delivery boy updated.');
    } catch (e) {
      Alert.alert('Failed', e.response?.data?.message || e.message);
    } finally {
      setBusy(null);
    }
  };

  const setStatus = async (orderId, status) => {
    setBusy(orderId);
    try {
      await deliveryAPI.setStatus(orderId, { status });
      await load();
    } catch (e) {
      Alert.alert('Failed', e.response?.data?.message || e.message);
    } finally {
      setBusy(null);
    }
  };

  return (
    <ScrollView
      style={styles.c}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }} />}
    >
      <Text style={styles.t}>Orders — today ({orders.length})</Text>
      {boys.length === 0 && <Text style={{ color: COLORS.danger }}>No delivery boys found. Create one via Users tab or seed.</Text>}
      {orders.map((o) => (
        <View key={o._id} style={styles.card}>
          <Text style={styles.cardT}>{o.slot} • {o.rotisCount} rotis • {o.status}</Text>
          <Text>Customer: {o.user?.name} (+91 {o.user?.phone})</Text>
          <Text>Rider: {o.deliveryBoy ? `${o.deliveryBoy.name} (+91 ${o.deliveryBoy.phone})` : '— unassigned —'}</Text>
          <Text style={{ color: COLORS.muted }}>
            {o.subscription?.deliveryAddress?.street || ''} {o.subscription?.deliveryAddress?.city || ''}
          </Text>

          <View style={{ marginTop: 8 }}>
            <Btn
              title={assignFor === o._id ? 'Close rider list' : 'Assign / change rider'}
              onPress={() => setAssignFor(assignFor === o._id ? null : o._id)}
            />
            {assignFor === o._id && boys.map((b) => (
              <Text key={b._id} style={styles.rider} onPress={() => assign(o._id, b._id)}>
                {b.name} • +91 {b.phone}
              </Text>
            ))}
            {o.status !== 'delivered' && (
              <Btn title="Force delivered" onPress={() => setStatus(o._id, 'delivered')} loading={busy === o._id} />
            )}
            {['scheduled', 'out_for_delivery'].includes(o.status) && (
              <Btn title="Mark missed" danger onPress={() => setStatus(o._id, 'missed')} loading={busy === o._id} />
            )}
          </View>
        </View>
      ))}
      {orders.length === 0 && <Text style={{ color: COLORS.muted }}>No deliveries scheduled today.</Text>}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: COLORS.bg, padding: 16 },
  t: { fontFamily: FONTS.bold, fontSize: 22, color: COLORS.text, marginVertical: 8 },
  card: { backgroundColor: COLORS.card, borderRadius: 14, padding: 14, marginVertical: 6, borderWidth: 1, borderColor: COLORS.border },
  cardT: { fontFamily: FONTS.semiBold, fontSize: 16, marginBottom: 4 },
  rider: { padding: 10, backgroundColor: COLORS.accent, borderRadius: 10, marginVertical: 3, color: COLORS.primary, fontFamily: FONTS.semiBold, overflow: 'hidden' },
});
