import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  Image,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';

import { supabase } from '../../services/supabase';
import { useAuthStore } from '../../store/authStore';

export default function LoginScreen() {
  const [universities, setUniversities] = useState([]);
  const [selectedUniversity, setSelectedUniversity] = useState('');
  const [studentNumber, setStudentNumber] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingUniversities, setLoadingUniversities] = useState(true);

  const setUser = useAuthStore((state) => state.setUser);

  useEffect(() => {
    fetchUniversities();
  }, []);

  const fetchUniversities = async () => {
    try {
      const { data, error } = await supabase
        .from('universities')
        .select('id, name')
        .order('name', { ascending: true });

      if (error) {
        console.error('Fetch universities error:', error);
        Alert.alert('Error', 'Could not load universities');
      } else {
        setUniversities(data || []);
      }
    } catch (err) {
      console.error('Unexpected university fetch error:', err);
      Alert.alert('Error', 'Something went wrong while loading universities');
    } finally {
      setLoadingUniversities(false);
    }
  };

  const handleLogin = async () => {
    const cleanNum = studentNumber.trim();
    const cleanPass = password.trim();

    if (!selectedUniversity) {
      return Alert.alert('Error', 'Please select a university');
    }

    if (!cleanNum || !cleanPass) {
      return Alert.alert('Error', 'Fill all fields');
    }

    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('university_id', selectedUniversity)
        .eq('student_number', cleanNum)
        .single();

      if (error || !data) {
        Alert.alert('Login Failed', 'Student account not found for the selected university');
      } else if (data.password_hash !== cleanPass) {
        Alert.alert('Error', 'Incorrect password');
      } else {
        await setUser(data);
      }
    } catch (err) {
      console.error('Student login error:', err);
      Alert.alert('Error', 'Check your connection');
    } finally {
      setLoading(false);
    }
  };

  if (loadingUniversities) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#1D3E6E" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Image
        source={require('../../../assets/Camply-logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      <Text style={styles.title}>Welcome to Camply</Text>
      <Text style={styles.subtitle}>Login with your student account</Text>

      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={selectedUniversity}
          onValueChange={(itemValue) => setSelectedUniversity(itemValue)}
        >
          <Picker.Item label="Select your university" value="" />
          {universities.map((uni) => (
            <Picker.Item key={uni.id} label={uni.name} value={uni.id} />
          ))}
        </Picker>
      </View>

      <TextInput
        placeholder="Student Number"
        style={styles.input}
        value={studentNumber}
        onChangeText={setStudentNumber}
        autoCapitalize="none"
      />

      <TextInput
        placeholder="Password"
        secureTextEntry
        style={styles.input}
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity onPress={handleLogin} style={styles.button} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Login</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 30,
    backgroundColor: '#fff',
  },
  logo: {
    width: 120,
    height: 120,
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
    color: '#1D3E6E',
  },
  subtitle: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 25,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 15,
    overflow: 'hidden',
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
    fontWeight: 'bold',
    fontSize: 16,
  },
});