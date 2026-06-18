import type { TransactionApprovalOtpError } from '../contracts/agent-transaction-approval-otp-port';

export function mapTransactionApprovalOtpError(error: TransactionApprovalOtpError): string {
  switch (error) {
    case 'not_found':
      return 'ag_cf_err_not_found';
    case 'expired':
      return 'ag_cf_err_otp_expired';
    case 'invalid_otp':
    default:
      return 'ag_cf_err_otp';
  }
}
