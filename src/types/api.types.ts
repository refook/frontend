// Error types
export interface ApiError {
    code: string;
    message: string;
    details?: Record<string, any>;
}

// API Response types
export interface ApiResponse<T> {
    data: T;
    message: string;
    success: boolean;
}
