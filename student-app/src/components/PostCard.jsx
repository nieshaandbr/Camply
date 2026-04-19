import React, { useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import PagerView from 'react-native-pager-view';
import { VideoView, useVideoPlayer } from 'expo-video';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

/**
 * Feed-style video post.
 *
 * Why this looks more modern:
 * - nativeControls are OFF, so we do not get the bulky old player UI
 * - the video fills the post like Instagram/Reels style content
 * - user taps anywhere on the video to play/pause
 * - a subtle play icon appears when paused
 */
function VideoPost({ uri }) {
  const [isPlaying, setIsPlaying] = useState(false);

  // Keep a ref so our tap handler always has access to the current player instance.
  const playerRef = useRef(null);

  const player = useVideoPlayer(uri, (playerInstance) => {
    // Save reference so we can control play/pause manually.
    playerRef.current = playerInstance;

    // Feed videos should not loop endlessly for now.
    playerInstance.loop = false;

    // Start paused by default for a cleaner feed experience.
    playerInstance.pause();
  });

  const handleTogglePlayback = async () => {
    try {
      if (!playerRef.current) return;

      if (isPlaying) {
        playerRef.current.pause();
        setIsPlaying(false);
      } else {
        playerRef.current.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Video playback toggle error:', error);
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={handleTogglePlayback}
      style={styles.videoContainer}
    >
      <VideoView
        style={styles.media}
        player={player}
        nativeControls={false} // IMPORTANT: removes the outdated default player controls
        contentFit="cover"
      />

      {/* Subtle dark overlay gives the video a cleaner "social app" feel */}
      <View style={styles.videoShade} />

      {/* Center play icon only shows when the video is paused */}
      {!isPlaying && (
        <View style={styles.playOverlay}>
          <View style={styles.playButtonCircle}>
            <Ionicons name="play" size={26} color="#fff" style={styles.playIcon} />
          </View>
        </View>
      )}

      {/* Small helper label so users understand the interaction */}
      <View style={styles.videoHintWrap}>
        <Text style={styles.videoHintText}>
          {isPlaying ? 'Tap to pause' : 'Tap to play'}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

/**
 * Swipeable image carousel for posts with multiple images.
 */
function ImageCarousel({ mediaUrls }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  return (
    <View>
      <PagerView
        style={styles.media}
        initialPage={0}
        onPageSelected={(e) => setCurrentIndex(e.nativeEvent.position)}
      >
        {mediaUrls.map((url, index) => (
          <View key={index} style={styles.page}>
            <Image source={{ uri: url }} style={styles.media} resizeMode="cover" />
          </View>
        ))}
      </PagerView>

      {mediaUrls.length > 1 && (
        <View style={styles.dotsRow}>
          {mediaUrls.map((_, index) => (
            <View
              key={index}
              style={[styles.dot, currentIndex === index && styles.activeDot]}
            />
          ))}
        </View>
      )}
    </View>
  );
}

export default function PostCard({ post, navigation }) {
  const mediaUrl = post.media_url || '';

  /**
   * We support:
   * - legacy single media_url
   * - new media_urls array for multi-image posts
   */
  const mediaUrls = useMemo(() => {
    if (Array.isArray(post.media_urls) && post.media_urls.length > 0) {
      return post.media_urls;
    }
    return mediaUrl ? [mediaUrl] : [];
  }, [post.media_urls, mediaUrl]);

  const lowerFirstUrl = (mediaUrls[0] || '').toLowerCase();

  /**
   * For now, if a post has exactly one media item and it ends with a common video extension,
   * we treat it as a video post.
   */
  const isVideo =
    mediaUrls.length === 1 &&
    (lowerFirstUrl.endsWith('.mp4') ||
      lowerFirstUrl.endsWith('.mov') ||
      lowerFirstUrl.endsWith('.webm') ||
      lowerFirstUrl.endsWith('.m4v'));

  const handlePrimaryAction = () => {
    if (post.type === 'job') {
      navigation.navigate('JobDetail', { post });
    }
  };

  const handleTicketPress = async () => {
    if (!post.ticket_link) return;

    try {
      const supported = await Linking.canOpenURL(post.ticket_link);

      if (!supported) {
        Alert.alert('Invalid Link', 'This ticket link could not be opened.');
        return;
      }

      await Linking.openURL(post.ticket_link);
    } catch (error) {
      console.error('Ticket link error:', error);
      Alert.alert('Error', 'Could not open the ticket link.');
    }
  };

  const getTypeMeta = () => {
    switch (post.type) {
      case 'job':
        return { label: 'JOB', color: '#16a34a' };
      case 'event':
        return { label: 'EVENT', color: '#E89338' };
      default:
        return { label: 'ANNOUNCEMENT', color: '#1D3E6E' };
    }
  };

  const typeMeta = getTypeMeta();

  return (
    <View style={styles.postContainer}>
      {/* Post header */}
      <View style={styles.headerRow}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>C</Text>
        </View>

        <View style={styles.headerTextWrap}>
          <Text style={styles.adminName}>Campus Admin</Text>
          <Text style={[styles.postType, { color: typeMeta.color }]}>
            {typeMeta.label}
          </Text>
        </View>
      </View>

      {/* Media area */}
      {mediaUrls.length > 0 ? (
        isVideo ? (
          <VideoPost uri={mediaUrls[0]} />
        ) : (
          <ImageCarousel mediaUrls={mediaUrls} />
        )
      ) : (
        <View style={styles.mediaFallback}>
          <Text style={styles.fallbackText}>{post.title}</Text>
          <Text style={styles.fallbackSubtext}>No media attached</Text>
        </View>
      )}

      {/* Caption/content */}
      <View style={styles.captionArea}>
        <Text style={styles.captionTitle}>{post.title}</Text>
        <Text style={styles.description}>{post.description}</Text>
      </View>

      {/* CTA buttons */}
      <View style={styles.actionsRow}>
        {post.type === 'job' && (
          <TouchableOpacity style={styles.primaryBtn} onPress={handlePrimaryAction}>
            <Text style={styles.primaryText}>Apply Now</Text>
          </TouchableOpacity>
        )}

        {post.type === 'event' && post.ticket_link && (
          <TouchableOpacity style={styles.secondaryBtn} onPress={handleTicketPress}>
            <Text style={styles.secondaryText}>Get Tickets</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  postContainer: {
    backgroundColor: '#fff',
    marginBottom: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#eef2f7',
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },

  headerTextWrap: {
    flex: 1,
  },

  avatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#1D3E6E',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },

  avatarText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },

  adminName: {
    fontWeight: '700',
    fontSize: 14,
    color: '#111827',
  },

  postType: {
    fontSize: 12,
    marginTop: 2,
    fontWeight: '700',
  },

  media: {
    width: width,
    height: width,
    backgroundColor: '#000',
  },

  page: {
    flex: 1,
  },

  /**
   * Modern video wrapper:
   * - keeps the video clean
   * - hides giant old controls
   * - gives room for subtle overlays
   */
  videoContainer: {
    width: width,
    height: width,
    backgroundColor: '#000',
    position: 'relative',
    overflow: 'hidden',
  },

  /**
   * Light dark overlay to make the play icon and hint text feel integrated.
   */
  videoShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.08)',
  },

  /**
   * Centered play icon when paused.
   */
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },

  playButtonCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  playIcon: {
    marginLeft: 3, // nudges the triangle visually to center
  },

  /**
   * Small bottom helper text.
   */
  videoHintWrap: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },

  videoHintText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },

  dotsRow: {
    position: 'absolute',
    bottom: 12,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },

  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },

  activeDot: {
    backgroundColor: '#fff',
  },

  mediaFallback: {
    width: width,
    height: width,
    backgroundColor: '#1D3E6E',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },

  fallbackText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },

  fallbackSubtext: {
    color: 'rgba(255,255,255,0.8)',
    marginTop: 8,
    fontSize: 13,
  },

  captionArea: {
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 10,
  },

  captionTitle: {
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 6,
    color: '#111827',
  },

  description: {
    color: '#374151',
    lineHeight: 20,
    fontSize: 14,
  },

  actionsRow: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingBottom: 16,
    gap: 10,
  },

  primaryBtn: {
    backgroundColor: '#1D3E6E',
    paddingVertical: 11,
    paddingHorizontal: 16,
    borderRadius: 10,
  },

  primaryText: {
    color: '#fff',
    fontWeight: '700',
  },

  secondaryBtn: {
    backgroundColor: '#E89338',
    paddingVertical: 11,
    paddingHorizontal: 16,
    borderRadius: 10,
  },

  secondaryText: {
    color: '#fff',
    fontWeight: '700',
  },
});