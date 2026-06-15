/** DynamicTable TableQueryParams ile uyumlu liste sorgusu */
export interface ListQueryInput {
  page: number;
  pageSize: number;
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: Record<string, unknown>;
  headerFilters?: Record<string, unknown>;
  tabFilters?: Record<string, unknown>;
}
