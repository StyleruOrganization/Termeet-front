import type { ZodSchema } from "zod";

class ApiClient {
  async handleResponse<TResult>(response: Response, validationSchema?: ZodSchema<TResult>): Promise<TResult> {
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    try {
      const result = await response.json();

      if (validationSchema) {
        const validationRes = validationSchema.safeParse(result);
        if (!validationRes.success) {
          console.error("❌ Ошибка валидации данных:", {
            error: validationRes.error,
            timestamp: new Date().toISOString(),
          });
        }
      }

      return result;
    } catch (error) {
      throw new Error(`Error parsing JSON response: ${error instanceof Error ? error.message : ""}`);
    }
  }

  public async get<TResult = unknown>(endpoint: string, validationSchema?: ZodSchema<TResult>): Promise<TResult> {
    const response = await fetch(`/api${endpoint}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    return this.handleResponse<TResult>(response, validationSchema);
  }

  public async post<TResult = unknown, TData = Record<string, unknown>>(
    endpoint: string,
    body: TData,
    validationSchema?: ZodSchema<TData>,
  ): Promise<TResult> {
    if (validationSchema) {
      const validationRes = validationSchema.safeParse(body);
      if (!validationRes.success) {
        console.error("❌ Ошибка валидации данных:", {
          error: validationRes.error.issues[0].message,
          path: validationRes.error.issues[0].path,
          timestamp: new Date().toISOString(),
        });
      }
    }
    console.log("Вызываю post метод");
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

  public async patch<TResult = unknown, TData = Record<string, unknown>>(
    endpoint: string,
    body: TData,
    validationSchema?: ZodSchema<TData>,
  ): Promise<TResult> {
    if (validationSchema) {
      const validationRes = validationSchema.safeParse(body);
      if (!validationRes.success) {
        console.error("❌ Ошибка валидации данных:", {
          error: validationRes.error.issues[0].message,
          path: validationRes.error.issues[0].path,
          timestamp: new Date().toISOString(),
        });
      }
    }

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
