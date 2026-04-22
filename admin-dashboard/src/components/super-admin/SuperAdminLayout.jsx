import React from 'react';
import SuperAdminNavbar from './SuperAdminNavbar';

export default function SuperAdminLayout({ children }) {
  return (
    <div style={styles.wrapper}>
      <SuperAdminNavbar />
      <main style={styles.main}>{children}</main>
    </div>
  );
}

const styles = {
  wrapper: {
    display: 'flex',
    minHeight: '100vh',
    background: '#f8fafc',
  },
  main: {
    marginLeft: '250px',
    flex: 1,
    padding: '32px',
    boxSizing: 'border-box',
  },
};