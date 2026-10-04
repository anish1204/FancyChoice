import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { Field } from '../../components/Field';
import { Btn } from '../../components/Button';
import { COLORS } from '../../config/constants';
import { FONTS } from '../../config/theme';
import { useAuthStore } from '../../store/authStore';

export const LoginScreen = ({ navigation }) => {
  const [phone, setPhone] = useState('9876543210');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState('otp'); // 'otp' | 'password'
  const { sendOtp, loginPassword, loading } = useAuthStore();

  const onSendOtp = async () => {
    try {
      const res = await sendOtp(phone);
      navigation.navigate('OTP', { phone, devOtp: res?.devOtp });
    } catch (e) {
      Alert.alert('Error', e.response?.data?.message || e.message);
    }
  };

  const onPasswordLogin = async () => {
    try {
      await loginPassword(phone, password);
    } catch (e) {
      Alert.alert('Login failed', e.response?.data?.message || e.message);
    }
  };

  return (
    <View style={styles.c}>
      <Text style={styles.title}>🍛 FancyChoice</Text>
      <Text style={styles.sub}>Fresh rotis, daily delivery</Text>

      <Field label="Phone (10-digit)" value={phone} onChangeText={setPhone} keyboardType="phone-pad" maxLength={10} />

      {mode === 'password' && (
        <Field label="Password" value={password} onChangeText={setPassword} secureTextEntry />
      )}

      {mode === 'otp'
        ? <Btn title="Send OTP" onPress={onSendOtp} loading={loading} />
        : <Btn title="Login" onPress={onPasswordLogin} loading={loading} />}

      <Btn title={mode === 'otp' ? 'Use password instead' : 'Use OTP instead'} onPress={() => setMode(mode === 'otp' ? 'password' : 'otp')} />
      <Text style={styles.link} onPress={() => navigation.navigate('Signup')}>New here? Create account</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  c: { flex: 1, padding: 20, justifyContent: 'center', backgroundColor: COLORS.bg },
  title: { fontFamily: FONTS.bold, fontSize: 32, color: COLORS.primary, textAlign: 'center' },
  sub: { textAlign: 'center', color: COLORS.muted, marginBottom: 20, fontFamily: FONTS.regular },
  link: { textAlign: 'center', color: COLORS.primary, marginTop: 12, fontFamily: FONTS.semiBold },
});
