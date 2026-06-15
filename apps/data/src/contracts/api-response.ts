/**
 * DynamicTable / gerçek backend ile ortak liste yanıt sözleşmesi.
 * @see packages/ui — TableApiResponse
 */
export interface PaginatedListResponse {
  data: Record<string, unknown>[];
  total: number;
  success: boolean;
  message?: string;
  meta?: Record<string, unknown>;
}

export type ApiResult<T> =
  | { success: true; data: T }
  | { success: false; message: string };
