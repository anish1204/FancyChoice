import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../config/constants';
import { FONTS, RADIUS, SHADOW } from '../config/theme';

// Decorative gradient button.
// <Btn title="Pay" onPress={...} />            primary (default)
// <Btn danger ... />                            dark-red gradient
// <Btn outline ... />                           white with red border
// <Btn ghost ... />                             text-only
// <Btn small ... />                             compact
export const Btn = ({ title, onPress, loading, danger, outline, ghost, small, style }) => {
  if (ghost) {
    return (
      <TouchableOpacity onPress={onPress} disabled={loading} style={[styles.ghostHit, style]}>
        <Text style={styles.ghostTxt}>{title}</Text>
      </TouchableOpacity>
    );
  }

  if (outline) {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={loading}
        activeOpacity={0.8}
        style={[styles.outline, small && styles.smallBox, loading && styles.disabled, style]}
      >
        {loading ? <ActivityIndicator color={COLORS.primary} /> : <Text style={[styles.outlineTxt, small && styles.txtSmall]}>{title}</Text>}
      </TouchableOpacity>
    );
  }

  const colors = danger ? ['#D32F2F', '#8E0000'] : [COLORS.primary, COLORS.primaryDark];

  return (
    <TouchableOpacity onPress={onPress} disabled={loading} activeOpacity={0.85} style={[styles.wrap, style]}>
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.btn, small && styles.smallBox, loading && styles.disabled, SHADOW.button]}
      >
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={[styles.txt, small && styles.txtSmall]}>{title}</Text>}
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  wrap: { marginVertical: 6 },
  btn: { padding: 15, borderRadius: RADIUS.lg, alignItems: 'center' },
  smallBox: { padding: 10 },
  txt: { color: '#fff', fontFamily: FONTS.bold, fontSize: 16, letterSpacing: 0.3 },
  txtSmall: { fontSize: 14 },
  disabled: { opacity: 0.6 },
  outline: {
    padding: 14,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    marginVertical: 6,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    backgroundColor: '#fff',
  },
  outlineTxt: { color: COLORS.primary, fontFamily: FONTS.bold, fontSize: 16 },
  ghostHit: { padding: 10, alignItems: 'center' },
  ghostTxt: { color: COLORS.primary, fontFamily: FONTS.semiBold, fontSize: 15 },
});
