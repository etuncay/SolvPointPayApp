import type { SelectOptionDto } from '../types/reference';

/** DynamicForm customFunctions.apiCall — mock / HTTP ortak sözleşme */
export interface FormReferenceApi {
  getOptions(endpoint: string, param?: unknown): Promise<SelectOptionDto[]>;
}
