import { create } from 'zustand';

export const useSuperAdminStore = create((set) => ({
    superAdmin: null,

    setSuperAdmin: (superAdmin) => set({ superAdmin }),
    logoutSuperAdmin: () => {
        localStorage.removeItem('camply_super_admin_session');
        set({ superAdmin: null});
    },

    loadSuperAdminSession: () => {
        const session = localStorage.getItem('camply_super_admin_session');
        if (session) {
            set({ superAdmin: JSON.parse(session)});
        }
    }
}));