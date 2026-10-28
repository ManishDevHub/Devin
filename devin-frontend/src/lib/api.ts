const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export const apiFetch = async (path: string, method: string = 'GET', body?: object) => {
   
    const token = localStorage.getItem('token');

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_URL}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    });

    const data = await res.json();

    return { ok: res.ok, status: res.status, data };
};