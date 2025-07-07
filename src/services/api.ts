import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import { ApiResponse, ApiError } from '../types';

// Base API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.api.interceptors.request.use(
      (config) => {
        // Add auth token if available
        const token = localStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        
        // Add timestamp to prevent caching
        config.headers['X-Timestamp'] = Date.now().toString();
        
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response) => {
        return response;
      },
      (error: AxiosError) => {
        const apiError = this.handleError(error);
        return Promise.reject(apiError);
      }
    );
  }

  private handleError(error: AxiosError): ApiError {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          // Unauthorized - redirect to login
          localStorage.removeItem('authToken');
          window.location.href = '/login';
          break;
        case 403:
          // Forbidden
          console.error('Access forbidden');
          break;
        case 404:
          // Not found
          console.error('Resource not found');
          break;
        case 500:
          // Server error
          console.error('Internal server error');
          break;
      }

      return {
        code: status.toString(),
        message: (data as any)?.message || error.message,
        details: data as Record<string, any>,
      };
    } else if (error.request) {
      // Network error
      return {
        code: 'NETWORK_ERROR',
        message: 'Ошибка сети. Проверьте подключение к интернету.',
      };
    } else {
      // Other error
      return {
        code: 'UNKNOWN_ERROR',
        message: error.message || 'Произошла неизвестная ошибка',
      };
    }
  }

  // Generic request method
  private async request<T>(config: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.api.request<ApiResponse<T>>(config);
      return response.data.data;
    } catch (error) {
      throw error;
    }
  }

  // HTTP methods
  public get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'GET', url });
  }

  public post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'POST', url, data });
  }

  public put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'PUT', url, data });
  }

  public patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'PATCH', url, data });
  }

  public delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'DELETE', url });
  }

  // File upload method
  public uploadFile<T>(url: string, file: File, onProgress?: (progress: number) => void): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);

    return this.request<T>({
      method: 'POST',
      url,
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });
  }

  // Auth methods
  public setAuthToken(token: string) {
    localStorage.setItem('authToken', token);
    this.api.defaults.headers.Authorization = `Bearer ${token}`;
  }

  public removeAuthToken() {
    localStorage.removeItem('authToken');
    delete this.api.defaults.headers.Authorization;
  }

  public getAuthToken(): string | null {
    return localStorage.getItem('authToken');
  }
}

// Create and export singleton instance
export const apiService = new ApiService();
export default apiService; 