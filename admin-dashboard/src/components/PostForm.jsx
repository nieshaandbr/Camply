import React, { useMemo, useState } from 'react';
import { supabase } from '../services/supabase';
import { useAuthStore } from '../store/authStore';

export default function PostForm() {
  // The logged-in admin is needed so the post is linked
  // to the correct university and creator.
  const { admin } = useAuthStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('announcement');
  const [ticketLink, setTicketLink] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [mediaFile, setMediaFile] = useState(null);
  const [loading, setLoading] = useState(false);

  // This creates a preview URL for the selected media file.
  // It helps the admin see the image/video before publishing.
  const mediaPreviewUrl = useMemo(() => {
    if (!mediaFile) return null;
    return URL.createObjectURL(mediaFile);
  }, [mediaFile]);

  const isVideoFile = mediaFile?.type?.startsWith('video/');

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setMediaFile(file);
  };

  const uploadMediaIfNeeded = async () => {
    // If no media was chosen, return empty values.
    if (!mediaFile) {
      return { media_url: null, media_path: null };
    }

    // Create a clean and unique file name for storage.
    const safeFileName = `${Date.now()}-${mediaFile.name.replace(/\s+/g, '-')}`;
    const filePath = `${admin.university_id}/${safeFileName}`;

    const { error: uploadError } = await supabase.storage
      .from('post-media')
      .upload(filePath, mediaFile, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`Media upload failed: ${uploadError.message}`);
    }

    const { data } = supabase.storage.from('post-media').getPublicUrl(filePath);

    return {
      media_url: data?.publicUrl || null,
      media_path: filePath,
    };
  };

  const createNotificationsForStudents = async (postType, postTitle) => {
    // Fetch all students belonging to the admin's university.
    const { data: students, error: studentsError } = await supabase
      .from('students')
      .select('id')
      .eq('university_id', admin.university_id);

    if (studentsError) {
      throw new Error(`Failed to fetch students for notifications: ${studentsError.message}`);
    }

    if (!students || students.length === 0) {
      return;
    }

    // Create one notification per student.
    const notificationRows = students.map((student) => ({
      user_id: student.id,
      message: `New ${postType} posted: ${postTitle}`,
    }));

    const { error: notificationError } = await supabase
      .from('notifications')
      .insert(notificationRows);

    if (notificationError) {
      throw new Error(`Failed to create notifications: ${notificationError.message}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!admin) {
      alert('Admin session not found. Please log in again.');
      return;
    }

    if (!title.trim()) {
      alert('Please enter a post title.');
      return;
    }

    if (!description.trim()) {
      alert('Please enter a post description.');
      return;
    }

    if (ticketLink.trim()) {
      const validLink = /^https?:\/\/.+/i.test(ticketLink.trim());
      if (!validLink) {
        alert('Ticket link must start with http:// or https://');
        return;
      }
    }

    setLoading(true);

    try {
      // Upload media first so the post can store its URL.
      const { media_url, media_path } = await uploadMediaIfNeeded();

      const payload = {
        title: title.trim(),
        description: description.trim(),
        type,
        university_id: admin.university_id,
        created_by: admin.id,
        media_url,
        media_path,
        ticket_link: ticketLink.trim() || null,
        created_at: new Date().toISOString(),
        expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
      };

      // Insert the post into the posts table.
      const { error } = await supabase.from('posts').insert([payload]);

      if (error) {
        console.error('Create post error:', error);
        alert(`Error creating post: ${error.message}`);
        return;
      }

      // After the post is created, notify students in the same university.
      await createNotificationsForStudents(type, title.trim());

      alert('Post created successfully!');

      // Reset the form after a successful submission.
      setTitle('');
      setDescription('');
      setType('announcement');
      setTicketLink('');
      setExpiresAt('');
      setMediaFile(null);
    } catch (err) {
      console.error('Unexpected create post error:', err);
      alert(err.message || 'Something went wrong while creating the post.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <div style={styles.grid}>
        <div style={styles.field}>
          <label style={styles.label}>Post Title</label>
          <input
            type="text"
            placeholder="Enter post title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={styles.input}
            required
          />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Post Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            style={styles.input}
          >
            <option value="announcement">Announcement</option>
            <option value="event">Event</option>
            <option value="job">Job</option>
          </select>
        </div>
      </div>

      <div style={styles.field}>
        <label style={styles.label}>Description</label>
        <textarea
          placeholder="Write the details of the post"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={styles.textarea}
          required
        />
      </div>

      <div style={styles.grid}>
        <div style={styles.field}>
          <label style={styles.label}>Ticket / Registration Link</label>
          <input
            type="url"
            placeholder="https://example.com"
            value={ticketLink}
            onChange={(e) => setTicketLink(e.target.value)}
            style={styles.input}
          />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Expiry Date</label>
          <input
            type="datetime-local"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
            style={styles.input}
          />
        </div>
      </div>

      <div style={styles.field}>
        <label style={styles.label}>Upload Image or Video</label>
        <input
          type="file"
          accept="image/*,video/*"
          onChange={handleFileChange}
          style={styles.fileInput}
        />
        <p style={styles.helperText}>
          You can publish with media or leave this empty for a text-only post.
        </p>
      </div>

      {mediaPreviewUrl && (
        <div style={styles.previewBox}>
          <p style={styles.previewTitle}>Preview</p>
          {isVideoFile ? (
            <video src={mediaPreviewUrl} controls style={styles.previewMedia} />
          ) : (
            <img src={mediaPreviewUrl} alt="Preview" style={styles.previewMedia} />
          )}
        </div>
      )}

      <button type="submit" disabled={loading} style={styles.button}>
        {loading ? 'Publishing...' : 'Publish Post'}
      </button>
    </form>
  );
}

const styles = {
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontWeight: '600',
    color: '#111827',
    fontSize: '14px',
  },
  input: {
    padding: '12px 14px',
    borderRadius: '10px',
    border: '1px solid #d1d5db',
    fontSize: '14px',
  },
  textarea: {
    minHeight: '140px',
    padding: '12px 14px',
    borderRadius: '10px',
    border: '1px solid #d1d5db',
    fontSize: '14px',
    resize: 'vertical',
  },
  fileInput: {
    padding: '8px 0',
  },
  helperText: {
    margin: 0,
    fontSize: '13px',
    color: '#6b7280',
  },
  previewBox: {
    border: '1px solid #e5e7eb',
    borderRadius: '14px',
    padding: '16px',
    background: '#f9fafb',
  },
  previewTitle: {
    margin: '0 0 12px 0',
    fontWeight: '600',
  },
  previewMedia: {
    width: '100%',
    maxHeight: '360px',
    objectFit: 'cover',
    borderRadius: '12px',
    background: '#000',
  },
  button: {
    padding: '14px 20px',
    background: '#001DAF',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    fontWeight: '700',
    cursor: 'pointer',
  },
};