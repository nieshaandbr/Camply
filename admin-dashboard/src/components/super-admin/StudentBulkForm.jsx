import React, { useState } from 'react';
import { supabase } from '../../services/supabase';

export default function StudentBulkForm({ universityId, onSuccess }) {
  // Each row represents one student to be created for the selected university.
  const [rows, setRows] = useState([
    { name: '', email: '', student_number: '', password: '' },
  ]);

  const [loading, setLoading] = useState(false);

  // Generate a simple temporary password for pilot onboarding.
  const generateTempPassword = () => {
    return Math.random().toString(36).slice(-8);
  };

  // Update one field in one specific row.
  const handleRowChange = (index, field, value) => {
    const updatedRows = [...rows];
    updatedRows[index][field] = value;
    setRows(updatedRows);
  };

  // Add a new blank student row to the form.
  const addRow = () => {
    setRows([
      ...rows,
      { name: '', email: '', student_number: '', password: '' },
    ]);
  };

  // Remove a student row.
  // If the last row is removed, keep one blank row so the UI does not become empty.
  const removeRow = (index) => {
    const updatedRows = rows.filter((_, i) => i !== index);

    setRows(
      updatedRows.length
        ? updatedRows
        : [{ name: '', email: '', student_number: '', password: '' }]
    );
  };

  // Fill empty password fields with generated temporary passwords.
  // Existing typed passwords are not overwritten.
  const autoGeneratePasswords = () => {
    const updatedRows = rows.map((row) => ({
      ...row,
      password: row.password || generateTempPassword(),
    }));

    setRows(updatedRows);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // A university must be selected first, because every student belongs to one university.
    if (!universityId) {
      alert('Please select or create a university first.');
      return;
    }

    // Clean up spaces before validation and saving.
    const cleanedRows = rows.map((row) => ({
      ...row,
      name: row.name.trim(),
      email: row.email.trim(),
      student_number: row.student_number.trim(),
      password: row.password.trim(),
    }));

    // Make sure every visible row is complete.
    const hasInvalidRow = cleanedRows.some(
      (row) => !row.name || !row.email || !row.student_number || !row.password
    );

    if (hasInvalidRow) {
      alert('Please fill all student fields before saving.');
      return;
    }

    // Validate emails so broken records are not inserted.
    const hasInvalidEmail = cleanedRows.some(
      (row) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)
    );

    if (hasInvalidEmail) {
      alert('One or more student emails are invalid.');
      return;
    }

    setLoading(true);

    try {
      // Prepare payload for Supabase.
      // is_first_login = true so the student is forced to change
      // the temporary password after first login in Phase A.
      const studentPayload = cleanedRows.map((row) => ({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        university_id: universityId,
        name: row.name,
        email: row.email,
        student_number: row.student_number,
        password_hash: row.password,
        is_first_login: true,
      }));

      const { error } = await supabase.from('students').insert(studentPayload);

      if (error) {
        console.error('Student onboarding error:', error);
        alert(error.message || 'Could not add students');
        return;
      }

      alert('Students added successfully');

      // Reset the form back to one blank row after successful insert.
      setRows([{ name: '', email: '', student_number: '', password: '' }]);

      // Let parent page know the save worked, if needed.
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error('Unexpected student onboarding error:', err);
      alert('Something went wrong while adding students.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      {/* Top action buttons for quickly expanding rows and generating passwords */}
      <div style={styles.topActions}>
        <button type="button" style={styles.secondaryBtn} onClick={addRow}>
          Add Student Row
        </button>

        <button type="button" style={styles.secondaryBtn} onClick={autoGeneratePasswords}>
          Generate Temp Passwords
        </button>
      </div>

      {/* Render one form card per student row */}
      {rows.map((row, index) => (
        <div key={index} style={styles.rowCard}>
          <div style={styles.grid}>
            <input
              type="text"
              placeholder="Student full name"
              value={row.name}
              onChange={(e) => handleRowChange(index, 'name', e.target.value)}
              style={styles.input}
            />

            <input
              type="email"
              placeholder="Student email"
              value={row.email}
              onChange={(e) => handleRowChange(index, 'email', e.target.value)}
              style={styles.input}
            />

            <input
              type="text"
              placeholder="Student number"
              value={row.student_number}
              onChange={(e) => handleRowChange(index, 'student_number', e.target.value)}
              style={styles.input}
            />

            <input
              type="text"
              placeholder="Temporary password"
              value={row.password}
              onChange={(e) => handleRowChange(index, 'password', e.target.value)}
              style={styles.input}
              autoComplete="off"
            />
          </div>

          <button
            type="button"
            style={styles.removeBtn}
            onClick={() => removeRow(index)}
          >
            Remove
          </button>
        </div>
      ))}

      {/* Final submit button */}
      <button type="submit" style={styles.primaryBtn} disabled={loading}>
        {loading ? 'Saving Students...' : 'Save Students'}
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
  topActions: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
  },
  rowCard: {
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    padding: '16px',
    background: '#fff',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
    marginBottom: '12px',
  },
  input: {
    padding: '12px',
    borderRadius: '10px',
    border: '1px solid #d1d5db',
  },
  primaryBtn: {
    padding: '14px',
    background: '#1D3E6E',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    fontWeight: '700',
    cursor: 'pointer',
  },
  secondaryBtn: {
    padding: '10px 14px',
    background: '#E89338',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontWeight: '700',
    cursor: 'pointer',
  },
  removeBtn: {
    padding: '8px 12px',
    background: '#fff',
    color: '#dc2626',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    cursor: 'pointer',
  },
};