import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { COLORS } from '../../config/constants';
import { FONTS, RADIUS, SHADOW } from '../../config/theme';
import { Btn } from '../../components/Button';
import { Card } from '../../components/Card';
import { Screen } from '../../components/Screen';
import { Field } from '../../components/Field';
import { planAPI } from '../../services/api';

export const PlansScreen = ({ navigation }) => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cycle, setCycle] = useState('monthly');
  const [street, setStreet] = useState('Flat 101, MG Road');
  const [city, setCity] = useState('Pune');

  useEffect(() => {
    planAPI.list().then((d) => setPlans(Array.isArray(d) ? d : d?.plans || [])).catch((e) =>
      Alert.alert('Error', e.response?.data?.message || e.message)).finally(() => setLoading(false));
  }, []);

  if (loading) return <ActivityIndicator style={{ marginTop: 60 }} size="large" color={COLORS.primary} />;

  return (
    <Screen>
      <Text style={styles.t}>Choose your plan</Text>
      <Text style={styles.sub}>Fresh rotis delivered daily • pause anytime</Text>
      <View style={styles.row}>
        {['monthly', 'quarterly', 'yearly'].map((k) => (
          <Text key={k} onPress={() => setCycle(k)} style={[styles.pill, cycle === k && styles.pillOn]}>{k}</Text>
        ))}
      </View>
      <Field label="Street" value={street} onChangeText={setStreet} />
      <Field label="City" value={city} onChangeText={setCity} />
      {plans.map((p) => {
        const popular = p.rotisPerDay === 5;
        return (
          <Card key={p._id} style={popular && styles.popularCard}>
            {popular && <Text style={styles.badge}>MOST POPULAR</Text>}
            <Text style={styles.cardT}>{p.name}</Text>
            <Text style={styles.desc}>{p.description}</Text>
            <Text style={styles.price}>₹{p.prices?.[cycle]} <Text style={styles.per}>/ {cycle}</Text></Text>
            <Btn
              title={`Continue • ${p.rotisPerDay} rotis/day`}
              onPress={() => navigation.navigate('Checkout', { plan: p, cycle, street, city })}
            />
          </Card>
        );
      })}
    </Screen>
  );
};

const styles = StyleSheet.create({
  t: { fontFamily: FONTS.bold, fontSize: 24, color: COLORS.text, marginTop: 8 },
  sub: { color: COLORS.muted, fontFamily: FONTS.regular, marginBottom: 4 },
  row: { flexDirection: 'row', marginVertical: 10, flexWrap: 'wrap' },
  pill: { padding: 10, paddingHorizontal: 16, borderRadius: RADIUS.full, backgroundColor: COLORS.accent, marginRight: 8, overflow: 'hidden', fontFamily: FONTS.medium, color: COLORS.text },
  pillOn: { backgroundColor: COLORS.primary, color: '#fff', fontFamily: FONTS.bold },
  popularCard: { borderColor: COLORS.primary, borderWidth: 1.5 },
  badge: { alignSelf: 'flex-start', backgroundColor: COLORS.primary, color: '#fff', fontFamily: FONTS.bold, fontSize: 11, padding: 5, paddingHorizontal: 10, borderRadius: RADIUS.full, overflow: 'hidden', marginBottom: 8, letterSpacing: 1 },
  cardT: { fontFamily: FONTS.bold, fontSize: 18 },
  desc: { color: COLORS.muted, fontFamily: FONTS.regular, marginTop: 2 },
  price: { fontFamily: FONTS.bold, color: COLORS.primary, marginVertical: 8, fontSize: 22 },
  per: { fontFamily: FONTS.regular, fontSize: 14, color: COLORS.muted },
});
