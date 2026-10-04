import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../config/constants';
import { FONTS, RADIUS, SHADOW } from '../../config/theme';
import { Btn } from '../../components/Button';
import { Card } from '../../components/Card';
import { Screen } from '../../components/Screen';
import { Field } from '../../components/Field';
import { subscriptionAPI, paymentAPI } from '../../services/api';

const MONTHS = { monthly: 1, quarterly: 3, yearly: 12 };

// Checkout: order summary + payment method + pay. Backend runs in mock/test
// mode (no real money moves) until Stripe keys are configured.
export const CheckoutScreen = ({ route, navigation }) => {
  const { plan, cycle, street, city } = route.params || {};
  const [slots, setSlots] = useState(['morning']);
  const [method, setMethod] = useState('upi');
  const [upiId, setUpiId] = useState('');
  const [cardNum, setCardNum] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  if (!plan) {
    return (
      <Screen>
        <Text style={styles.title}>No plan selected</Text>
        <Btn title="Back to plans" onPress={() => navigation.goBack()} />
      </Screen>
    );
  }

  const price = plan.prices?.[cycle] ?? 0;
  const months = MONTHS[cycle] || 1;
  const savings = plan.prices?.monthly ? plan.prices.monthly * months - price : 0;

  const toggleSlot = (s) => {
    setSlots((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  };

  const pay = async () => {
    if (slots.length === 0) { setError('Pick at least one delivery slot.'); return; }
    if (method === 'upi' && !upiId.includes('@')) { setError('Enter a valid UPI ID (e.g. name@okbank).'); return; }
    if (method === 'card' && cardNum.replace(/\s/g, '').length < 12) { setError('Enter a valid card number.'); return; }
    setBusy(true);
    setError(null);
    try {
      const sub = await subscriptionAPI.create({
        planId: plan._id,
        billingCycle: cycle,
        deliverySlots: slots,
        deliveryAddress: { label: 'Home', street, city, state: 'Maharashtra', pincode: '411001' },
      });
      const intent = await paymentAPI.intent({ subscriptionId: sub?._id });
      const payId = intent?.payment?._id;
      if (payId) await paymentAPI.confirm(payId, true);
      navigation.replace('PaymentSuccess', {
        planName: plan.name, cycle, amount: price, slots,
      });
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen>
      <Text style={styles.title}>Checkout</Text>

      <Card>
        <Text style={styles.planName}>{plan.name}</Text>
        <Text style={{ color: COLORS.muted }}>{plan.rotisPerDay} fresh rotis / day • {cycle}</Text>
        <View style={styles.row}>
          <Text style={styles.price}>₹{price}</Text>
          {savings > 0 && <Text style={styles.save}>You save ₹{savings}</Text>}
        </View>
      </Card>

      <Text style={styles.sec}>Delivery slots</Text>
      <View style={styles.row}>
        {['morning', 'evening'].map((s) => (
          <Text key={s} onPress={() => toggleSlot(s)} style={[styles.pill, slots.includes(s) && styles.pillOn]}>
            {slots.includes(s) ? '✓ ' : ''}{s}
          </Text>
        ))}
      </View>

      <Card>
        <Text style={styles.cardT}>Deliver to</Text>
        <Text>{street}, {city} 411001</Text>
      </Card>

      <Text style={styles.sec}>Pay with</Text>
      <View style={styles.row}>
        {[
          { k: 'upi', label: 'UPI' },
          { k: 'card', label: 'Card' },
        ].map((m) => (
          <Text key={m.k} onPress={() => setMethod(m.k)} style={[styles.pill, method === m.k && styles.pillOn]}>
            {m.label}{m.k === 'upi' ? ' ★' : ''}
          </Text>
        ))}
      </View>

      {method === 'upi' ? (
        <Field label="UPI ID" value={upiId} onChangeText={setUpiId} placeholder="name@okbank" autoCapitalize="none" />
      ) : (
        <>
          <Field label="Card number" value={cardNum} onChangeText={setCardNum} placeholder="4111 1111 1111 1111" keyboardType="number-pad" maxLength={19} />
          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 6 }}>
              <Field label="Expiry" value={expiry} onChangeText={setExpiry} placeholder="MM/YY" maxLength={5} />
            </View>
            <View style={{ flex: 1, marginLeft: 6 }}>
              <Field label="CVV" value={cvv} onChangeText={setCvv} placeholder="•••" keyboardType="number-pad" maxLength={4} secureTextEntry />
            </View>
          </View>
        </>
      )}

      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Text style={styles.test}>Test mode — no real money moves until Stripe is configured.</Text>
      <Btn title={busy ? 'Processing…' : `Pay ₹${price}`} onPress={pay} loading={busy} />
      <Btn ghost title="Cancel" onPress={() => navigation.goBack()} />
    </Screen>
  );
};

const styles = StyleSheet.create({
  title: { fontFamily: FONTS.bold, fontSize: 24, color: COLORS.text, marginVertical: 10 },
  sec: { fontFamily: FONTS.semiBold, fontSize: 17, marginTop: 12, color: COLORS.text },
  cardT: { fontFamily: FONTS.semiBold, fontSize: 16 },
  planName: { fontFamily: FONTS.bold, fontSize: 19 },
  row: { flexDirection: 'row', alignItems: 'center', marginVertical: 8, flexWrap: 'wrap' },
  price: { fontFamily: FONTS.bold, fontSize: 24, color: COLORS.primary, marginRight: 10 },
  save: { backgroundColor: '#E8F5E9', color: COLORS.success, fontFamily: FONTS.semiBold, padding: 6, paddingHorizontal: 10, borderRadius: RADIUS.full, overflow: 'hidden' },
  pill: { padding: 10, paddingHorizontal: 16, borderRadius: RADIUS.full, backgroundColor: COLORS.accent, marginRight: 8, overflow: 'hidden', fontFamily: FONTS.medium, color: COLORS.text },
  pillOn: { backgroundColor: COLORS.primary, color: '#fff', fontFamily: FONTS.bold },
  error: { color: COLORS.danger, fontFamily: FONTS.medium, marginVertical: 8 },
  test: { color: COLORS.muted, fontSize: 13, marginTop: 10, textAlign: 'center' },
});
