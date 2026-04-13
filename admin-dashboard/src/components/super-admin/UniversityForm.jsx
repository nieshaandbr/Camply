import React, { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase';

export default function UniversityForm({ initialData = null, onSuccess }) {
  // Form state
  const [universityName, setUniversityName] = useState('');
  const [location, setLocation] = useState('');
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // If initialData exists, we are editing an existing university
  const isEditMode = !!initialData;

  useEffect(() => {
    if (initialData) {
      // Pre-fill form when editing
      setUniversityName(initialData.name || '');
      setLocation(initialData.location || '');
      setAdminName(initialData.admin_name || '');
      setAdminEmail(initialData.admin_email || '');
    }
  }, [initialData]);

  // Simple text ID generator for pilot mode
  const generateTextId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
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

    // Validate email format
    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adminEmail.trim());
    if (!validEmail) {
      alert('Enter a valid email address');
      return;
    }

    // Password is required only when creating a new university/admin
    if (!isEditMode && !adminPassword.trim()) {
      alert('Admin password is required');
      return;
    }

    setLoading(true);

    try {
      if (isEditMode) {
        // -----------------------------
        // UPDATE EXISTING UNIVERSITY
        // -----------------------------
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

        // -----------------------------
        // UPDATE EXISTING MAIN ADMIN
        // -----------------------------
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
        // -----------------------------
        // CREATE NEW UNIVERSITY
        // -----------------------------
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

        // -----------------------------
        // CREATE MAIN ADMIN
        // is_first_login = true so Phase A can force password reset
        // -----------------------------
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
              is_first_login: true,
            },
          ]);

        if (adminError) {
          throw new Error(adminError.message);
        }

        alert('University and admin created successfully');

        // Reset form after successful create
        setUniversityName('');
        setLocation('');
        setAdminName('');
        setAdminEmail('');
        setAdminPassword('');
      }

      // Tell parent page to refresh its data if needed
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
      {/* University Name */}
      <div style={styles.field}>
        <label style={styles.label}>University Name</label>
        <input
          value={universityName}
          onChange={(e) => setUniversityName(e.target.value)}
          style={styles.input}
          placeholder="University name"
        />
      </div>

      {/* University Location */}
      <div style={styles.field}>
        <label style={styles.label}>Location</label>
        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          style={styles.input}
          placeholder="City / Province"
        />
      </div>

      {/* Main Admin Name */}
      <div style={styles.field}>
        <label style={styles.label}>Main Admin Name</label>
        <input
          value={adminName}
          onChange={(e) => setAdminName(e.target.value)}
          style={styles.input}
          placeholder="Admin full name"
        />
      </div>

      {/* Main Admin Email */}
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

      {/* Main Admin Temporary Password
          Only show this when creating a new university/admin.
          We use type="text" on purpose so pilot onboarding is easier to see and confirm. */}
      {!isEditMode && (
        <div style={styles.field}>
          <label style={styles.label}>Main Admin Temporary Password</label>
          <input
            type="text"
            value={adminPassword}
            onChange={(e) => setAdminPassword(e.target.value)}
            style={styles.input}
            placeholder="Temporary password"
            autoComplete="off"
          />
        </div>
      )}

      {/* Submit button */}
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