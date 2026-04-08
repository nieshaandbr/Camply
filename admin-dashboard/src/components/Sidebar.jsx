import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function Sidebar() {
  const location = useLocation();
  const { logout } = useAuthStore();

  const menuItems = [
    { name: 'Home', path: '/dashboard', icon: '🏠' },
    { name: 'New Post', path: '/create-post', icon: '➕' },
    { name: 'Applicants', path: '/applications', icon: '👥' },
  ];

  return (
    <aside style={styles.sidebar}>
      <div style={styles.logoArea}>
        <h1 style={styles.logo}>CAMPLY</h1>
      </div>

      <nav style={styles.nav}>
        {menuItems.map(item => (
          <Link 
            key={item.path} 
            to={item.path} 
            style={{
              ...styles.link,
              backgroundColor: location.pathname === item.path ? '#2563eb' : 'transparent',
              color: location.pathname === item.path ? '#fff' : '#94a3b8'
            }}
          >
            {item.icon} <span style={{ marginLeft: '12px' }}>{item.name}</span>
          </Link>
        ))}
        <button onClick={logout} style={styles.logoutBtn}>Logout</button>
      </nav>

      
    </aside>
  );
}

const styles = {
  sidebar: { 
    width: '260px', 
    backgroundColor: '#0f172a', // Dark Navy
    height: '100vh', 
    position: 'fixed', 
    left: 0, 
    top: 0, 
    display: 'flex', 
    flexDirection: 'column', 
    padding: '24px' 
  },
  logo: { color: '#38bdf8', fontSize: '24px', letterSpacing: '2px' },
  nav: { flex: 1, marginTop: '40px', display: 'flex', flexDirection: 'column', gap: '8px' },
  link: { 
    padding: '12px 16px', 
    borderRadius: '8px', 
    textDecoration: 'none', 
    display: 'flex', 
    alignItems: 'center',
    transition: '0.2s'
  },
  logoutBtn: { 
    padding: '12px', 
    backgroundColor: '#ef4444', 
    color: '#fff', 
    border: 'none', 
    borderRadius: '8px', 
    cursor: 'pointer' 
  }
};