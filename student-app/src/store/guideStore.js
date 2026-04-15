import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useGuideStore = create((set, get) => ({
  seenGuides: {},
  isLoaded: false,

  // Load saved guide completion flags from device storage
  loadGuides: async () => {
    try {
      const raw = await AsyncStorage.getItem('camply_seen_guides');
      const parsed = raw ? JSON.parse(raw) : {};
      set({ seenGuides: parsed, isLoaded: true });
    } catch (error) {
      console.error('Guide load error:', error);
      set({ seenGuides: {}, isLoaded: true });
    }
  },

  // Mark a screen guide as seen and save it
  markGuideSeen: async (guideKey) => {
    try {
      const updated = {
        ...get().seenGuides,
        [guideKey]: true,
      };

      await AsyncStorage.setItem('camply_seen_guides', JSON.stringify(updated));
      set({ seenGuides: updated });
    } catch (error) {
      console.error('Guide save error:', error);
    }
  },
}));