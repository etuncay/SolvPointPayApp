import type {
  CalculateFeeParams,
  CalculateFeeResult,
  CustomerFee,
  CustomerFeeFilters,
  CustomerFeeInput,
  SaveFeeResult,
} from '../domain/types';

export type FeeChangeLogEntry = {
  id: number;
  action: 'create' | 'update' | 'passivate' | 'batch_expire';
  feeId: number;
  previous: CustomerFee | null;
  next: CustomerFee | null;
  at: string;
  by: string;
};

export type CustomerFeesService = {
  list(filters?: CustomerFeeFilters): CustomerFee[];
  create(input: CustomerFeeInput): SaveFeeResult;
  update(id: number, input: CustomerFeeInput): SaveFeeResult;
  calculate(params: CalculateFeeParams): CalculateFeeResult;
  runBatchExpire(): number;
};
