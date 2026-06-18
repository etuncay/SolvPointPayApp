/** Demo işlem onayı — önerilen sabit OTP */
export const DEMO_APPROVAL_OTP = '123456';

const OTP_PATTERN = /^\d{6}$/;

/** Mock modda herhangi 6 hane; production contract ayrı port ile değişir. */
export function isValidDemoApprovalOtp(otp: string): boolean {
  return OTP_PATTERN.test(otp.trim());
}
