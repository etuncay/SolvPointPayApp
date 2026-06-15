import type { BackOfficeRole } from '@epay/ui';
import type {
  ApproverAvailabilityIssue,
  FieldApprovalRule,
  FieldApprovalRuleInput,
  ScreenApprovalRule,
  ValidateFieldRuleInput,
  ValidateFieldRuleResult,
} from '../domain/types';
import type { ApprovalCount } from '../domain/types';

export type SaveScreensResult =
  | { ok: true }
  | { ok: false; errorCode: 'frd_forbidden' | 'ar_screen_save_blocked'; issues: ApproverAvailabilityIssue[] };

export type SaveFieldsResult =
  | { ok: true; warnings: ApproverAvailabilityIssue[] }
  | { ok: false; errorCode: string };

export interface ApprovalRulesService {
  listScreens(role: BackOfficeRole): ScreenApprovalRule[];
  saveScreens(
    role: BackOfficeRole,
    updates: { id: string; approvalCount: ApprovalCount }[],
  ): SaveScreensResult;
  listFields(role: BackOfficeRole): FieldApprovalRule[];
  createField(role: BackOfficeRole, input: FieldApprovalRuleInput): SaveFieldsResult;
  updateField(
    role: BackOfficeRole,
    id: string,
    input: FieldApprovalRuleInput,
  ): SaveFieldsResult;
  deleteField(role: BackOfficeRole, id: string): { ok: boolean; errorCode?: string };
  validateFieldRule(input: ValidateFieldRuleInput): ValidateFieldRuleResult;
}
