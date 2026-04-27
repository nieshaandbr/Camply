import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { supabase } from '../../services/supabase';
import { useAuthStore } from '../../store/authStore';

export default function ChangePasswordScreen() {
  const { user, updateUser, logout } = useAuthStore();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
    <KeyboardAvoidingView
      style={styles.keyboardWrap}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Create a New Password</Text>
        <Text style={styles.subtitle}>
          You must change your temporary password before continuing.
        </Text>

        <View style={styles.passwordWrapper}>
          <TextInput
            placeholder="New Password"
            secureTextEntry={!showNewPassword}
            style={styles.passwordInput}
            value={newPassword}
            onChangeText={setNewPassword}
          />

          <TouchableOpacity
            onPress={() => setShowNewPassword((prev) => !prev)}
            style={styles.eyeBtn}
          >
            <Ionicons
              name={showNewPassword ? 'eye-off' : 'eye'}
              size={22}
              color="#6b7280"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.passwordWrapper}>
          <TextInput
            placeholder="Confirm New Password"
            secureTextEntry={!showConfirmPassword}
            style={styles.passwordInput}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />

          <TouchableOpacity
            onPress={() => setShowConfirmPassword((prev) => !prev)}
            style={styles.eyeBtn}
          >
            <Ionicons
              name={showConfirmPassword ? 'eye-off' : 'eye'}
              size={22}
              color="#6b7280"
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={handleChangePassword}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Save Password</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={logout} style={styles.secondaryButton}>
          <Text style={styles.secondaryText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardWrap: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 30,
    paddingBottom: 60,
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
  passwordWrapper: {
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 15,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
    padding: 12,
    fontSize: 14,
  },
  eyeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 10,
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