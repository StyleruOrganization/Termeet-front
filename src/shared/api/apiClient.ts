import { getAccessToken, notifyUnauthorized, refreshAccessToken, shouldAttemptRefresh } from "./accessToken";

const readErrorDetail = async (response: Response): Promise<string | undefined> => {
  try {
    const data: unknown = await response.clone().json();
    if (data && typeof data === "object" && "detail" in data) {
      const detail = (data as { detail: unknown }).detail;
      if (typeof detail === "string") {
        return detail;
      }
    }
  } catch {
    return undefined;
  }

  return undefined;
};

export class HttpError extends Error {
  readonly status: number;
  readonly detail?: string;

  constructor(status: number, detail?: string) {
    super(detail || `HTTP error! Status: ${status}`);
    this.name = "HttpError";
    this.status = status;
    this.detail = detail;
  }
}

class ApiClient {
  async handleResponse<TResult>(response: Response): Promise<TResult> {
    if (!response.ok) {
      const detail = await readErrorDetail(response);
      throw new HttpError(response.status, detail);
    }

    if (response.status === 204) {
      return undefined as TResult;
    }

    const text = await response.text();
    if (!text) {
      return undefined as TResult;
    }

    try {
      return JSON.parse(text) as TResult;
    } catch (error) {
      throw new Error(`Error parsing JSON response: ${error instanceof Error ? error.message : ""}`);
    }
  }

  private buildHeaders(init?: HeadersInit, hasJsonBody = false): Headers {
    const headers = new Headers(init);
    headers.set("Accept", "application/json");
    if (hasJsonBody && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    const token = getAccessToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    return headers;
  }

  private async request<TResult>(endpoint: string, init: RequestInit, retry = true): Promise<TResult> {
    const response = await fetch(`/api${endpoint}`, {
      ...init,
      credentials: "include",
    });

    if (response.status === 401 && retry && shouldAttemptRefresh(endpoint)) {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        const headers = this.buildHeaders(init.headers, Boolean(init.body) && !(init.body instanceof FormData));
        return this.request<TResult>(endpoint, { ...init, headers }, false);
      }
      notifyUnauthorized();
    }

    return this.handleResponse<TResult>(response);
  }

  public async get<TResult = unknown>(endpoint: string): Promise<TResult> {
    return this.request<TResult>(endpoint, {
      method: "GET",
      headers: this.buildHeaders(),
    });
  }

  public async post<TResult = unknown, TData = Record<string, unknown>>(
    endpoint: string,
    body?: TData,
  ): Promise<TResult> {
    const hasBody = body !== undefined;
    return this.request<TResult>(endpoint, {
      method: "POST",
      headers: this.buildHeaders(undefined, hasBody),
      body: hasBody ? JSON.stringify(body) : undefined,
    });
  }

  public async postFormData<TResult = unknown>(endpoint: string, body: FormData): Promise<TResult> {
    return this.request<TResult>(endpoint, {
      method: "POST",
      headers: this.buildHeaders(),
      body,
    });
  }

  public async patch<TResult = unknown, TData = Record<string, unknown>>(
    endpoint: string,
    body: TData,
  ): Promise<TResult> {
    return this.request<TResult>(endpoint, {
      method: "PATCH",
      headers: this.buildHeaders(undefined, true),
      body: JSON.stringify(body),
    });
  }

  public async delete<TResult = unknown>(endpoint: string): Promise<TResult> {
    return this.request<TResult>(endpoint, {
      method: "DELETE",
      headers: this.buildHeaders(),
    });
  }
}

export const apiClient = new ApiClient();
