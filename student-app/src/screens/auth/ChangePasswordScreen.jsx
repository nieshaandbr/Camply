import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import { supabase } from '../../services/supabase';
import { useAuthStore } from '../../store/authStore';

export default function ChangePasswordScreen() {
  const { user, updateUser, logout } = useAuthStore();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async () => {
    const cleanNew = newPassword.trim();
    const cleanConfirm = confirmPassword.trim();

    if (!cleanNew || !cleanConfirm) {
      return Alert.alert('Error', 'Please fill all fields');
    }

    if (cleanNew.length < 4) {
      return Alert.alert('Error', 'Password must be at least 4 characters');
    }

    if (cleanNew !== cleanConfirm) {
      return Alert.alert('Error', 'Passwords do not match');
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('students')
        .update({
          password_hash: cleanNew,
          is_first_login: false,
        })
        .eq('id', user.id);

      if (error) {
        console.error('Student password update error:', error);
        Alert.alert('Error', 'Could not update password');
        return;
      }

      const updatedUser = {
        ...user,
        password_hash: cleanNew,
        is_first_login: false,
      };

      await updateUser(updatedUser);

      Alert.alert('Success', 'Password updated successfully');
    } catch (err) {
      console.error('Unexpected student password change error:', err);
      Alert.alert('Error', 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create a New Password</Text>
      <Text style={styles.subtitle}>
        You must change your temporary password before continuing.
      </Text>

      <TextInput
        placeholder="New Password"
        secureTextEntry
        style={styles.input}
        value={newPassword}
        onChangeText={setNewPassword}
      />

      <TextInput
        placeholder="Confirm New Password"
        secureTextEntry
        style={styles.input}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleChangePassword}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Save Password</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={logout} style={styles.secondaryButton}>
        <Text style={styles.secondaryText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 30,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1D3E6E',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    color: '#6b7280',
    marginBottom: 24,
    lineHeight: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 15,
    padding: 12,
    borderRadius: 8,
    fontSize: 14,
  },
  button: {
    backgroundColor: '#1D3E6E',
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 16,
  },
  secondaryButton: {
    marginTop: 14,
    padding: 12,
  },
  secondaryText: {
    textAlign: 'center',
    color: '#dc2626',
    fontWeight: '600',
  },
});