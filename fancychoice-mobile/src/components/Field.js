import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { COLORS } from '../config/constants';
import { FONTS } from '../config/theme';

export const Field = ({ label, ...props }) => (
  <View style={styles.wrap}>
    {label ? <Text style={styles.label}>{label}</Text> : null}
    <TextInput style={styles.input} placeholderTextColor="#9E9E9E" {...props} />
  </View>
);

const styles = StyleSheet.create({
  wrap: { marginVertical: 6 },
  label: { fontFamily: FONTS.semiBold, marginBottom: 4, color: COLORS.text },
  input: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: COLORS.text,
  },
});
