import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { COLORS } from '../../config/constants';
import { FONTS } from '../../config/theme';
import { deliveryAPI } from '../../services/api';

// Delivery boy: history of orders already delivered/handled.
export const OrderHistoryScreen = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    deliveryAPI.history()
      .then((d) => setOrders(Array.isArray(d) ? d : d?.docs || []))
      .catch((e) => Alert.alert('Error', e.response?.data?.message || e.message));
  }, []);

  const delivered = orders.filter((o) => o.status === 'delivered').length;

  return (
    <ScrollView style={styles.c}>
      <Text style={styles.t}>Order history</Text>
      <Text style={{ color: COLORS.muted, marginBottom: 8 }}>{delivered} delivered of {orders.length} past orders</Text>
      {orders.map((o) => (
        <View key={o._id} style={styles.card}>
          <Text style={styles.cardT}>{new Date(o.scheduledDate).toDateString()} • {o.slot} • {o.rotisCount} rotis</Text>
          <Text>Status: {o.status}</Text>
          {o.rating?.score ? <Text>★ {o.rating.score}{o.rating.comment ? ` — ${o.rating.comment}` : ''}</Text> : null}
        </View>
      ))}
      {orders.length === 0 && <Text style={{ color: COLORS.muted }}>No past orders yet.</Text>}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: COLORS.bg, padding: 16 },
  t: { fontFamily: FONTS.bold, fontSize: 22, color: COLORS.text, marginVertical: 8 },
  card: { backgroundColor: COLORS.card, borderRadius: 14, padding: 14, marginVertical: 6, borderWidth: 1, borderColor: COLORS.border },
  cardT: { fontFamily: FONTS.semiBold },
});
