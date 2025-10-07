export const AUTH_TOKEN_KEY = "auth_token";
export const USER_DATA_KEY = "userData";

// Save token
export function saveAuthToken(token: string) {
  if (typeof window === "undefined") return; // SSR safe
  localStorage.setItem(AUTH_TOKEN_KEY, token);
}

// Get token
export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null; // SSR safe
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

// Save user data
export function saveUserData(user: any) {
  if (typeof window === "undefined") return; // SSR safe
  localStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
}

// Get user data
export function getUserData(): any | null {
  if (typeof window === "undefined") return null; // SSR safe
  const user = localStorage.getItem(USER_DATA_KEY);
  return user ? JSON.parse(user) : null;
}

// Clear token and user
export function clearAuthToken() {
  if (typeof window === "undefined") return; // SSR safe
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(USER_DATA_KEY);
}
