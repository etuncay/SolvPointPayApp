import type { BackOfficeRole } from '@epay/ui';
import type {
  ParameterFilters,
  ParameterFormInput,
  SystemParameter,
  UpdateParameterPayload,
} from '../domain/types';

export type ParameterAuditEntry = {
  at: string;
  parameterKey: string;
  field: 'value' | 'status';
  oldValue: string;
  newValue: string;
  userId: string;
};

export type UpdateParameterResult =
  | { ok: true; row: SystemParameter }
  | { ok: false; errorCode: string; needsConfirm?: boolean };

export type CreateParameterResult =
  | { ok: true; row: SystemParameter }
  | { ok: false; errorCode: string; needsConfirm?: boolean };

export interface ParametersService {
  list(role: BackOfficeRole, filters: ParameterFilters): SystemParameter[];
  create(
    role: BackOfficeRole,
    userId: string,
    input: ParameterFormInput,
    options?: { skipCriticalConfirm?: boolean },
  ): CreateParameterResult;
  update(
    role: BackOfficeRole,
    userId: string,
    id: string,
    payload: UpdateParameterPayload,
    options?: { skipCriticalConfirm?: boolean },
  ): UpdateParameterResult;
  getAuditLog(parameterKey?: string): ParameterAuditEntry[];
}
