import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuthStore();

  const menuItems = [
    { name: 'Home', path: '/dashboard', icon: '🏠' },
    { name: 'New Post', path: '/create-post', icon: '➕' },
    { name: 'Post History', path: '/post-history', icon: '📚' },
    { name: 'Applicants', path: '/applications', icon: '👥' },
    { name: 'Questionnaires', path: '/admin-questionnaires', icon: '📝' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside style={styles.sidebar}>
      <div style={styles.logoArea}>
        <h1 style={styles.logo}>CAMPLY</h1>
        <p style={styles.subLogo}>Admin Dashboard</p>
      </div>

      <nav style={styles.nav}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              style={{
                ...styles.link,
                backgroundColor: isActive ? '#2563eb' : 'transparent',
                color: isActive ? '#fff' : '#94a3b8',
              }}
            >
              <span>{item.icon}</span>
              <span style={{ marginLeft: '12px' }}>{item.name}</span>
            </Link>
          );
        })}

        <button onClick={handleLogout} style={styles.logoutBtn}>
          Logout
        </button>
      </nav>
    </aside>
  );
}

const styles = {
  sidebar: {
    width: '260px',
    backgroundColor: '#0f172a',
    height: '100vh',
    position: 'fixed',
    left: 0,
    top: 0,
    display: 'flex',
    flexDirection: 'column',
    padding: '24px',
    boxSizing: 'border-box',
  },
  logoArea: {
    marginBottom: '10px',
  },
  logo: {
    color: '#38bdf8',
    fontSize: '24px',
    letterSpacing: '2px',
    margin: 0,
  },
  subLogo: {
    color: '#94a3b8',
    fontSize: '12px',
    marginTop: '6px',
    marginBottom: 0,
  },
  nav: {
    flex: 1,
    marginTop: '40px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  link: {
    padding: '12px 16px',
    borderRadius: '8px',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    transition: '0.2s',
    fontWeight: '600',
  },
  logoutBtn: {
    marginTop: 'auto',
    padding: '12px',
    backgroundColor: '#ef4444',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '700',
  },
};