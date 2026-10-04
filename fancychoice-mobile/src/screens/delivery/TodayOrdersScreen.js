import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native';
import { COLORS } from '../../config/constants';
import { FONTS } from '../../config/theme';
import { Btn } from '../../components/Button';
import { Field } from '../../components/Field';
import { deliveryAPI } from '../../services/api';

// Delivery boy: today's assigned orders. Acts: out_for_delivery -> scan/verify QR -> delivered / missed.
export const TodayOrdersScreen = ({ navigation }) => {
  const [orders, setOrders] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [qrInput, setQrInput] = useState({});
  const [busy, setBusy] = useState(null);

  const load = async () => {
    try {
      const d = await deliveryAPI.today();
      setOrders(Array.isArray(d) ? d : []);
    } catch (e) {
      Alert.alert('Error', e.response?.data?.message || e.message);
    }
  };
  useEffect(() => { load(); }, []);

  const setStatus = async (id, status) => {
    setBusy(id);
    try {
      await deliveryAPI.setStatus(id, { status });
      await load();
    } catch (e) {
      Alert.alert('Failed', e.response?.data?.message || e.message);
    } finally {
      setBusy(null);
    }
  };

  const verifyQr = async (id) => {
    const token = (qrInput[id] || '').trim();
    if (!token) { Alert.alert('Missing QR', 'Ask customer for the QR token or scan it.'); return; }
    setBusy(id);
    try {
      await deliveryAPI.verifyQr(id, token);
      Alert.alert('Verified', 'QR verified. You can mark delivered.');
      await load();
    } catch (e) {
      Alert.alert('QR invalid', e.response?.data?.message || e.message);
    } finally {
      setBusy(null);
    }
  };

  return (
    <ScrollView
      style={styles.c}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }} />}
    >
      <Text style={styles.t}>Today's orders ({orders.length})</Text>
      {orders.map((o) => (
        <View key={o._id} style={styles.card}>
          <Text style={styles.cardT}>{o.slot} • {o.rotisCount} rotis • {o.status}</Text>
          <Text>{o.user?.name} • +91 {o.user?.phone}</Text>
          <Text style={{ color: COLORS.muted }}>
            {o.subscription?.deliveryAddress?.street || ''} {o.subscription?.deliveryAddress?.city || ''} {o.subscription?.deliveryAddress?.pincode || ''}
          </Text>
          {o.qrCode?.isVerified ? <Text style={styles.ok}>QR verified ✓</Text> : null}
          <View style={{ marginTop: 8 }}>
            {o.status === 'scheduled' && (
              <Btn title="Start delivery" onPress={() => setStatus(o._id, 'out_for_delivery')} loading={busy === o._id} />
            )}
            {o.status === 'out_for_delivery' && !o.qrCode?.isVerified && (
              <>
                <Btn title="📷 Scan customer QR" onPress={() => navigation.navigate('Scanner', { deliveryId: o._id })} />
                <Field
                  label="Or enter QR token manually"
                  value={qrInput[o._id] || ''}
                  onChangeText={(v) => setQrInput({ ...qrInput, [o._id]: v })}
                  autoCapitalize="none"
                />
                <Btn title="Verify QR" onPress={() => verifyQr(o._id)} loading={busy === o._id} />
              </>
            )}
            {['out_for_delivery', 'preparing'].includes(o.status) && (
              <Btn title="Mark delivered" onPress={() => setStatus(o._id, 'delivered')} loading={busy === o._id} />
            )}
            {['scheduled', 'out_for_delivery'].includes(o.status) && (
              <Btn title="Mark missed" danger onPress={() => setStatus(o._id, 'missed')} loading={busy === o._id} />
            )}
          </View>
        </View>
      ))}
      {orders.length === 0 && <Text style={{ color: COLORS.muted }}>No orders assigned for today.</Text>}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: COLORS.bg, padding: 16 },
  t: { fontFamily: FONTS.bold, fontSize: 22, color: COLORS.text, marginVertical: 8 },
  card: { backgroundColor: COLORS.card, borderRadius: 14, padding: 14, marginVertical: 6, borderWidth: 1, borderColor: COLORS.border },
  cardT: { fontFamily: FONTS.semiBold, fontSize: 16, marginBottom: 4 },
  ok: { color: COLORS.success, fontFamily: FONTS.semiBold, marginTop: 4 },
});
