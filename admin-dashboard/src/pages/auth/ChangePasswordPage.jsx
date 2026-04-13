import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import { useAuthStore } from '../../store/authStore';

export default function ChangePasswordPage() {
  const { admin, updateAdmin, logout, loadSession } = useAuthStore();
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSession();
  }, []);

  useEffect(() => {
    if (admin && !admin.is_first_login) {
      navigate('/dashboard');
    }
  }, [admin]);

  const handleSave = async (e) => {
    e.preventDefault();

    const cleanNew = newPassword.trim();
    const cleanConfirm = confirmPassword.trim();

    if (!cleanNew || !cleanConfirm) {
      alert('Please fill all fields');
      return;
    }

    if (cleanNew.length < 4) {
      alert('Password must be at least 4 characters');
      return;
    }

    if (cleanNew !== cleanConfirm) {
      alert('Passwords do not match');
      return;
    }

    if (!admin) {
      alert('Admin session not found');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('admins')
        .update({
          password_hash: cleanNew,
          is_first_login: false,
        })
        .eq('id', admin.id);

      if (error) {
        console.error('Admin password update error:', error);
        alert('Could not update password');
        return;
      }

      const updatedAdmin = {
        ...admin,
        password_hash: cleanNew,
        is_first_login: false,
      };

      updateAdmin(updatedAdmin);
      navigate('/dashboard');
    } catch (err) {
      console.error('Unexpected admin password change error:', err);
      alert('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <form onSubmit={handleSave} style={styles.card}>
        <h1 style={styles.title}>Create a New Password</h1>
        <p style={styles.subtitle}>
          You must change your temporary password before continuing.
        </p>

        <input
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          style={styles.input}
        />

        <input
          type="password"
          placeholder="Confirm New Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          style={styles.input}
        />

        <button type="submit" style={styles.button} disabled={loading}>
          {loading ? 'Saving...' : 'Save Password'}
        </button>

        <button type="button" style={styles.secondaryButton} onClick={logout}>
          Logout
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
    width: '400px',
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
    lineHeight: 1.5,
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
    marginBottom: '10px',
  },
  secondaryButton: {
    width: '100%',
    padding: '12px',
    background: '#fff',
    color: '#dc2626',
    border: '1px solid #fecaca',
    borderRadius: '10px',
    fontWeight: '700',
    cursor: 'pointer',
  },
};