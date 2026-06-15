export type ComplianceStaffMember = {
  id: string;
  displayName: string;
  role: 'compliance' | 'management';
};

export const COMPLIANCE_STAFF: ComplianceStaffMember[] = [
  { id: 'u.comp', displayName: 'Ayşe Demir', role: 'compliance' },
  { id: 'u.comp2', displayName: 'Zeynep Korkmaz', role: 'compliance' },
  { id: 'u.comp3', displayName: 'Can Öztürk', role: 'compliance' },
  { id: 'u.mgmt', displayName: 'Mehmet Şahin', role: 'management' },
  { id: 'u.mgmt2', displayName: 'Elif Yıldız', role: 'management' },
  { id: 'u.ops', displayName: 'Ops User', role: 'compliance' },
];
