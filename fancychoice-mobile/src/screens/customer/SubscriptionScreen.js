import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, RefreshControl } from 'react-native';
import { COLORS } from '../../config/constants';
import { FONTS } from '../../config/theme';
import { Btn } from '../../components/Button';
import { subscriptionAPI } from '../../services/api';

export const SubscriptionScreen = () => {
  const [subs, setSubs] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const d = await subscriptionAPI.mine();
      setSubs(Array.isArray(d) ? d : d?.subscriptions || d?.docs || []);
    } catch (e) {
      Alert.alert('Error', e.response?.data?.message || e.message);
    }
  };
  useEffect(() => { load(); }, []);

  const act = async (fn, id, okMsg) => {
    try { await fn; await load(); Alert.alert('Done', okMsg); }
    catch (e) { Alert.alert('Failed', e.response?.data?.message || e.message); }
  };

  return (
    <ScrollView style={styles.c} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }} />}>
      <Text style={styles.t}>My subscriptions</Text>
      {subs.map((s) => (
        <View key={s._id} style={styles.card}>
          <Text style={styles.cardT}>{s.plan?.name || `${s.rotisPerDay} rotis/day`} • {s.billingCycle}</Text>
          <Text>Status: {s.status} | Paid: ₹{s.pricePaid}</Text>
          <Text>Slots: {(s.deliverySlots || []).join(', ')}</Text>
          <Text style={{ color: COLORS.muted }}>{new Date(s.startDate).toDateString()} → {new Date(s.endDate).toDateString()}</Text>
          <View style={{ marginTop: 8 }}>
            {s.status === 'active' && <Btn title="Pause" onPress={() => act(subscriptionAPI.pause(s._id, 'Vacation'), s._id, 'Paused')} />}
            {s.status === 'paused' && <Btn title="Resume" onPress={() => act(subscriptionAPI.resume(s._id), s._id, 'Resumed')} />}
            {['active', 'paused'].includes(s.status) && (
              <Btn title="Cancel" danger onPress={() => act(subscriptionAPI.cancel(s._id), s._id, 'Cancelled')} />
            )}
          </View>
        </View>
      ))}
      {subs.length === 0 && <Text style={{ color: COLORS.muted }}>No subscriptions yet. Go to Plans tab.</Text>}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: COLORS.bg, padding: 16 },
  t: { fontFamily: FONTS.bold, fontSize: 22, color: COLORS.text, marginVertical: 8 },
  card: { backgroundColor: COLORS.card, borderRadius: 14, padding: 14, marginVertical: 6, borderWidth: 1, borderColor: COLORS.border },
  cardT: { fontFamily: FONTS.semiBold, fontSize: 16 },
});
