import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useAuthStore = create((set) => ({
  user: null,
  isLoading: true,
  setUser: (user) => set({ user, isLoading: false }),
  logout: async () => {
    await AsyncStorage.removeItem('supabase_session');
    set({ user: null });
  },
  loadSession: async () => {
    const session = await AsyncStorage.getItem('supabase_session');
    if (session) {
      set({ user: JSON.parse(session), isLoading: false });
    } else {
      set({ isLoading: false });
    }
  },
}));