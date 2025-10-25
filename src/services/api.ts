import axios from 'axios';
import type {AxiosInstance, AxiosRequestConfig, AxiosError} from 'axios';
import type {ApiResponse} from '../types';
import keycloak from "./keycloak.ts";

// Base API configuration
export const API_BASE_URL =
    import.meta.env.MODE == "back" ? 'http://localhost:8080/v1'
        : (import.meta.env.DEV ? '/api/v1' : 'https://api.refook.ru/v1');

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
                if (keycloak.token) {
                    config.headers.Authorization = `Bearer ${keycloak.token}`;
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
                return this.handleError(error);
            }
        );
    }

    private handleError(error: AxiosError) {
        if (error.response) {
            // Server responded with error status
            const {status, data} = error.response;

            switch (status) {
                case 401:
                    return this.handle401(error)
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

            return Promise.reject({
                code: status.toString(),
                message: (data as any)?.message || error.message,
                details: data as Record<string, any>,
            });
        } else if (error.request) {
            // Network error
            return Promise.reject({
                code: 'NETWORK_ERROR',
                message: 'Ошибка сети. Проверьте подключение к интернету.',
            });
        } else {
            // Other error
            return Promise.reject({
                code: 'UNKNOWN_ERROR',
                message: error.message || 'Произошла неизвестная ошибка',
            });
        }
    }

    private async handle401(error: AxiosError) {
        try {
            // пробуем обновить токен
            const refresh = await keycloak.updateToken(0);
            if (refresh && keycloak.token) {
                console.warn("ТОКЕН ОБНОВЛЕН")
                // повторяем оригинальный запрос
                if (error.config) {
                    if (keycloak.token) {
                        error.config.headers.Authorization = `Bearer ${keycloak.token}`;
                    }
                    return this.api.request(error.config);
                }
            } else {
                console.warn("refresh не сработал, выходим")
            }
        } catch (e) {
            console.error("refresh не сработал, выходим", e)
            keycloak.logout();
        }

        return Promise.reject({
            code: "401",
            message: "Unauthorized",
        });
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
        return this.request<T>({...config, method: 'GET', url});
    }

    public post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        return this.request<T>({...config, method: 'POST', url, data});
    }

    public put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        return this.request<T>({...config, method: 'PUT', url, data});
    }

    public patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        return this.request<T>({...config, method: 'PATCH', url, data});
    }

    public delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
        return this.request<T>({...config, method: 'DELETE', url});
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
        this.api.defaults.headers.Authorization = `Bearer ${token}`;
    }

    public removeAuthTokens() {
        delete this.api.defaults.headers.Authorization;
    }

    // Убрано: управление токенами в localStorage. Полагаться на keycloak.token.

}

// Create and export singleton instance
export const apiService = new ApiService();
export default apiService; 