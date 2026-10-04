import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Image } from 'react-native';
import { COLORS } from '../../config/constants';
import { FONTS } from '../../config/theme';
import { Btn } from '../../components/Button';
import { Field } from '../../components/Field';
import { deliveryAPI } from '../../services/api';

export const TrackingScreen = () => {
  const [today, setToday] = useState([]);
  const [history, setHistory] = useState([]);
  const [qr, setQr] = useState({});
  const [score, setScore] = useState('5');

  const load = async () => {
    try {
      const [t, h] = await Promise.all([deliveryAPI.today().catch(() => []), deliveryAPI.history().catch(() => [])]);
      setToday(Array.isArray(t) ? t : []);
      const hd = Array.isArray(h) ? h : h?.deliveries || h?.docs || [];
      setHistory(hd);
    } catch (e) {
      Alert.alert('Error', e.response?.data?.message || e.message);
    }
  };
  useEffect(() => { load(); }, []);

  const showQr = async (id) => {
    try {
      const d = await deliveryAPI.qr(id);
      setQr({ [id]: { image: d.qrImage || d.qrCode, token: d.token, expiresAt: d.expiresAt } });
    } catch (e) {
      Alert.alert('QR failed', e.response?.data?.message || e.message);
    }
  };

  const rate = async (id) => {
    try {
      await deliveryAPI.rate(id, Number(score), 'Great!');
      Alert.alert('Thanks!', 'Rating submitted');
      load();
    } catch (e) {
      Alert.alert('Failed', e.response?.data?.message || e.message);
    }
  };

  const Card = (d) => (
    <View key={d._id} style={styles.card}>
      <Text style={styles.cardT}>{d.slot} • {d.rotisCount} rotis • {d.status}</Text>
      <Text style={{ color: COLORS.muted }}>{new Date(d.scheduledDate).toDateString()}</Text>
      {d.rating?.score ? <Text>★ {d.rating.score} {d.rating.comment || ''}</Text> : null}
      <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
        <Text style={styles.mini} onPress={() => showQr(d._id)}>Show QR</Text>
        {d.status === 'delivered' && <Text style={styles.mini} onPress={() => rate(d._id)}>Rate 5★</Text>}
      </View>
      {qr[d._id]?.image ? (
        <View style={styles.qrBox}>
          <Image source={{ uri: qr[d._id].image }} style={{ width: 160, height: 160 }} />
          <Text style={styles.codeLabel}>Backup code — read it out if scanning fails</Text>
          <Text selectable style={styles.code}>{qr[d._id].token}</Text>
          {qr[d._id].expiresAt ? (
            <Text style={{ color: COLORS.muted }}>Valid till {new Date(qr[d._id].expiresAt).toLocaleString()}</Text>
          ) : null}
        </View>
      ) : null}
    </View>
  );

  return (
    <ScrollView style={styles.c}>
      <Text style={styles.t}>Tracking</Text>
      <Text style={styles.sec}>Today ({today.length})</Text>
      {today.map(Card)}
      <Text style={styles.sec}>History ({history.length})</Text>
      <Field label="Rating score to submit (1-5)" value={score} onChangeText={setScore} keyboardType="number-pad" maxLength={1} />
      {history.map(Card)}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: COLORS.bg, padding: 16 },
  t: { fontFamily: FONTS.bold, fontSize: 22, color: COLORS.text, marginVertical: 8 },
  sec: { fontSize: 17, fontFamily: FONTS.semiBold, marginTop: 10 },
  card: { backgroundColor: COLORS.card, borderRadius: 14, padding: 14, marginVertical: 6, borderWidth: 1, borderColor: COLORS.border },
  cardT: { fontFamily: FONTS.semiBold },
  mini: { color: COLORS.primary, fontFamily: FONTS.semiBold, marginRight: 16 },
  qrBox: { marginTop: 10, padding: 12, backgroundColor: COLORS.accent, borderRadius: 12, alignItems: 'center' },
  codeLabel: { marginTop: 8, color: COLORS.muted, fontSize: 13 },
  code: { fontSize: 18, fontFamily: FONTS.bold, letterSpacing: 2, color: COLORS.text, marginVertical: 4 },
});
