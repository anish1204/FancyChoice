import React, { useState } from 'react';
import { ScrollView, Text, StyleSheet, Alert } from 'react-native';
import { Field } from '../../components/Field';
import { Btn } from '../../components/Button';
import { COLORS } from '../../config/constants';
import { FONTS } from '../../config/theme';
import { useAuthStore } from '../../store/authStore';

export const SignupScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const { signup, loading } = useAuthStore();

  const onSignup = async () => {
    try {
      await signup({
        name, phone, email: email || undefined, password,
        address: street ? { label: 'Home', street, city: city || 'Pune', state: 'Maharashtra', pincode: '411001' } : undefined,
      });
    } catch (e) {
      Alert.alert('Signup failed', e.response?.data?.message || e.message);
    }
  };

  return (
    <ScrollView style={styles.c} contentContainerStyle={{ padding: 20 }}>
      <Text style={styles.title}>Create account</Text>
      <Field label="Name" value={name} onChangeText={setName} />
      <Field label="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" maxLength={10} />
      <Field label="Email (optional)" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
      <Field label="Password (min 6)" value={password} onChangeText={setPassword} secureTextEntry />
      <Field label="Street (optional)" value={street} onChangeText={setStreet} />
      <Field label="City (optional)" value={city} onChangeText={setCity} />
      <Btn title="Sign up" onPress={onSignup} loading={loading} />
      <Text style={styles.link} onPress={() => navigation.goBack()}>Back to login</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: COLORS.bg },
  title: { fontFamily: FONTS.bold, fontSize: 26, marginVertical: 16 },
  link: { textAlign: 'center', color: COLORS.primary, marginVertical: 12, fontFamily: FONTS.semiBold },
});
