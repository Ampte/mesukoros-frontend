const rawApiUrl = import.meta.env.VITE_API_URL || "/api";
export const API_URL = rawApiUrl.endsWith("/") ? rawApiUrl.slice(0, -1) : rawApiUrl;

export function getAuth() {
  const raw = localStorage.getItem("mesukoros_auth");
  return raw ? JSON.parse(raw) : null;
}

export function setAuth(auth) {
  localStorage.setItem("mesukoros_auth", JSON.stringify(auth));
}

export function clearAuth() {
  localStorage.removeItem("mesukoros_auth");
}

export async function api(path, options = {}) {
  const auth = getAuth();
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };

  if (auth?.token) {
    headers.Authorization = `Bearer ${auth.token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
}
