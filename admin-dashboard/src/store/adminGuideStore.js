import { create } from 'zustand';

export const useAdminGuideStore = create((set, get) => ({
  seenGuides: {},
  isLoaded: false,

  // Load saved guide flags from browser storage.
  loadGuides: () => {
    try {
      const raw = localStorage.getItem('camply_admin_seen_guides');
      const parsed = raw ? JSON.parse(raw) : {};
      set({ seenGuides: parsed, isLoaded: true });
    } catch (error) {
      console.error('Admin guide load error:', error);
      set({ seenGuides: {}, isLoaded: true });
    }
  },

  // Mark one page guide as completed and save it.
  markGuideSeen: (guideKey) => {
    try {
      const updated = {
        ...get().seenGuides,
        [guideKey]: true,
      };

      localStorage.setItem('camply_admin_seen_guides', JSON.stringify(updated));
      set({ seenGuides: updated });
    } catch (error) {
      console.error('Admin guide save error:', error);
    }
  },
}));