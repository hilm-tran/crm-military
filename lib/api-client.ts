import { CookieNames } from "@/types/global.enum";
import Cookies from "js-cookie";

const BASE_API = process.env.NEXT_PUBLIC_BASE_API;

export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  status: number;
}

function redirectToLogin() {
  Cookies.remove(CookieNames.Session, { path: "/" });
  if (typeof window === "undefined" || window.location.pathname.startsWith("/login")) return;
  const redirect = encodeURIComponent(window.location.pathname + window.location.search);
  window.location.href = `/login?redirect=${redirect}`;
}

export const apiClient = {
  fetch: async <T = any>(
    path: string,
    options: RequestInit = {},
  ): Promise<T> => {
    const sessionCookie = Cookies.get(CookieNames.Session);
    let token = "";
    let tokenType = "Bearer";

    if (sessionCookie) {
      try {
        const session = JSON.parse(sessionCookie);
        token = session.token;
        tokenType = session.type || "Bearer";
      } catch (e) {
        console.error("Failed to parse session cookie", e);
      }
    }

    const headers = new Headers(options.headers);
    headers.set("Accept-Language", "vi");
    if (token) {
      headers.set("Authorization", `${tokenType} ${token}`);
    }
    if (!(options.body instanceof FormData)) {
      headers.set("Content-Type", "application/json");
    }

    const response = await fetch(`${BASE_API}${path}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      redirectToLogin();
      throw new Error("Phiên đăng nhập đã hết hạn");
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "API request failed");
    }

    return response.json();
  },

  post: <T = any>(path: string, body: any, options: RequestInit = {}) => {
    return apiClient.fetch<T>(path, {
      ...options,
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  get: <T = any>(path: string, options: RequestInit = {}) => {
    return apiClient.fetch<T>(path, {
      ...options,
      method: "GET",
    });
  },
};
