import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import { useAuthStore } from '../../store/authStore';
import logo from '../../assets/Camply-logo.png';

export default function LoginPage() {
  const [universities, setUniversities] = useState([]);
  const [selectedUniversity, setSelectedUniversity] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingUniversities, setLoadingUniversities] = useState(true);

  const setAdmin = useAuthStore((state) => state.setAdmin);
  const navigate = useNavigate();

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
        alert('Could not load universities');
      } else {
        setUniversities(data || []);
      }
    } catch (err) {
      console.error('Unexpected university fetch error:', err);
      alert('Something went wrong while loading universities');
    } finally {
      setLoadingUniversities(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!selectedUniversity) {
      alert('Please select a university');
      return;
    }

    if (!email.trim() || !password) {
      alert('Please enter your email and password');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('admins')
        .select('*')
        .eq('university_id', selectedUniversity)
        .eq('email', email.trim())
        .single();

      if (error || !data) {
        alert('Admin not found for the selected university');
        return;
      }

      if (data.password_hash !== password) {
        alert('Incorrect password');
        return;
      }

      // Save admin in Zustand state
      setAdmin(data);

      // IMPORTANT:
      // This key must match the key used in authStore.js
      localStorage.setItem('camply_admin_session', JSON.stringify(data));

      if (data.is_first_login) {
        navigate('/change-password');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Admin login error:', err);
      alert('Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loadingUniversities) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>Loading universities...</div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <form onSubmit={handleLogin} style={styles.card}>
        <img src={logo} alt="Camply Logo" style={styles.logo} />
        <h2 style={styles.title}>Admin Portal</h2>

        <select
          value={selectedUniversity}
          onChange={(e) => setSelectedUniversity(e.target.value)}
          required
          style={styles.input}
        >
          <option value="">Select university</option>
          {universities.map((uni) => (
            <option key={uni.id} value={uni.id}>
              {uni.name}
            </option>
          ))}
        </select>

        <input
          type="email"
          placeholder="Admin Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={styles.input}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={styles.input}
        />

        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? 'Authenticating...' : 'Login to Dashboard'}
        </button>
      </form>
    </div>
  );
}

const styles = {
  page: {
    height: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: 'linear-gradient(135deg, #eef2f7, #dbe6f1)',
  },
  card: {
    padding: '40px',
    background: 'white',
    borderRadius: '14px',
    boxShadow: '0 15px 35px rgba(0,0,0,0.08)',
    width: '360px',
    textAlign: 'center',
  },
  logo: {
    width: '110px',
    marginBottom: '15px',
  },
  title: {
    marginBottom: '20px',
    fontWeight: '600',
    color: '#1f2937',
  },
  input: {
    width: '100%',
    padding: '12px',
    marginBottom: '15px',
    borderRadius: '8px',
    border: '1px solid #ddd',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
  },
  button: {
    width: '100%',
    padding: '12px',
    background: '#1D3E6E',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
};