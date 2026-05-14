export class HttpError extends Error {
  readonly status: number;

  constructor(status: number) {
    super(`HTTP error! Status: ${status}`);
    this.name = "HttpError";
    this.status = status;
  }
}

class ApiClient {
  async handleResponse<TResult>(response: Response): Promise<TResult> {
    if (!response.ok) {
      throw new HttpError(response.status);
    }

    try {
      const result = await response.json();
      return result;
    } catch (error) {
      throw new Error(`Error parsing JSON response: ${error instanceof Error ? error.message : ""}`);
    }
  }

  public async get<TResult = unknown>(endpoint: string): Promise<TResult> {
    const response = await fetch(`/api${endpoint}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    return this.handleResponse<TResult>(response);
  }

  public async post<TResult = unknown, TData = Record<string, unknown>>(
    endpoint: string,
    body: TData,
  ): Promise<TResult> {
    const response = await fetch(`/api${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify(body),
    });

    return this.handleResponse<TResult>(response);
  }

  public async postFormData<TResult = unknown>(endpoint: string, body: FormData): Promise<TResult> {
    const response = await fetch(`/api${endpoint}`, {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
      body,
    });

    return this.handleResponse<TResult>(response);
  }

  public async patch<TResult = unknown, TData = Record<string, unknown>>(
    endpoint: string,
    body: TData,
  ): Promise<TResult> {
    const response = await fetch(`/api${endpoint}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify(body),
    });

    return this.handleResponse<TResult>(response);
  }
}

export const apiClient = new ApiClient();
