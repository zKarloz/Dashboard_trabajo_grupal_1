const apiUrl = import.meta.env.VITE_API_URL?.trim();

export const API_URL =
    apiUrl || "http://127.0.0.1:5000";