import React, { useMemo, useState } from 'react';
import { supabase } from '../services/supabase';
import { useAuthStore } from '../store/authStore';
import { sendPushNotifications } from '../services/pushNotifications';

export default function PostForm() {
  const { admin } = useAuthStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('announcement');
  const [ticketLink, setTicketLink] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [mediaFiles, setMediaFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  const previewUrls = useMemo(() => {
    return mediaFiles.map((file) => URL.createObjectURL(file));
  }, [mediaFiles]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);

    if (!files.length) {
      setMediaFiles([]);
      return;
    }

    const hasVideo = files.some((file) => file.type.startsWith('video/'));

    if (hasVideo && files.length > 1) {
      alert('For now, video posts can only have one video file.');
      return;
    }

    const hasTooLargeFile = files.some((file) => file.size > 20 * 1024 * 1024);

    if (hasTooLargeFile) {
      alert('Each media file must be smaller than 20MB.');
      return;
    }

    if (files.length > 5) {
      alert('Maximum 5 media files per post for now.');
      return;
    }

    setMediaFiles(files);
  };

  const uploadMediaIfNeeded = async () => {
    if (!mediaFiles.length) {
      return {
        media_url: null,
        media_path: null,
        media_urls: [],
      };
    }

    const uploadedUrls = [];
    const uploadedPaths = [];

    for (const file of mediaFiles) {
      const safeFileName = `${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 7)}-${file.name.replace(/\s+/g, '-')}`;

      const filePath = `${admin.university_id}/${safeFileName}`;

      const { error: uploadError } = await supabase.storage
        .from('post-media')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        throw new Error(`Media upload failed: ${uploadError.message}`);
      }

      const { data } = supabase.storage.from('post-media').getPublicUrl(filePath);

      uploadedUrls.push(data?.publicUrl || null);
      uploadedPaths.push(filePath);
    }

    return {
      media_url: uploadedUrls[0] || null,
      media_path: uploadedPaths[0] || null,
      media_urls: uploadedUrls,
    };
  };

  /**
   * Create in-app notifications and send push notifications to every student
   * in the admin's university after a post is published.
   */
  const createNotificationsForStudents = async (postType, postTitle, createdPostId) => {
    const { data: students, error: studentsError } = await supabase
      .from('students')
      .select('id, push_token')
      .eq('university_id', admin.university_id);

    if (studentsError) {
      throw new Error(`Failed to fetch students for notifications: ${studentsError.message}`);
    }

    if (!students?.length) return;

    const notificationRows = students.map((student) => ({
      user_id: student.id,
      title: 'New campus update',
      message: postTitle,
      notification_type: 'post',
      reference_type: 'post',
      reference_id: createdPostId,
    }));

    const { error: notificationError } = await supabase
      .from('notifications')
      .insert(notificationRows);

    if (notificationError) {
      throw new Error(`Failed to create notifications: ${notificationError.message}`);
    }

    const pushTokens = students.map((student) => student.push_token).filter(Boolean);

    await sendPushNotifications(
      pushTokens,
      'Camply',
      `New ${postType} posted: ${postTitle}`,
      {
        notificationType: 'post',
        referenceType: 'post',
        referenceId: createdPostId,
      }
    );
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
      const { media_url, media_path, media_urls } = await uploadMediaIfNeeded();

      const payload = {
        title: title.trim(),
        description: description.trim(),
        type,
        university_id: admin.university_id,
        created_by: admin.id,
        media_url,
        media_path,
        media_urls,
        ticket_link: ticketLink.trim() || null,
        created_at: new Date().toISOString(),
        expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
      };

      // We select the inserted row back so we can use the new post ID in notifications.
      const { data: insertedPosts, error } = await supabase
        .from('posts')
        .insert([payload])
        .select();

      if (error) {
        console.error('Create post error:', error);
        alert(`Error creating post: ${error.message}`);
        return;
      }

      const createdPost = insertedPosts?.[0];

      await createNotificationsForStudents(type, title.trim(), createdPost?.id);

      alert('Post created successfully!');
      setTitle('');
      setDescription('');
      setType('announcement');
      setTicketLink('');
      setExpiresAt('');
      setMediaFiles([]);
    } catch (err) {
      console.error('Unexpected create post error:', err);
      alert(err.message || 'Something went wrong while creating the post.');
    } finally {
      setLoading(false);
    }
  };

  const isVideoPost =
    mediaFiles.length === 1 && mediaFiles[0]?.type?.startsWith('video/');

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
        <label style={styles.label}>Upload Media</label>
        <input
          type="file"
          accept="image/*,video/*"
          multiple
          onChange={handleFileChange}
          style={styles.fileInput}
        />
        <p style={styles.helperText}>
          You can upload up to 5 images, or 1 video. Each file must be smaller than 20MB.
        </p>
      </div>

      {!!previewUrls.length && (
        <div style={styles.previewBox}>
          <p style={styles.previewTitle}>Preview</p>

          {isVideoPost ? (
            <video src={previewUrls[0]} controls style={styles.previewMedia} />
          ) : (
            <div style={styles.previewGrid}>
              {previewUrls.map((url, index) => (
                <img
                  key={index}
                  src={url}
                  alt={`Preview ${index + 1}`}
                  style={styles.previewImage}
                />
              ))}
            </div>
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
  previewGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px',
  },
  previewImage: {
    width: '100%',
    height: '180px',
    objectFit: 'cover',
    borderRadius: '12px',
    background: '#000',
  },
  button: {
    padding: '14px 20px',
    background: '#1D3E6E',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    fontWeight: '700',
    cursor: 'pointer',
  },
};