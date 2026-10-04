import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView } from 'react-native';
import { Field } from '../../components/Field';
import { Btn } from '../../components/Button';
import { COLORS } from '../../config/constants';
import { FONTS } from '../../config/theme';
import { useAuthStore } from '../../store/authStore';

export const OTPVerificationScreen = ({ route }) => {
  const { phone, devOtp } = route.params || {};
  const [otp, setOtp] = useState('');
  const { verifyOtp, loading } = useAuthStore();

  const onVerify = async () => {
    try {
      await verifyOtp(phone, otp);
    } catch (e) {
      Alert.alert('Invalid OTP', e.response?.data?.message || e.message);
    }
  };

  return (
    <View style={styles.c}>
      <Text style={styles.title}>Enter OTP</Text>
      <Text style={styles.sub}>Sent to +91 {phone}</Text>
      {devOtp ? <Text style={styles.dev}>Dev OTP: {devOtp} (bypass mode)</Text> : null}
      <Field label="6-digit OTP" value={otp} onChangeText={setOtp} keyboardType="number-pad" maxLength={6} />
      <Btn title="Verify & Login" onPress={onVerify} loading={loading} />
    </View>
  );
};

const styles = StyleSheet.create({
  c: { flex: 1, padding: 20, justifyContent: 'center', backgroundColor: COLORS.bg },
  title: { fontFamily: FONTS.bold, fontSize: 26, color: COLORS.text, textAlign: 'center' },
  sub: { textAlign: 'center', color: COLORS.muted, marginVertical: 8 },
  dev: { textAlign: 'center', color: COLORS.success, marginBottom: 8, fontFamily: FONTS.semiBold },
});
