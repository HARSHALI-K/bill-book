import axios from "axios";
import { getAuthToken,getUserData } from "./auth";
import { notifyApiActivity } from "./api-events";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://api-bill-book.pratikyewale.in/api/v1";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});
// Add token if exists. Read userData lazily inside the interceptor
api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    if (!config.headers) config.headers = {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Read fresh user data at request time and guard array access safely
  const userData = getUserData();
  const orgId = userData?.organizations?.[0]?.id ?? null;
  if (orgId) {
    if (!config.headers) config.headers = {};
    config.headers.orgid = orgId;
  }

  return config;
});

// API wrapper
export async function apiFetch<T = any>(
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
  url: string,
  data?: any
): Promise<T> {
  notifyApiActivity(1);
  try {
    const res = await api.request<T>({ method, url, data });
    return res.data;
  } catch (error: any) {
    const res = error.response;

    if (res) {
      const errData = res.data;

      // extract global message or fallback
      const message =
        errData?.message ||
        errData?.error ||
        "Something went wrong";

      // ✅ return both top-level message & field errors
      throw {
        message,
        status: res.status,
        errors: errData?.errors || errData?.data || null, // field-level errors
      };
    }

    throw { message: error.message || "Network error" };
  } finally {
    notifyApiActivity(-1);
  }
}
