import React from 'react';
import PostForm from '../../components/PostForm';
import { useAdminGuideStore } from '../../store/adminGuideStore';
import AdminGuideOverlay from '../../components/guide/AdminGuideOverlay';

export default function CreatePostPage() {
  const { seenGuides, isLoaded, loadGuides, markGuideSeen } = useAdminGuideStore();

  React.useEffect(() => {
    loadGuides();
  }, []);

  const showGuide = isLoaded && !seenGuides.create_post;

  return (
    <div style={styles.page}>
      <AdminGuideOverlay
        visible={showGuide}
        title="Create Post Guide"
        steps={[
          {
            heading: 'Post Details',
            description:
              'Use this page to publish announcements, events, or jobs for students in your university.',
          },
          {
            heading: 'Media Upload',
            description:
              'You can upload images, multiple images, or a single video depending on the content you want to share.',
          },
          {
            heading: 'Ticket Link and Expiry',
            description:
              'For events, add a link if students need tickets. Use expiry so outdated content disappears automatically.',
          },
        ]}
        onFinish={() => markGuideSeen('create_post')}
      />

      <div style={styles.header}>
        <h1 style={styles.title}>Create New Post</h1>
        <p style={styles.subtitle}>
          Publish announcements, events, and job opportunities for students.
        </p>
      </div>

      <div style={styles.layout}>
        <div style={styles.mainCard}>
          <PostForm />
        </div>

        <div style={styles.sidePanel}>
          <div style={styles.tipCard}>
            <h3 style={styles.tipTitle}>Quick Guide</h3>
            <ul style={styles.tipList}>
              <li><strong>Announcement:</strong> General campus updates.</li>
              <li><strong>Event:</strong> Add a ticket or registration link if needed.</li>
              <li><strong>Job:</strong> Use for internships and opportunities.</li>
              <li><strong>Expiry:</strong> Stops old posts from showing in the student feed.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    width: '100%',
    padding: '24px',
    boxSizing: 'border-box',
  },
  header: {
    marginBottom: '24px',
  },
  title: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#111827',
    margin: 0,
  },
  subtitle: {
    marginTop: '8px',
    color: '#6b7280',
  },
  layout: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) 300px',
    gap: '24px',
    alignItems: 'start',
  },
  mainCard: {
    background: '#fff',
    borderRadius: '16px',
    padding: '28px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
    border: '1px solid #e5e7eb',
  },
  sidePanel: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  tipCard: {
    background: '#fff',
    borderRadius: '16px',
    padding: '20px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.04)',
    border: '1px solid #e5e7eb',
  },
  tipTitle: {
    margin: '0 0 12px 0',
    fontSize: '18px',
  },
  tipList: {
    margin: 0,
    paddingLeft: '18px',
    color: '#374151',
    lineHeight: 1.7,
  },
};