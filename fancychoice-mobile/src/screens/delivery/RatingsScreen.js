import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native';
import { COLORS } from '../../config/constants';
import { FONTS } from '../../config/theme';
import { deliveryAPI } from '../../services/api';

// Delivery boy: my average rating + customer reviews.
export const RatingsScreen = () => {
  const [data, setData] = useState({ average: 0, count: 0, reviews: [] });
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const d = await deliveryAPI.myRatings();
      setData({ average: d.average || 0, count: d.count || 0, reviews: d.reviews || [] });
    } catch (e) {
      Alert.alert('Error', e.response?.data?.message || e.message);
    }
  };
  useEffect(() => { load(); }, []);

  return (
    <ScrollView
      style={styles.c}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }} />}
    >
      <Text style={styles.t}>My ratings</Text>
      <View style={styles.hero}>
        <Text style={styles.big}>★ {data.average || '—'}</Text>
        <Text style={{ color: COLORS.muted }}>{data.count} review(s) from customers</Text>
      </View>
      <Text style={styles.sec}>Reviews</Text>
      {data.reviews.map((r) => (
        <View key={r._id} style={styles.card}>
          <Text style={styles.cardT}>★ {r.rating.score} • {r.user?.name || 'Customer'}</Text>
          {r.rating.comment ? <Text>{r.rating.comment}</Text> : null}
          <Text style={{ color: COLORS.muted }}>{r.rating.ratedAt ? new Date(r.rating.ratedAt).toLocaleDateString() : ''} • {r.slot}</Text>
        </View>
      ))}
      {data.reviews.length === 0 && <Text style={{ color: COLORS.muted }}>No reviews yet — they appear after customers rate deliveries.</Text>}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: COLORS.bg, padding: 16 },
  t: { fontFamily: FONTS.bold, fontSize: 22, color: COLORS.text, marginVertical: 8 },
  hero: { backgroundColor: COLORS.card, borderRadius: 14, padding: 18, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  big: { fontSize: 34, fontFamily: FONTS.bold, color: COLORS.primary },
  sec: { fontSize: 17, fontFamily: FONTS.semiBold, marginTop: 12 },
  card: { backgroundColor: COLORS.card, borderRadius: 14, padding: 14, marginVertical: 6, borderWidth: 1, borderColor: COLORS.border },
  cardT: { fontFamily: FONTS.semiBold, fontSize: 16 },
});
