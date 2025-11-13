// Use relative URLs in production (proxied by nginx), absolute in development
const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000' : '');
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || (import.meta.env.DEV ? 'http://localhost:5000' : window.location.origin);

export { API_URL, SOCKET_URL };
