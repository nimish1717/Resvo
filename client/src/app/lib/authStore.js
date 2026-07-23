import { create } from 'zustand';
import { apiFetch } from './api';

export const useAuthStore = create((set, get) => ({
    user: null,
    accessToken: null,
    loading: true,

    initAuth: async () => {
        const { response, data } = await apiFetch('/auth/refresh', { method: 'POST' });
        if (response.ok && data?.status) {
            set({ accessToken: data.token, user: data.user });
        } else {
            set({ accessToken: null, user: null });
        }
        set({ loading: false });
    },

    signup: async (name, email, password) => {
        const { response, data } = await apiFetch('/auth/signup', {
            method: 'POST',
            body: JSON.stringify({ name, email, password }),
        });
        if (response.ok) {
            set({ accessToken: data.token, user: data.user });
        }
        return { response, data };
    },

    orgAdminSignup: async (name, email, password, phone, organizationName) => {
        const { response, data } = await apiFetch('/auth/org-signup', {
            method: 'POST',
            body: JSON.stringify({ name, email, password, phone, organizationName }),
        });
        if (response.ok) {
            set({ accessToken: data.token, user: data.user });
        }
        return { response, data };
    },

    login: async (email, password) => {
        const { response, data } = await apiFetch('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
        if (response.ok) {
            set({ accessToken: data.token, user: data.user });
        }
        return { response, data };
    },

    logout: async () => {
        await apiFetch('/auth/logout', { method: 'POST' });
        set({ accessToken: null, user: null });
    },

    authFetch: async (path, options = {}) => {
        const doRequest = (token) =>
            apiFetch(path, {
                ...options,
                headers: {
                    ...options.headers,
                    Authorization: `Bearer ${token}`,
                },
            });

        let { response, data } = await doRequest(get().accessToken);

        if (response.status === 401) {
            const refreshResult = await apiFetch('/auth/refresh', { method: 'POST' });

            if (refreshResult.response.ok && refreshResult.data?.status) {
                set({ accessToken: refreshResult.data.token, user: refreshResult.data.user });
                ({ response, data } = await doRequest(refreshResult.data.token));
            } else {
                set({ accessToken: null, user: null });
            }
        }

        return { response, data };
    },
}));