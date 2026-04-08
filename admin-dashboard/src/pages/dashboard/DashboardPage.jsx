import React from 'react';
import { useAuthStore } from '../../store/authStore';

export default function DashboardPage() {
    const { admin, logout } = useAuthStore();

    return(
        <div style={{ padding: '40px' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between' }}>
                <h1>Admin dashboard</h1>
                
            </header>
            <div style={{ marginTop: '20px', padding: '20px', background: '#eef2f3', borderRadius: '8px' }}>
                <h3>Welcome back! {admin?.name}</h3>
                <p>Managing university id: <strong>{admin?.university_id}</strong></p>
            </div>
            {/* Phase 6 will add the "Post Creation" form here */}
        </div>
    )
}