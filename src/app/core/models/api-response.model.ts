export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: any;
}

export interface ApiPaginatedResponse<T> {
  success: boolean;
  message?: string;
  data: {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
  errors?: any;
} 