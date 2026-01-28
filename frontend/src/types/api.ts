export interface APIError {
  detail: string;
}

export interface APIResponse<T> {
  data: T;
  message?: string;
}
