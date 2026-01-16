import { useMutation } from '@tanstack/react-query';
import api from '../utils/api';

// Hook for admin login
export function useAdminLogin() {
    return useMutation({
        mutationFn: async (credentials) => {
            const { data } = await api.post('/auth/login', credentials);
            return data;
        },
        onSuccess: (data) => {
            if (data.admin?.email) {
                localStorage.setItem('adminEmail', data.admin.email);
            }
        },
    });
}
