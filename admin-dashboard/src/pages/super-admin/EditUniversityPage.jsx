import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import UniversityForm from '../../components/super-admin/UniversityForm';

export default function EditUniversityPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const universityData = location.state;

  if (!universityData) {
    return (
      <div style={styles.page}>
        <p>No university data found.</p>
        <button style={styles.button} onClick={() => navigate('/super-admin/universities')}>
          Back
        </button>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Edit University</h1>
        <p style={styles.subtitle}>Update university details and main admin information.</p>

        <UniversityForm
          initialData={universityData}
          onSuccess={() => navigate('/super-admin/universities')}
        />
      </div>
    </div>
  );
}

const styles = {
  page: {
    padding: '24px',
  },
  card: {
    maxWidth: '700px',
    background: '#fff',
    borderRadius: '16px',
    padding: '24px',
    border: '1px solid #e5e7eb',
    boxShadow: '0 8px 24px rgba(0,0,0,0.05)',
  },
  title: {
    marginTop: 0,
    marginBottom: '8px',
    color: '#111827',
  },
  subtitle: {
    marginTop: 0,
    marginBottom: '24px',
    color: '#6b7280',
  },
  button: {
    padding: '12px 16px',
    border: 'none',
    borderRadius: '8px',
    background: '#1D3E6E',
    color: '#fff',
    cursor: 'pointer',
  },
};