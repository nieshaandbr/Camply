import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSuperAdminStore } from '../../store/superAdminStore';

export default function SuperAdminDashboardPage() {
  const { superAdmin, loadSuperAdminSession, logoutSuperAdmin } = useSuperAdminStore();
  const navigate = useNavigate();

  useEffect(() => {
    loadSuperAdminSession();
  }, []);

  const handleLogout = () => {
    logoutSuperAdmin();
    navigate('/super-admin/login');
  };

  return (
    <div style={styles.page}>
      <div style={styles.headerRow}>
        <div>
          <h1 style={styles.title}>Super Admin Dashboard</h1>
          <p style={styles.subtitle}>Manage universities and pilot onboarding.</p>
        </div>

        <button style={styles.logoutBtn} onClick={handleLogout}>
          Logout
        </button>
      </div>

      <div style={styles.cardGrid}>
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Welcome</h3>
          <p style={styles.cardText}>
            Logged in as {superAdmin?.name || 'Super Admin'}
          </p>
        </div>

        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Universities</h3>
          <p style={styles.cardText}>
            Create, edit, and manage university accounts.
          </p>
          <button
            style={styles.actionBtn}
            onClick={() => navigate('/super-admin/universities')}
          >
            Open Universities
          </button>
        </div>

        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Pilot Onboarding</h3>
          <p style={styles.cardText}>
            Add pilot universities, assign admins, and onboard students with temporary passwords.
          </p>
          <button
            style={styles.actionBtn}
            onClick={() => navigate('/super-admin/pilot-onboarding')}
          >
            Open Onboarding
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    padding: '24px',
  },
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  },
  title: {
    margin: 0,
    fontSize: '30px',
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    marginTop: '8px',
    color: '#6b7280',
  },
  logoutBtn: {
    padding: '12px 16px',
    border: 'none',
    borderRadius: '8px',
    background: '#dc2626',
    color: '#fff',
    fontWeight: '700',
    cursor: 'pointer',
  },
  cardGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
  },
  card: {
    background: '#fff',
    borderRadius: '16px',
    padding: '24px',
    border: '1px solid #e5e7eb',
    boxShadow: '0 8px 24px rgba(0,0,0,0.05)',
  },
  cardTitle: {
    marginTop: 0,
    color: '#111827',
  },
  cardText: {
    color: '#6b7280',
    marginBottom: '16px',
    lineHeight: 1.5,
  },
  actionBtn: {
    padding: '12px 16px',
    border: 'none',
    borderRadius: '8px',
    background: '#1D3E6E',
    color: '#fff',
    fontWeight: '700',
    cursor: 'pointer',
  },
};