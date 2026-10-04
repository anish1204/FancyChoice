import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native';
import { COLORS } from '../../config/constants';
import { FONTS } from '../../config/theme';
import { Field } from '../../components/Field';
import { adminAPI } from '../../services/api';

const ROLES = ['customer', 'deliveryBoy', 'admin'];

// Admin: users list + change anyone's role (e.g. promote a signup to delivery boy).
export const UsersScreen = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const q = `?limit=50${roleFilter ? `&role=${roleFilter}` : ''}${search ? `&search=${search}` : ''}`;
      const d = await adminAPI.users(q);
      setUsers(Array.isArray(d) ? d : d?.docs || []);
    } catch (e) {
      Alert.alert('Error', e.response?.data?.message || e.message);
    }
  };
  useEffect(() => { load(); }, []);

  const changeRole = async (u, role) => {
    if (u.role === role) return;
    Alert.alert('Change role', `${u.name} (${u.phone}): ${u.role} → ${role}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Confirm',
        onPress: async () => {
          try {
            await adminAPI.setRole(u._id, role);
            await load();
          } catch (e) {
            Alert.alert('Failed', e.response?.data?.message || e.message);
          }
        },
      },
    ]);
  };

  return (
    <ScrollView
      style={styles.c}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }} />}
    >
      <Text style={styles.t}>Users ({users.length})</Text>
      <Field label="Search name/phone" value={search} onChangeText={setSearch} onSubmitEditing={load} returnKeyType="search" />
      <View style={styles.row}>
        {['', ...ROLES].map((r) => (
          <Text key={r || 'all'} onPress={() => { setRoleFilter(r); }} style={[styles.pill, roleFilter === r && styles.pillOn]}>
            {r || 'all'}
          </Text>
        ))}
        <Text style={styles.go} onPress={load}>Apply</Text>
      </View>
      {users.map((u) => (
        <View key={u._id} style={styles.card}>
          <Text style={styles.cardT}>{u.name} • +91 {u.phone}</Text>
          <Text>Role: {u.role} {u.isActive ? '' : '(deactivated)'}</Text>
          <View style={styles.row}>
            {ROLES.filter((r) => r !== u.role).map((r) => (
              <Text key={r} style={styles.mini} onPress={() => changeRole(u, r)}>Make {r}</Text>
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: COLORS.bg, padding: 16 },
  t: { fontFamily: FONTS.bold, fontSize: 22, color: COLORS.text, marginVertical: 8 },
  row: { flexDirection: 'row', alignItems: 'center', marginVertical: 6, flexWrap: 'wrap' },
  pill: { padding: 8, paddingHorizontal: 14, borderRadius: 20, backgroundColor: COLORS.accent, marginRight: 8, overflow: 'hidden' },
  pillOn: { backgroundColor: COLORS.primary, color: '#fff', fontFamily: FONTS.bold },
  go: { color: COLORS.primary, fontFamily: FONTS.bold, padding: 8 },
  card: { backgroundColor: COLORS.card, borderRadius: 14, padding: 14, marginVertical: 6, borderWidth: 1, borderColor: COLORS.border },
  cardT: { fontFamily: FONTS.semiBold, fontSize: 16 },
  mini: { color: COLORS.primary, fontFamily: FONTS.semiBold, marginRight: 16, paddingVertical: 6 },
});
