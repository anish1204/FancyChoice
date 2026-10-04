import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Btn } from '../../components/Button';
import { COLORS } from '../../config/constants';
import { FONTS } from '../../config/theme';
import { deliveryAPI } from '../../services/api';

// Delivery boy: scan the QR shown on the customer's phone.
// QR payload (from backend) is JSON: { deliveryId, token }.
export const QRScannerScreen = ({ route, navigation }) => {
  const { deliveryId } = route.params || {};
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [busy, setBusy] = useState(false);

  if (!permission) {
    return (
      <View style={styles.c}>
        <Text>Requesting camera permission…</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.c}>
        <Text style={styles.msg}>Camera access is needed to scan the customer's QR code.</Text>
        <Btn title="Grant camera permission" onPress={requestPermission} />
        <Btn title="Go back" onPress={() => navigation.goBack()} />
      </View>
    );
  }

  const retry = () => setScanned(false);

  const onScan = async ({ data }) => {
    if (scanned || busy) return;
    setScanned(true);

    let payload;
    try {
      payload = JSON.parse(data);
    } catch {
      Alert.alert('Not a FancyChoice QR', 'This QR code is not from a FancyChoice delivery.', [
        { text: 'Scan again', onPress: retry },
        { text: 'Cancel', style: 'cancel', onPress: () => navigation.goBack() },
      ]);
      return;
    }

    const id = payload.deliveryId || deliveryId;
    if (!payload.token || !id) {
      Alert.alert('Invalid QR', 'This QR is missing delivery data. Ask the customer to re-open it.', [
        { text: 'Scan again', onPress: retry },
        { text: 'Cancel', style: 'cancel', onPress: () => navigation.goBack() },
      ]);
      return;
    }

    if (deliveryId && payload.deliveryId && payload.deliveryId !== deliveryId) {
      Alert.alert('Wrong order', 'This QR belongs to a different delivery.', [
        { text: 'Scan again', onPress: retry },
        { text: 'Cancel', style: 'cancel', onPress: () => navigation.goBack() },
      ]);
      return;
    }

    setBusy(true);
    try {
      await deliveryAPI.verifyQr(id, payload.token);
      Alert.alert('Verified ✓', 'QR verified. You can now mark this order delivered.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      Alert.alert('Verification failed', e.response?.data?.message || e.message, [
        { text: 'Scan again', onPress: retry },
        { text: 'Cancel', style: 'cancel', onPress: () => navigation.goBack() },
      ]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.wrap}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={scanned ? undefined : onScan}
      />
      <View style={styles.overlay} pointerEvents="box-none">
        <View style={styles.frame} />
        <Text style={styles.hint}>Point the camera at the customer's QR</Text>
        <Text style={styles.hintSmall}>{busy ? 'Verifying…' : 'Scanning automatically'}</Text>
        <Btn title="Cancel" onPress={() => navigation.goBack()} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#000' },
  c: { flex: 1, padding: 20, justifyContent: 'center', backgroundColor: COLORS.bg },
  msg: { fontSize: 16, marginBottom: 12, color: COLORS.text },
  overlay: { flex: 1, justifyContent: 'flex-end', padding: 20, backgroundColor: 'transparent' },
  frame: {
    position: 'absolute',
    top: '25%',
    left: '15%',
    right: '15%',
    aspectRatio: 1,
    borderWidth: 3,
    borderColor: COLORS.primary,
    borderRadius: 16,
    backgroundColor: 'transparent',
  },
  hint: { color: '#fff', textAlign: 'center', fontFamily: FONTS.semiBold, fontSize: 16, marginBottom: 4 },
  hintSmall: { color: '#ddd', textAlign: 'center', marginBottom: 12 },
});
