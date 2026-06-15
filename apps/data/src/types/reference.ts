/** Form cascade / lookup — IndexedDB refOptions */
export interface RefOptionRow {
  id: string;
  group: string;
  parentKey?: string;
  label: string;
  value: string;
  sortOrder?: number;
}

export interface SelectOptionDto {
  label: string;
  value: string;
}
