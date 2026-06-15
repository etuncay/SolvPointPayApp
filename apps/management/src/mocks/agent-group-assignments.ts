import { AGENTS } from './agents';

export type AgentGroupAssignmentSeed = {
  id: number;
  agentId: number;
  groupCode: string;
  assignedAt: string;
  status: 'Active' | 'Passive';
  createdAt: string;
  createdBy: string;
  recordStatus: number;
};

/** AGENTS bootstrap + tarihsel Passive demo kayıtları */
export function buildAgentGroupAssignmentSeed(): AgentGroupAssignmentSeed[] {
  const rows: AgentGroupAssignmentSeed[] = [];
  let id = 5001;

  for (const agent of AGENTS) {
    if (agent.recordStatus !== 1) continue;
    const ts = `${agent.createdAt}T10:00:00.000Z`;
    rows.push({
      id: id++,
      agentId: agent.id,
      groupCode: agent.group.key.toUpperCase(),
      assignedAt: ts,
      status: 'Active',
      createdAt: ts,
      createdBy: 'system.seed',
      recordStatus: 1,
    });
  }

  const historical: AgentGroupAssignmentSeed[] = [
    {
      id: 5100,
      agentId: 99901,
      groupCode: 'GOLD',
      assignedAt: '2023-01-15T09:00:00.000Z',
      status: 'Passive',
      createdAt: '2023-01-15T09:00:00.000Z',
      createdBy: 'system.seed',
      recordStatus: 1,
    },
    {
      id: 5101,
      agentId: 99902,
      groupCode: 'SILVER',
      assignedAt: '2024-03-01T11:00:00.000Z',
      status: 'Passive',
      createdAt: '2024-03-01T11:00:00.000Z',
      createdBy: 'system.seed',
      recordStatus: 1,
    },
    {
      id: 5102,
      agentId: 99903,
      groupCode: 'BRONZE',
      assignedAt: '2024-08-10T08:30:00.000Z',
      status: 'Passive',
      createdAt: '2024-08-10T08:30:00.000Z',
      createdBy: 'system.seed',
      recordStatus: 1,
    },
  ];

  return [...rows, ...historical];
}
