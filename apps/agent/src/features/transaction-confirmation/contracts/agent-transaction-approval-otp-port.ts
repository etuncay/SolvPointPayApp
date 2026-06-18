/** İşlem onayı OTP doğrulama — production'da sunucu challenge/verify endpoint'i. */
export type TransactionApprovalOtpError = 'invalid_otp' | 'expired' | 'not_found';

export type TransactionApprovalOtpVerifyInput = {
  transactionId: number;
  otp: string;
};

export type TransactionApprovalOtpVerifyResult =
  | { ok: true; verificationId: string }
  | { ok: false; error: TransactionApprovalOtpError };

export interface AgentTransactionApprovalOtpPort {
  verifyOtp(input: TransactionApprovalOtpVerifyInput): Promise<TransactionApprovalOtpVerifyResult>;
}
