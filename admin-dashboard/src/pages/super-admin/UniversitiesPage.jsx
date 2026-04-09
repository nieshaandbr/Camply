import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import UniversityForm from '../../components/super-admin/UniversityForm';

export default function UniversitiesPage() {
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchUniversities = async () => {
    setLoading(true);

    try {
      const { data: universityData, error: universityError } = await supabase
        .from('universities')
        .select('*')
        .order('created_at', { ascending: false });

      if (universityError) {
        throw new Error(universityError.message);
      }

      const { data: adminsData, error: adminsError } = await supabase
        .from('admins')
        .select('*');

      if (adminsError) {
        throw new Error(adminsError.message);
      }

      const combined = (universityData || []).map((uni) => {
        const mainAdmin = (adminsData || []).find(
          (admin) => admin.university_id === uni.id && admin.role === 'admin'
        );

        return {
          ...uni,
          admin_id: mainAdmin?.id || null,
          admin_name: mainAdmin?.name || 'No admin assigned',
          admin_email: mainAdmin?.email || 'No admin email',
        };
      });

      setUniversities(combined);
    } catch (err) {
      console.error('Fetch universities error:', err);
      alert(err.message || 'Failed to load universities');
      setUniversities([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUniversities();
  }, []);

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>Universities</h1>
        <p style={styles.subtitle}>Create and manage university accounts.</p>
      </div>

      <div style={styles.layout}>
        <div style={styles.formCard}>
          <h2 style={styles.sectionTitle}>Add New University</h2>
          <UniversityForm onSuccess={fetchUniversities} />
        </div>

        <div style={styles.listCard}>
          <h2 style={styles.sectionTitle}>Existing Universities</h2>

          {loading ? (
            <p>Loading universities...</p>
          ) : universities.length === 0 ? (
            <p>No universities found.</p>
          ) : (
            <div style={styles.list}>
              {universities.map((uni) => (
                <div key={uni.id} style={styles.uniCard}>
                  <div>
                    <h3 style={styles.uniTitle}>{uni.name}</h3>
                    <p style={styles.uniMeta}>Location: {uni.location || 'Not set'}</p>
                    <p style={styles.uniMeta}>Admin: {uni.admin_name}</p>
                    <p style={styles.uniMeta}>Email: {uni.admin_email}</p>
                  </div>

                  <button
                    style={styles.editButton}
                    onClick={() =>
                      navigate(`/super-admin/universities/${uni.id}`, {
                        state: uni,
                      })
                    }
                  >
                    Edit
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    padding: '24px',
  },
  header: {
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
  layout: {
    display: 'grid',
    gridTemplateColumns: '420px 1fr',
    gap: '24px',
    alignItems: 'start',
  },
  formCard: {
    background: '#fff',
    borderRadius: '16px',
    padding: '24px',
    border: '1px solid #e5e7eb',
    boxShadow: '0 8px 24px rgba(0,0,0,0.05)',
  },
  listCard: {
    background: '#fff',
    borderRadius: '16px',
    padding: '24px',
    border: '1px solid #e5e7eb',
    boxShadow: '0 8px 24px rgba(0,0,0,0.05)',
  },
  sectionTitle: {
    marginTop: 0,
    marginBottom: '20px',
    color: '#111827',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  uniCard: {
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    padding: '16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '16px',
  },
  uniTitle: {
    margin: 0,
    marginBottom: '8px',
    color: '#111827',
  },
  uniMeta: {
    margin: '4px 0',
    color: '#6b7280',
    fontSize: '14px',
  },
  editButton: {
    padding: '10px 16px',
    border: 'none',
    borderRadius: '8px',
    background: '#E89338',
    color: '#fff',
    fontWeight: '700',
    cursor: 'pointer',
  },
};