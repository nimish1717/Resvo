const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export async function apiFetch(path, options = {}) {
    const headers = { ...options.headers };
    if (!options.isFormData) {
        headers['Content-Type'] = headers['Content-Type'] || 'application/json';
    }

    try {
        const response = await fetch(`${API_URL}${path}`, {
            ...options,
            credentials: 'include',
            headers,
        });

        const data = await response.json().catch(() => null);

        return { response, data };
    } catch (error) {
        // Network error, CORS error, or server down
        console.error('apiFetch error:', error);
        return {
            response: { ok: false, status: 500 },
            data: { message: 'Network error or server is unreachable. Please try again later.' }
        };
    }
}