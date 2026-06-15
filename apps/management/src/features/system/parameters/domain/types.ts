export type ParameterValueType = 'number' | 'string' | 'boolean' | 'duration_ms';

export type ParameterGroup =
  | 'upload_limits'
  | 'reconciliation'
  | 'fraud'
  | 'fx'
  | 'treasury'
  | 'otp'
  | 'retry'
  | 'approval'
  | 'hr';

export type ParameterStatus = 'Active' | 'Passive';

export interface ParameterCatalogEntry {
  parameterKey: string;
  groupName: ParameterGroup;
  valueType: ParameterValueType;
  defaultValue: string;
  descriptionKey: string;
  min?: number;
  max?: number;
  maxLength?: number;
  /** false ise başlangıç store'una dahil edilmez; form ile eklenebilir */
  seed?: boolean;
  /** 12.4 — her değer/status değişikliği onaya gider */
  approvalOnChange?: boolean;
  criticalZeroConfirm?: boolean;
}

export type ParameterFormInput = {
  parameterKey: string;
  groupName: ParameterGroup;
  valueType: ParameterValueType;
  description: string;
  value: string;
  status: ParameterStatus;
};

export interface SystemParameter {
  id: string;
  groupName: ParameterGroup;
  parameterKey: string;
  value: string;
  valueType: ParameterValueType;
  description: string;
  status: ParameterStatus;
  changedBy: string;
  changedByName: string;
  changedAt: string;
  recordStatus: 1;
}

export type ParameterListRow = SystemParameter;

export type ParameterFilters = {
  query: string;
  group: 'any' | ParameterGroup;
  status: 'any' | ParameterStatus;
};

export const DEFAULT_PARAMETER_FILTERS: ParameterFilters = {
  query: '',
  group: 'any',
  status: 'any',
};

export type UpdateParameterPayload = {
  value?: string;
  status?: ParameterStatus;
};
