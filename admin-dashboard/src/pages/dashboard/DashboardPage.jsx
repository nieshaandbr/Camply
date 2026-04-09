import React, { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase';
import { useAuthStore } from '../../store/authStore';

export default function DashboardPage() {
  const { admin } = useAuthStore();

  const [stats, setStats] = useState({
    totalPosts: 0,
    activePosts: 0,
    totalApplications: 0,
    accepted: 0,
    rejected: 0,
    pending: 0,
  });

  const [recentPosts, setRecentPosts] = useState([]);
  const [recentApplications, setRecentApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    if (!admin) return;

    setLoading(true);

    try {
      const now = new Date().toISOString();

      // POSTS
      const { data: posts } = await supabase
        .from('posts')
        .select('*')
        .eq('university_id', admin.university_id);

      const activePosts =
        posts?.filter(
          (p) => !p.expires_at || p.expires_at > now
        ) || [];

      // APPLICATIONS (with joins)
      const { data: applications } = await supabase
        .from('applications')
        .select(`
          id,
          status,
          created_at,
          posts ( university_id, title ),
          students ( name )
        `);

      const filteredApps =
        applications?.filter(
          (a) => a.posts?.university_id === admin.university_id
        ) || [];

      const accepted = filteredApps.filter(a => a.status === 'accepted').length;
      const rejected = filteredApps.filter(a => a.status === 'rejected').length;
      const pending = filteredApps.filter(a => a.status === 'pending').length;

      setStats({
        totalPosts: posts?.length || 0,
        activePosts: activePosts.length,
        totalApplications: filteredApps.length,
        accepted,
        rejected,
        pending,
      });

      // RECENT POSTS
      setRecentPosts(
        (posts || [])
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 5)
      );

      // RECENT APPLICATIONS
      setRecentApplications(
        filteredApps
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 5)
      );

    } catch (err) {
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) return <div style={styles.loading}>Loading dashboard...</div>;

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>Dashboard</h1>

      {/* STATS */}
      <div style={styles.statsGrid}>
        <StatCard title="Total Posts" value={stats.totalPosts} />
        <StatCard title="Active Posts" value={stats.activePosts} />
        <StatCard title="Applications" value={stats.totalApplications} />
        <StatCard title="Accepted" value={stats.accepted} color="#16a34a" />
        <StatCard title="Rejected" value={stats.rejected} color="#dc2626" />
        <StatCard title="Pending" value={stats.pending} color="#E89338" />
      </div>

      {/* RECENT POSTS */}
      <div style={styles.section}>
        <h2>Recent Posts</h2>
        {recentPosts.map(post => (
          <div key={post.id} style={styles.cardRow}>
            <strong>{post.title}</strong>
            <span>{post.type}</span>
          </div>
        ))}
      </div>

      {/* RECENT APPLICATIONS */}
      <div style={styles.section}>
        <h2>Recent Applications</h2>
        {recentApplications.map(app => (
          <div key={app.id} style={styles.cardRow}>
            <strong>{app.students?.name || 'Student'}</strong>
            <span>{app.posts?.title}</span>
            <span style={styles.status}>{app.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatCard({ title, value, color = '#1D3E6E' }) {
  return (
    <div style={{ ...styles.statCard, borderTop: `4px solid ${color}` }}>
      <p style={styles.statTitle}>{title}</p>
      <h2 style={styles.statValue}>{value}</h2>
    </div>
  );
}

const styles = {
  page: { padding: '24px' },

  title: {
    fontSize: '28px',
    fontWeight: '700',
    marginBottom: '20px',
  },

  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '20px',
    marginBottom: '30px',
  },

  statCard: {
    background: '#fff',
    padding: '20px',
    borderRadius: '12px',
    boxShadow: '0 6px 20px rgba(0,0,0,0.05)',
  },

  statTitle: {
    color: '#6b7280',
    marginBottom: '8px',
  },

  statValue: {
    fontSize: '28px',
    margin: 0,
  },

  section: {
    marginBottom: '30px',
    background: '#fff',
    padding: '20px',
    borderRadius: '12px',
    boxShadow: '0 6px 20px rgba(0,0,0,0.05)',
  },

  cardRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '10px 0',
    borderBottom: '1px solid #eee',
  },

  status: {
    textTransform: 'capitalize',
    fontWeight: '600',
  },

  loading: {
    padding: '40px',
  },
};