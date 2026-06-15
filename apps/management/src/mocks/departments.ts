export interface Department {
  id: string;
  name: string;
  parentId: string | null;
}

export const DEPARTMENTS: Department[] = [
  { id: 'dept-ops', name: 'Operasyon', parentId: null },
  { id: 'dept-compliance', name: 'Uyum', parentId: null },
  { id: 'dept-finance', name: 'Finans', parentId: null },
  { id: 'dept-mgmt', name: 'Yönetim', parentId: null },
  { id: 'dept-hr', name: 'İnsan Kaynakları', parentId: null },
];

export function getDepartmentById(id: string): Department | undefined {
  return DEPARTMENTS.find((d) => d.id === id);
}
