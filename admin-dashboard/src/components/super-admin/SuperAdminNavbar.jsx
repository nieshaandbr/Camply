import React from 'react';
import { NavLink } from 'react-router-dom';

export default function SuperAdminNavbar() {
  return (
    <aside style={styles.sidebar}>
      <div style={styles.brandWrap}>
        <h2 style={styles.brand}>Camply</h2>
        <p style={styles.subBrand}>Super Admin</p>
      </div>

      <nav style={styles.nav}>
        <NavLink
          to="/super-admin/dashboard"
          style={({ isActive }) => ({
            ...styles.link,
            ...(isActive ? styles.activeLink : {}),
          })}
        >
          Dashboard
        </NavLink>

        <NavLink
          to="/super-admin/universities"
          style={({ isActive }) => ({
            ...styles.link,
            ...(isActive ? styles.activeLink : {}),
          })}
        >
          Universities
        </NavLink>

        <NavLink
          to="/super-admin/pilot-onboarding"
          style={({ isActive }) => ({
            ...styles.link,
            ...(isActive ? styles.activeLink : {}),
          })}
        >
          Pilot Onboarding
        </NavLink>

        <NavLink
          to="/super-admin/questionnaires"
          style={({ isActive }) => ({
            ...styles.link,
            ...(isActive ? styles.activeLink : {}),
          })}
        >
          Questionnaires
        </NavLink>
      </nav>
    </aside>
  );
}

const styles = {
  sidebar: {
    width: '250px',
    minHeight: '100vh',
    background: '#1D3E6E',
    color: '#fff',
    padding: '24px 18px',
    boxSizing: 'border-box',
    position: 'fixed',
    left: 0,
    top: 0,
  },
  brandWrap: {
    marginBottom: '28px',
  },
  brand: {
    margin: 0,
    fontSize: '24px',
    fontWeight: '800',
  },
  subBrand: {
    marginTop: '6px',
    color: 'rgba(255,255,255,0.75)',
    fontSize: '13px',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  link: {
    padding: '12px 14px',
    borderRadius: '10px',
    color: '#fff',
    textDecoration: 'none',
    fontWeight: '600',
  },
  activeLink: {
    background: '#E89338',
  },
};