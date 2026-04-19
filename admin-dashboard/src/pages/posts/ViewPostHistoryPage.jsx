import React, { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase';
import { useAuthStore } from '../../store/authStore';

export default function ViewPostHistoryPage() {
  const { admin } = useAuthStore();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingPostId, setSavingPostId] = useState(null);

  const fetchPosts = async () => {
    if (!admin) return;

    setLoading(true);

    try {
      // Load only posts for the logged-in admin's university.
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('university_id', admin.university_id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Fetch post history error:', error);
        alert('Could not load post history.');
        setPosts([]);
        return;
      }

      // Add a local editable expiry value for the input field.
      const mappedPosts = (data || []).map((post) => ({
        ...post,
        editableExpiresAt: post.expires_at
          ? formatDateTimeLocal(post.expires_at)
          : '',
      }));

      setPosts(mappedPosts);
    } catch (err) {
      console.error('Unexpected post history error:', err);
      alert('Something went wrong while loading posts.');
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleExpiryChange = (postId, value) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? { ...post, editableExpiresAt: value }
          : post
      )
    );
  };

  const saveExpiry = async (postId) => {
    const post = posts.find((item) => item.id === postId);
    if (!post) return;

    setSavingPostId(postId);

    try {
      const expiresAtValue = post.editableExpiresAt
        ? new Date(post.editableExpiresAt).toISOString()
        : null;

      const { error } = await supabase
        .from('posts')
        .update({ expires_at: expiresAtValue })
        .eq('id', postId);

      if (error) {
        console.error('Update expiry error:', error);
        alert('Could not update expiry date.');
        return;
      }

      alert('Post expiry updated successfully.');
      fetchPosts();
    } catch (err) {
      console.error('Unexpected update expiry error:', err);
      alert('Something went wrong while updating expiry.');
    } finally {
      setSavingPostId(null);
    }
  };

  const deletePost = async (postId) => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this post? This cannot be undone.'
    );

    if (!confirmDelete) return;

    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);

      if (error) {
        console.error('Delete post error:', error);
        alert('Could not delete post.');
        return;
      }

      alert('Post deleted successfully.');
      fetchPosts();
    } catch (err) {
      console.error('Unexpected delete post error:', err);
      alert('Something went wrong while deleting the post.');
    }
  };

  const now = new Date().toISOString();

  if (loading) {
    return <div style={styles.loading}>Loading post history...</div>;
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>Post History</h1>
        <p style={styles.subtitle}>
          View, update, and delete posts for your university.
        </p>
      </div>

      <div style={styles.card}>
        {posts.length === 0 ? (
          <div style={styles.emptyState}>
            <h3 style={styles.emptyTitle}>No posts yet</h3>
            <p style={styles.emptyText}>
              Posts you create will appear here.
            </p>
          </div>
        ) : (
          <div style={styles.list}>
            {posts.map((post) => {
              const isExpired =
                post.expires_at && post.expires_at <= now;

              return (
                <div key={post.id} style={styles.postCard}>
                  <div style={styles.postTopRow}>
                    <div>
                      <h3 style={styles.postTitle}>{post.title}</h3>
                      <p style={styles.postMeta}>
                        Type: <strong>{post.type}</strong>
                      </p>
                      <p style={styles.postMeta}>
                        Created: {new Date(post.created_at).toLocaleString()}
                      </p>
                      <p
                        style={{
                          ...styles.statusBadge,
                          ...(isExpired
                            ? styles.expiredBadge
                            : styles.activeBadge),
                        }}
                      >
                        {isExpired ? 'Expired' : 'Active'}
                      </p>
                    </div>
                  </div>

                  <p style={styles.description}>{post.description}</p>

                  <div style={styles.expiryRow}>
                    <div style={styles.expiryField}>
                      <label style={styles.label}>Expiry Date</label>
                      <input
                        type="datetime-local"
                        value={post.editableExpiresAt}
                        onChange={(e) =>
                          handleExpiryChange(post.id, e.target.value)
                        }
                        style={styles.input}
                      />
                    </div>

                    <button
                      style={styles.saveBtn}
                      onClick={() => saveExpiry(post.id)}
                      disabled={savingPostId === post.id}
                    >
                      {savingPostId === post.id ? 'Saving...' : 'Save Expiry'}
                    </button>

                    <button
                      style={styles.deleteBtn}
                      onClick={() => deletePost(post.id)}
                    >
                      Delete Post
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function formatDateTimeLocal(value) {
  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60000);
  return localDate.toISOString().slice(0, 16);
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
  card: {
    background: '#fff',
    borderRadius: '16px',
    padding: '20px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
    border: '1px solid #e5e7eb',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },
  postCard: {
    border: '1px solid #e5e7eb',
    borderRadius: '14px',
    padding: '18px',
    background: '#fff',
  },
  postTopRow: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '16px',
    marginBottom: '10px',
  },
  postTitle: {
    margin: 0,
    marginBottom: '8px',
    color: '#111827',
  },
  postMeta: {
    margin: '4px 0',
    color: '#6b7280',
    fontSize: '14px',
  },
  description: {
    color: '#374151',
    lineHeight: 1.6,
    marginBottom: '18px',
  },
  statusBadge: {
    display: 'inline-block',
    padding: '6px 10px',
    borderRadius: '999px',
    fontSize: '12px',
    fontWeight: '700',
    marginTop: '8px',
  },
  activeBadge: {
    background: '#dcfce7',
    color: '#166534',
  },
  expiredBadge: {
    background: '#fee2e2',
    color: '#991b1b',
  },
  expiryRow: {
    display: 'flex',
    alignItems: 'end',
    gap: '12px',
    flexWrap: 'wrap',
  },
  expiryField: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    minWidth: '260px',
  },
  label: {
    fontWeight: '600',
    color: '#111827',
    fontSize: '14px',
  },
  input: {
    padding: '12px',
    borderRadius: '10px',
    border: '1px solid #d1d5db',
  },
  saveBtn: {
    padding: '12px 14px',
    background: '#1D3E6E',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    fontWeight: '700',
    cursor: 'pointer',
  },
  deleteBtn: {
    padding: '12px 14px',
    background: '#dc2626',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    fontWeight: '700',
    cursor: 'pointer',
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