import React, { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase';

export default function UniversityForm({ initialData = null, onSuccess }) {
  const [universityName, setUniversityName] = useState('');
  const [location, setLocation] = useState('');
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const isEditMode = !!initialData;

  useEffect(() => {
    if (initialData) {
      setUniversityName(initialData.name || '');
      setLocation(initialData.location || '');
      setAdminName(initialData.admin_name || '');
      setAdminEmail(initialData.admin_email || '');
    }
  }, [initialData]);

  const generateTextId = () => Date.now().toString();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!universityName.trim()) {
      alert('University name is required');
      return;
    }

    if (!adminName.trim()) {
      alert('Admin name is required');
      return;
    }

    if (!adminEmail.trim()) {
      alert('Admin email is required');
      return;
    }

    if (!isEditMode && !adminPassword.trim()) {
      alert('Admin password is required');
      return;
    }

    setLoading(true);

    try {
      if (isEditMode) {
        const { error: universityError } = await supabase
          .from('universities')
          .update({
            name: universityName.trim(),
            location: location.trim() || null,
          })
          .eq('id', initialData.id);

        if (universityError) {
          throw new Error(universityError.message);
        }

        const { error: adminError } = await supabase
          .from('admins')
          .update({
            name: adminName.trim(),
            email: adminEmail.trim(),
          })
          .eq('id', initialData.admin_id);

        if (adminError) {
          throw new Error(adminError.message);
        }

        alert('University updated successfully');
      } else {
        const universityId = generateTextId();
        const adminId = generateTextId();

        const { error: universityError } = await supabase
          .from('universities')
          .insert([
            {
              id: universityId,
              name: universityName.trim(),
              location: location.trim() || null,
            },
          ]);

        if (universityError) {
          throw new Error(universityError.message);
        }

        const { error: adminError } = await supabase
          .from('admins')
          .insert([
            {
              id: adminId,
              university_id: universityId,
              name: adminName.trim(),
              email: adminEmail.trim(),
              role: 'admin',
              password_hash: adminPassword.trim(),
            },
          ]);

        if (adminError) {
          throw new Error(adminError.message);
        }

        alert('University and admin created successfully');
      }

      if (onSuccess) onSuccess();
    } catch (err) {
      console.error('University form error:', err);
      alert(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <div style={styles.field}>
        <label style={styles.label}>University Name</label>
        <input
          value={universityName}
          onChange={(e) => setUniversityName(e.target.value)}
          style={styles.input}
          placeholder="University name"
        />
      </div>

      <div style={styles.field}>
        <label style={styles.label}>Location</label>
        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          style={styles.input}
          placeholder="City / Province"
        />
      </div>

      <div style={styles.field}>
        <label style={styles.label}>Main Admin Name</label>
        <input
          value={adminName}
          onChange={(e) => setAdminName(e.target.value)}
          style={styles.input}
          placeholder="Admin full name"
        />
      </div>

      <div style={styles.field}>
        <label style={styles.label}>Main Admin Email</label>
        <input
          type="email"
          value={adminEmail}
          onChange={(e) => setAdminEmail(e.target.value)}
          style={styles.input}
          placeholder="admin@university.com"
        />
      </div>

      {!isEditMode && (
        <div style={styles.field}>
          <label style={styles.label}>Main Admin Password</label>
          <input
            type="password"
            value={adminPassword}
            onChange={(e) => setAdminPassword(e.target.value)}
            style={styles.input}
            placeholder="Temporary password"
          />
        </div>
      )}

      <button type="submit" style={styles.button} disabled={loading}>
        {loading
          ? isEditMode
            ? 'Updating...'
            : 'Creating...'
          : isEditMode
          ? 'Update University'
          : 'Create University'}
      </button>
    </form>
  );
}

const styles = {
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontWeight: '600',
    color: '#111827',
  },
  input: {
    padding: '12px',
    borderRadius: '10px',
    border: '1px solid #d1d5db',
  },
  button: {
    padding: '14px',
    background: '#1D3E6E',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    fontWeight: '700',
    cursor: 'pointer',
  },
};