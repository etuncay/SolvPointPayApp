/** Temsilci grup master seed — 3.3 mock kaynağı */
export type AgentGroupMasterSeed = {
  id: number;
  groupCode: string;
  name: string;
  description: string;
  commission: number;
  isDefault: boolean;
  status: 'Active' | 'Passive';
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
  recordStatus: number;
};

export const AGENT_GROUP_MASTER_SEED: AgentGroupMasterSeed[] = [
  {
    id: 1,
    groupCode: 'PLATINUM',
    name: 'Platin',
    description: 'En yüksek hacimli temsilciler',
    commission: 0.3,
    isDefault: false,
    status: 'Active',
    createdAt: '2024-01-15T10:00:00',
    createdBy: 'system.seed',
    updatedAt: '2026-05-20T08:00:00',
    updatedBy: 'ops.user',
    recordStatus: 1,
  },
  {
    id: 2,
    groupCode: 'GOLD',
    name: 'Altın',
    description: 'Yüksek performans grubu',
    commission: 0.45,
    isDefault: false,
    status: 'Active',
    createdAt: '2024-01-15T10:00:00',
    createdBy: 'system.seed',
    updatedAt: '2026-05-20T08:00:00',
    updatedBy: 'ops.user',
    recordStatus: 1,
  },
  {
    id: 3,
    groupCode: 'SILVER',
    name: 'Gümüş',
    description: 'Orta segment temsilciler',
    commission: 0.65,
    isDefault: false,
    status: 'Active',
    createdAt: '2024-01-15T10:00:00',
    createdBy: 'system.seed',
    updatedAt: '2026-05-20T08:00:00',
    updatedBy: 'ops.user',
    recordStatus: 1,
  },
  {
    id: 4,
    groupCode: 'BRONZE',
    name: 'Bronz',
    description: 'Gelişen temsilci segmenti',
    commission: 0.85,
    isDefault: false,
    status: 'Active',
    createdAt: '2024-01-15T10:00:00',
    createdBy: 'system.seed',
    updatedAt: '2026-05-20T08:00:00',
    updatedBy: 'ops.user',
    recordStatus: 1,
  },
  {
    id: 5,
    groupCode: 'STANDARD',
    name: 'Standart',
    description: 'Varsayılan temsilci grubu',
    commission: 1.1,
    isDefault: true,
    status: 'Active',
    createdAt: '2024-01-15T10:00:00',
    createdBy: 'system.seed',
    updatedAt: '2026-05-20T08:00:00',
    updatedBy: 'ops.user',
    recordStatus: 1,
  },
  {
    id: 6,
    groupCode: 'LEGACY_TIER',
    name: 'Eski Tarife',
    description: 'Pasif demo grup — yeni atama yapılmaz',
    commission: 1.5,
    isDefault: false,
    status: 'Passive',
    createdAt: '2023-06-01T10:00:00',
    createdBy: 'system.seed',
    updatedAt: '2025-12-01T09:00:00',
    updatedBy: 'finance.user',
    recordStatus: 1,
  },
];

export type LegacyAgentGroup = {
  key: string;
  label: string;
  commission: number;
};

/** Combobox / AGENTS uyumu — groupCode → legacy key */
export function masterToLegacy(
  g: Pick<AgentGroupMasterSeed, 'groupCode' | 'name' | 'commission'>,
): LegacyAgentGroup {
  return {
    key: g.groupCode.toLowerCase(),
    label: g.name,
    commission: g.commission,
  };
}

/** Aktif gruplar — agents.ts AGENT_GROUPS türetimi */
export function buildLegacyAgentGroups(): LegacyAgentGroup[] {
  return AGENT_GROUP_MASTER_SEED.filter((g) => g.status === 'Active' && g.recordStatus === 1).map(
    masterToLegacy,
  );
}
