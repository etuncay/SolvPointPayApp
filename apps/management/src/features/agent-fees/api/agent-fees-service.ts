import type {
  AgentFee,
  AgentFeeFilters,
  AgentFeeInput,
  AgentFeeUpdateInput,
  CalculateAgentFeeParams,
  CalculateAgentFeeResult,
  SaveAgentFeeResult,
} from '../domain/types';

export type AgentFeeChangeLogEntry = {
  id: number;
  action: 'create' | 'update' | 'passivate' | 'batch_expire';
  feeId: number;
  previous: AgentFee | null;
  next: AgentFee | null;
  at: string;
  by: string;
};

export type AgentFeesService = {
  list(filters?: AgentFeeFilters): AgentFee[];
  create(input: AgentFeeInput): SaveAgentFeeResult;
  update(id: number, input: AgentFeeUpdateInput): SaveAgentFeeResult;
  calculate(params: CalculateAgentFeeParams): CalculateAgentFeeResult;
  runBatchExpire(): number;
  hasActiveConflict(input: AgentFeeInput): boolean;
};
