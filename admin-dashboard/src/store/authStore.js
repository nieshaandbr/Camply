import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  admin: null,
  isLoading: true,

  // Save admin in state
  setAdmin: (admin) => set({ admin, isLoading: false }),

  // Update admin after password reset or profile changes
  updateAdmin: (updatedAdmin) => {
    localStorage.setItem('camply_admin_session', JSON.stringify(updatedAdmin));
    set({ admin: updatedAdmin, isLoading: false });
  },

  // Remove session completely
  logout: () => {
    localStorage.removeItem('camply_admin_session');
    set({ admin: null, isLoading: false });
  },

  // Restore session from localStorage on app start / refresh
  loadSession: () => {
    try {
      const session = localStorage.getItem('camply_admin_session');

      if (session) {
        set({
          admin: JSON.parse(session),
          isLoading: false,
        });
      } else {
        set({
          admin: null,
          isLoading: false,
        });
      }
    } catch (error) {
      console.error('Admin session load error:', error);
      set({
        admin: null,
        isLoading: false,
      });
    }
  },
}));