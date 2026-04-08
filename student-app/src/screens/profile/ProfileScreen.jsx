import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useAuthStore } from '../../store/authStore';

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.name?.charAt(0)}</Text>
        </View>
        
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.info}>Student ID: {user?.student_number}</Text>
        <Text style={styles.info}>{user?.email}</Text>

        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#007AFF', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  avatarText: { color: '#fff', fontSize: 32, fontWeight: 'bold' },
  name: { fontSize: 22, fontWeight: 'bold', marginBottom: 5 },
  info: { fontSize: 14, color: '#666', marginBottom: 5 },
  logoutBtn: { marginTop: 40, padding: 15, width: '100%', borderRadius: 10, borderWeight: 1, borderColor: '#ff4d4d', borderWidth: 1 },
  logoutText: { color: '#ff4d4d', textAlign: 'center', fontWeight: 'bold' }
});