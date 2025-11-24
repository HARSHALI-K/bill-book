import axios from "axios";
import { getAuthToken,getUserData } from "./auth";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://api-bill-book.pratikyewale.in/api/v1";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});
const userData=getUserData()
console.log(userData,"userData")
// Add token if exists
api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if(userData?.organizations[0]?.id){
    config.headers.orgid=userData?.organizations[0]?.id
  }
  return config;
});

// API wrapper
export async function apiFetch<T = any>(
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
  url: string,
  data?: any
): Promise<T> {
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
  }
}
