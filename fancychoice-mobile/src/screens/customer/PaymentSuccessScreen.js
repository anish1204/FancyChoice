import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { COLORS } from '../../config/constants';
import { FONTS, SHADOW } from '../../config/theme';
import { Btn } from '../../components/Button';
import { Card } from '../../components/Card';
import { Screen } from '../../components/Screen';

export const PaymentSuccessScreen = ({ route, navigation }) => {
  const { planName, cycle, amount, slots } = route.params || {};

  const goSubscriptions = () => {
    navigation.reset({ index: 0, routes: [{ name: 'Main', params: { screen: 'Subscription' } }] });
  };

  return (
    <Screen contentStyle={styles.center}>
      <Text style={styles.tick}>✓</Text>
      <Text style={styles.title}>Payment successful!</Text>
      <Text style={styles.sub}>Your roti subscription is active. Fresh rotis start tomorrow morning. 🍛</Text>
      <Card style={styles.summary}>
        <Text style={styles.plan}>{planName} • {cycle}</Text>
        <Text style={styles.amount}>₹{amount} paid</Text>
        <Text style={{ color: COLORS.muted }}>Slots: {(slots || []).join(', ')}</Text>
      </Card>
      <Btn title="View my subscription" onPress={goSubscriptions} />
      <Btn outline title="Back to home" onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Main' }] })} />
    </Screen>
  );
};

const styles = StyleSheet.create({
  center: { flexGrow: 1, justifyContent: 'center' },
  tick: {
    fontSize: 56,
    color: '#fff',
    backgroundColor: COLORS.success,
    width: 96,
    height: 96,
    textAlign: 'center',
    lineHeight: 96,
    borderRadius: 48,
    overflow: 'hidden',
    alignSelf: 'center',
    ...SHADOW.button,
  },
  title: { fontFamily: FONTS.bold, fontSize: 26, textAlign: 'center', marginTop: 16 },
  sub: { textAlign: 'center', color: COLORS.muted, marginVertical: 8, fontFamily: FONTS.regular },
  summary: { alignItems: 'center', marginTop: 12 },
  plan: { fontFamily: FONTS.semiBold, fontSize: 16 },
  amount: { fontFamily: FONTS.bold, fontSize: 22, color: COLORS.primary, marginVertical: 4 },
});
