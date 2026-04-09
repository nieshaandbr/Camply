import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import { useSuperAdminStore } from '../../store/superAdminStore';

export default function SuperAdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const setSuperAdmin = useSuperAdminStore((state) => state.setSuperAdmin);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('super_admins')
        .select('*')
        .eq('email', email.trim())
        .single();

      if (error || !data) {
        alert('Super admin not found');
      } else if (data.password_hash !== password) {
        alert('Incorrect password');
      } else {
        setSuperAdmin(data);
        localStorage.setItem('camply_super_admin_session', JSON.stringify(data));
        navigate('/super-admin/dashboard');
      }
    } catch (err) {
      console.error('Super admin login error:', err);
      alert('Something went wrong while logging in.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <form onSubmit={handleLogin} style={styles.card}>
        <h1 style={styles.title}>Super Admin</h1>
        <p style={styles.subtitle}>Platform control panel login</p>

        <input
          type="email"
          placeholder="Super Admin Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
          required
        />

        <button type="submit" style={styles.button} disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: '#f8fafc',
  },
  card: {
    width: '380px',
    background: '#fff',
    padding: '32px',
    borderRadius: '16px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
  },
  title: {
    margin: 0,
    marginBottom: '8px',
    color: '#111827',
  },
  subtitle: {
    marginTop: 0,
    marginBottom: '24px',
    color: '#6b7280',
  },
  input: {
    width: '100%',
    padding: '12px',
    marginBottom: '14px',
    borderRadius: '10px',
    border: '1px solid #d1d5db',
    boxSizing: 'border-box',
  },
  button: {
    width: '100%',
    padding: '12px',
    background: '#1D3E6E',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    fontWeight: '700',
    cursor: 'pointer',
  },
};