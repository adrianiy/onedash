const BASE_URL = "/api";

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  count?: number;
  message?: string;
}

export const apiService = {
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `HTTP Error: ${response.status} - ${response.statusText}`
      );
    }

    return response.json();
  },

  async post<T>(endpoint: string, data: unknown): Promise<ApiResponse<T>> {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(
        `HTTP Error: ${response.status} - ${response.statusText}`
      );
    }

    return response.json();
  },

  async put<T>(endpoint: string, data: unknown): Promise<ApiResponse<T>> {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(
        `HTTP Error: ${response.status} - ${response.statusText}`
      );
    }

    return response.json();
  },

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `HTTP Error: ${response.status} - ${response.statusText}`
      );
    }

    return response.json();
  },
};
