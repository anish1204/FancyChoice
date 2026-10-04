import React from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS } from '../config/constants';
import { RADIUS, SHADOW } from '../config/theme';

export const Card = ({ children, style }) => (
  <View style={[styles.card, style]}>{children}</View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: 16,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOW.card,
  },
});
