import React, { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase';
import { useAuthStore } from '../../store/authStore';

export default function ApplicationsPage() {
  // We use the logged-in admin so we only show applications
  // related to jobs created for that admin's university.
  const { admin } = useAuthStore();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchApplications = async () => {
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('applications')
        .select(`
          id,
          cv_url,
          status,
          created_at,
          students (
            id,
            name,
            email,
            university_id
          ),
          posts (
            id,
            title,
            university_id
          )
        `)
        .eq('posts.university_id',
          admin?.university_id)
          .order('created_at', { ascending: false });

      if (error) {
        console.error('Fetch applications error:', error);
        setApplications([]);
        return;
      }

      // Only show applications for job posts that belong to this admin's university.
      const filteredApplications = (data || []).filter(
        (application) => application.posts?.university_id === admin?.university_id
      );

      setApplications(filteredApplications);
    } catch (err) {
      console.error('Unexpected fetch applications error:', err);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const updateStatus = async (applicationId, newStatus) => {
    try {
      const { error } = await supabase
        .from('applications')
        .update({ status: newStatus })
        .eq('id', applicationId);

      if (error) {
        console.error('Update application status error:', error);
        alert('Failed to update application status.');
        return;
      }

      // Refresh the list after updating so the UI stays in sync with the database.
      fetchApplications();
    } catch (err) {
      console.error('Unexpected update status error:', err);
      alert('Something went wrong while updating the application.');
    }
  };

  if (loading) {
    return <div style={styles.loading}>Loading applications...</div>;
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>Job Applications</h1>
        <p style={styles.subtitle}>
          Review submitted student CVs and update each application status.
        </p>
      </div>

      <div style={styles.card}>
        {applications.length === 0 ? (
          <div style={styles.emptyState}>
            <h3 style={styles.emptyTitle}>No applications yet</h3>
            <p style={styles.emptyText}>
              Submitted student applications will appear here once students apply.
            </p>
          </div>
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.headerRow}>
                  <th style={styles.th}>Student</th>
                  <th style={styles.th}>Job Position</th>
                  <th style={styles.th}>CV</th>
                  <th style={styles.th}>Date</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>

              <tbody>
                {applications.map((app) => (
                  <tr key={app.id} style={styles.row}>
                    <td style={styles.td}>
                      <strong>{app.students?.name || 'Unknown Student'}</strong>
                      <br />
                      <span style={styles.smallText}>{app.students?.email || 'No email'}</span>
                    </td>

                    <td style={styles.td}>
                      {app.posts?.title || 'Unknown Job'}
                    </td>

                    <td style={styles.td}>
                      <a
                        href={app.cv_url}
                        target="_blank"
                        rel="noreferrer"
                        style={styles.link}
                      >
                        View PDF
                      </a>
                    </td>

                    <td style={styles.td}>
                      {new Date(app.created_at).toLocaleDateString()}
                    </td>

                    <td style={styles.td}>
                      <span
                        style={{
                          ...styles.statusBadge,
                          ...(app.status === 'accepted'
                            ? styles.acceptedBadge
                            : app.status === 'rejected'
                            ? styles.rejectedBadge
                            : styles.pendingBadge),
                        }}
                      >
                        {app.status}
                      </span>
                    </td>

                    <td style={styles.td}>
                      <div style={styles.actionGroup}>
                        <button
                          style={{ ...styles.actionBtn, ...styles.acceptBtn }}
                          onClick={() => updateStatus(app.id, 'accepted')}
                        >
                          Accept
                        </button>

                        <button
                          style={{ ...styles.actionBtn, ...styles.rejectBtn }}
                          onClick={() => updateStatus(app.id, 'rejected')}
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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
    fontSize: '30px',
    fontWeight: '700',
    margin: 0,
    color: '#111827',
  },

  subtitle: {
    marginTop: '8px',
    color: '#6b7280',
  },

  card: {
    background: '#ffffff',
    borderRadius: '16px',
    padding: '20px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
    border: '1px solid #e5e7eb',
  },

  tableWrapper: {
    overflowX: 'auto',
  },

  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },

  headerRow: {
    background: '#f8fafc',
    textAlign: 'left',
    borderBottom: '1px solid #e5e7eb',
  },

  th: {
    padding: '14px',
    fontSize: '13px',
    color: '#374151',
  },

  row: {
    borderBottom: '1px solid #f1f5f9',
  },

  td: {
    padding: '14px',
    verticalAlign: 'top',
    fontSize: '14px',
    color: '#111827',
  },

  smallText: {
    color: '#6b7280',
    fontSize: '12px',
  },

  link: {
    color: '#001DAF',
    fontWeight: '600',
    textDecoration: 'none',
  },

  statusBadge: {
    padding: '6px 10px',
    borderRadius: '999px',
    fontSize: '12px',
    fontWeight: '700',
    textTransform: 'capitalize',
    display: 'inline-block',
  },

  pendingBadge: {
    background: '#e0ecff',
    color: '#001DAF',
  },

  acceptedBadge: {
    background: '#dcfce7',
    color: '#166534',
  },

  rejectedBadge: {
    background: '#fee2e2',
    color: '#991b1b',
  },

  actionGroup: {
    display: 'flex',
    gap: '8px',
  },

  actionBtn: {
    border: 'none',
    borderRadius: '8px',
    padding: '8px 12px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '12px',
  },

  acceptBtn: {
    background: '#16a34a',
    color: '#fff',
  },

  rejectBtn: {
    background: '#dc2626',
    color: '#fff',
  },

  emptyState: {
    padding: '40px 20px',
    textAlign: 'center',
  },

  emptyTitle: {
    margin: 0,
    marginBottom: '8px',
    color: '#111827',
  },

  emptyText: {
    margin: 0,
    color: '#6b7280',
  },

  loading: {
    padding: '24px',
  },
};