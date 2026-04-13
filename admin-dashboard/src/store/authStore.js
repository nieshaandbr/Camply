import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  admin: null,

  setAdmin: (admin) => set({ admin }),

  updateAdmin: (updatedAdmin) => {
    localStorage.setItem('camply_admin_session', JSON.stringify(updatedAdmin));
    set({ admin: updatedAdmin });
  },

  logout: () => {
    localStorage.removeItem('camply_admin_session');
    set({ admin: null });
  },

  loadSession: () => {
    const session = localStorage.getItem('camply_admin_session');
    if (session) {
      set({ admin: JSON.parse(session) });
    }
  },
}));