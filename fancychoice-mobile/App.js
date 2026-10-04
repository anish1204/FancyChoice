import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';
import { RootNavigator } from './src/navigation/RootNavigator';

// Shows the real error on screen instead of a white screen (esp. on web).
class ErrorBoundary extends React.Component {
  state = { error: null };
  static getDerivedStateFromError(error) {
    return { error };
  }
  componentDidCatch(error) {
    console.error('[App crash]', error);
  }
  render() {
    if (this.state.error) {
      return (
        <View style={styles.crash}>
          <Text style={styles.crashTitle}>Something failed to load</Text>
          <Text>{String(this.state.error?.message || this.state.error)}</Text>
          <Text style={styles.hint}>Open DevTools console (F12) for the full stack trace.</Text>
        </View>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <View style={styles.loading}>
        <Text style={styles.loadingTxt}>🍛 FancyChoice</Text>
        <ActivityIndicator size="large" color="#E23744" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <ErrorBoundary>
        <RootNavigator />
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', gap: 12 },
  loadingTxt: { fontSize: 26, fontWeight: '800', color: '#E23744' },
  crash: { flex: 1, padding: 24, justifyContent: 'center', backgroundColor: '#F6F6F6' },
  crashTitle: { fontSize: 20, fontWeight: '800', marginBottom: 8 },
  hint: { marginTop: 8, color: '#696969' },
});
