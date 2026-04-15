import React, { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase';
import UniversityForm from '../../components/super-admin/UniversityForm';
import StudentBulkForm from '../../components/super-admin/StudentBulkForm';
import { useAdminGuideStore } from '../../store/adminGuideStore';
import AdminGuideOverlay from '../../components/guide/AdminGuideOverlay';

export default function PilotOnboardingPage() {
  const { seenGuides, isLoaded, loadGuides, markGuideSeen } = useAdminGuideStore();

  const [universities, setUniversities] = useState([]);
  const [selectedUniversityId, setSelectedUniversityId] = useState('');
  const [loadingUniversities, setLoadingUniversities] = useState(true);

  const fetchUniversities = async () => {
    setLoadingUniversities(true);

    try {
      const { data, error } = await supabase
        .from('universities')
        .select('id, name')
        .order('name', { ascending: true });

      if (error) {
        console.error('Fetch universities error:', error);
        alert('Could not load universities');
      } else {
        setUniversities(data || []);
      }
    } catch (err) {
      console.error('Unexpected fetch universities error:', err);
      alert('Something went wrong while loading universities');
    } finally {
      setLoadingUniversities(false);
    }
  };

  useEffect(() => {
    fetchUniversities();
    loadGuides();
  }, []);

  const showGuide = isLoaded && !seenGuides.pilot_onboarding;

  return (
    <div style={styles.page}>
      <AdminGuideOverlay
        visible={showGuide}
        title="Pilot Onboarding Guide"
        steps={[
          {
            heading: 'Step 1 — Create University',
            description:
              'Start by creating the pilot university and assigning its main admin account.',
          },
          {
            heading: 'Step 2 — Add Students',
            description:
              'After the university exists, select it and add students with temporary passwords for pilot onboarding.',
          },
          {
            heading: 'Temporary Passwords',
            description:
              'Use generated temporary passwords so users can log in once and then create their own secure passwords.',
          },
        ]}
        onFinish={() => markGuideSeen('pilot_onboarding')}
      />

      <div style={styles.header}>
        <h1 style={styles.title}>Pilot Onboarding</h1>
        <p style={styles.subtitle}>
          Create a university, assign the main admin, and onboard students with temporary passwords.
        </p>
      </div>

      <div style={styles.layout}>
        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>Step 1 — Create University + Main Admin</h2>
          <UniversityForm onSuccess={fetchUniversities} />
        </div>

        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>Step 2 — Add Students</h2>

          {loadingUniversities ? (
            <p>Loading universities...</p>
          ) : (
            <>
              <select
                value={selectedUniversityId}
                onChange={(e) => setSelectedUniversityId(e.target.value)}
                style={styles.select}
              >
                <option value="">Select university</option>
                {universities.map((uni) => (
                  <option key={uni.id} value={uni.id}>
                    {uni.name}
                  </option>
                ))}
              </select>

              <StudentBulkForm
                universityId={selectedUniversityId}
                onSuccess={() => {}}
              />
            </>
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
    lineHeight: 1.5,
  },
  layout: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '24px',
    alignItems: 'start',
  },
  card: {
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
  select: {
    width: '100%',
    padding: '12px',
    borderRadius: '10px',
    border: '1px solid #d1d5db',
    marginBottom: '16px',
  },
};