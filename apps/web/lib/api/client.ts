import { useAuthStore } from "@/stores/auth-store";
import { ApiError } from "./errors";

const rawBaseUrl =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

export const API_BASE_URL = rawBaseUrl.endsWith("/api/v1")
  ? rawBaseUrl
  : `${rawBaseUrl.replace(/\/$/, "")}/api/v1`;

interface FetchOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined | null>;
  requiresAuth?: boolean;
}

interface AuthResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    username: string;
    role: string;
  };
}

let refreshPromise: Promise<string> | null = null;

function isAuthEndpoint(endpoint: string): boolean {
  const normalized = endpoint.startsWith("/")
    ? endpoint
    : `/${endpoint}`;

  return (
    normalized === "/auth/login" ||
    normalized === "/auth/refresh" ||
    normalized === "/auth/logout"
  );
}

function requiresCredentials(endpoint: string): boolean {
  const normalized = endpoint.startsWith("/")
    ? endpoint
    : `/${endpoint}`;

  return (
    normalized === "/auth/login" ||
    normalized === "/auth/refresh" ||
    normalized === "/auth/logout"
  );
}

async function refreshAccessToken(): Promise<string> {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Refresh token request failed");
      }

      const data = (await response.json()) as AuthResponse;

      if (!data.accessToken || !data.user) {
        throw new Error("Invalid refresh response");
      }

      useAuthStore.getState().setAuth(
        data.accessToken,
        data.user
      );

      return data.accessToken;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export async function apiClient<T>(
  endpoint: string,
  options: FetchOptions = {},
  retry = false
): Promise<T> {
  const {
    params,
    requiresAuth = true,
    ...customConfig
  } = options;

  const headers = new Headers(customConfig.headers || {});

  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (requiresAuth) {
    const token = useAuthStore.getState().accessToken;

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  const config: RequestInit = {
    ...customConfig,
    headers,
  };

  if (requiresCredentials(endpoint)) {
    config.credentials = "include";
  }

  let url: string;

  if (endpoint.startsWith("http")) {
    url = endpoint;
  } else if (endpoint.startsWith("/actuator")) {
    const origin = API_BASE_URL.slice(0, -7);
    url = `${origin}${endpoint}`;
  } else {
    const cleanEndpoint = endpoint.startsWith("/")
      ? endpoint.slice(1)
      : endpoint;

    url = `${API_BASE_URL}/${cleanEndpoint}`;
  }

  if (params) {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });

    const queryString = searchParams.toString();

    if (queryString) {
      url += `?${queryString}`;
    }
  }

  const response = await fetch(url, config);

  /*
   * Access-token expiration handling.
   *
   * Never attempt automatic refresh for:
   * - login
   * - refresh
   * - logout
   *
   * This prevents refresh loops.
   */
  if (
    response.status === 401 &&
    !retry &&
    requiresAuth &&
    !isAuthEndpoint(endpoint)
  ) {
    try {
      const newAccessToken = await refreshAccessToken();

      const retryHeaders = new Headers(customConfig.headers || {});

      if (!retryHeaders.has("Content-Type")) {
        retryHeaders.set("Content-Type", "application/json");
      }

      retryHeaders.set(
        "Authorization",
        `Bearer ${newAccessToken}`
      );

      const retryConfig: RequestInit = {
        ...customConfig,
        headers: retryHeaders,
      };

      if (requiresCredentials(endpoint)) {
        retryConfig.credentials = "include";
      }

      const retryResponse = await fetch(url, retryConfig);

      if (retryResponse.status === 401) {
        useAuthStore.getState().logout();

        throw new ApiError(
          401,
          "Session expired",
          null
        );
      }

      if (!retryResponse.ok) {
        return handleApiError<T>(retryResponse);
      }

      return parseResponse<T>(retryResponse);
    } catch (error) {
      useAuthStore.getState().logout();

      if (error instanceof ApiError) {
        throw error;
      }

      throw new ApiError(
        401,
        "Session expired",
        null
      );
    }
  }

  if (!response.ok) {
    return handleApiError<T>(response);
  }

  return parseResponse<T>(response);
}

async function handleApiError<T>(
  response: Response
): Promise<T> {
  let errorData: unknown = undefined;
  let message = "An error occurred";

  try {
    errorData = await response.json();

    if (
      typeof errorData === "object" &&
      errorData !== null
    ) {
      const data = errorData as Record<string, unknown>;

      if (typeof data.message === "string") {
        message = data.message;
      } else if (typeof data.error === "string") {
        message = data.error;
      }
    }
  } catch {
    // Response body is not JSON.
  }

  if (response.status === 401) {
    useAuthStore.getState().logout();
  }

  throw new ApiError(
    response.status,
    message,
    errorData
  );
}

async function parseResponse<T>(
  response: Response
): Promise<T> {
  if (response.status === 204) {
    return {} as T;
  }

  const contentType = response.headers.get("content-type");

  if (
    contentType &&
    contentType.includes("application/json")
  ) {
    return response.json() as Promise<T>;
  }

  return response.text() as unknown as T;
}