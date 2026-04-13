import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useAuthStore = create((set) => ({
  user: null,
  isLoading: true,

  setUser: async (user) => {
    await AsyncStorage.setItem('camply_session', JSON.stringify(user));
    set({ user, isLoading: false });
  },

  updateUser: async (updatedUser) => {
    await AsyncStorage.setItem('camply_session', JSON.stringify(updatedUser));
    set({ user: updatedUser });
  },

  logout: async () => {
    await AsyncStorage.removeItem('camply_session');
    set({ user: null });
  },

  loadSession: async () => {
    try {
      const session = await AsyncStorage.getItem('camply_session');

      if (session) {
        set({ user: JSON.parse(session), isLoading: false });
      } else {
        set({ user: null, isLoading: false });
      }
    } catch (error) {
      console.error('Session load error:', error);
      set({ user: null, isLoading: false });
    }
  },
}));