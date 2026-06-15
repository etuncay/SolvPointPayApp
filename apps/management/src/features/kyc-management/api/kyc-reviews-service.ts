import type { BackOfficeRole } from '@epay/ui';
import type {
  KycActionResult,
  KycDocumentInput,
  KycNoteInput,
  KycReviewDetail,
  KycReviewListRow,
  KycVerifyInput,
} from '../domain/types';

export type KycReviewsService = {
  list(role: BackOfficeRole): KycReviewListRow[];
  getById(id: number, role: BackOfficeRole): KycReviewDetail | null;
  countOpen(): number;
  falsePositive(id: number, input: KycNoteInput, role: BackOfficeRole): KycActionResult;
  requestAdditional(id: number, input: KycNoteInput, role: BackOfficeRole): KycActionResult;
  reject(id: number, input: KycNoteInput, role: BackOfficeRole): KycActionResult;
  verify(id: number, input: KycVerifyInput, role: BackOfficeRole): KycActionResult;
  finalizeVerify(id: number, role: BackOfficeRole): KycActionResult;
  addDocument(id: number, input: KycDocumentInput, role: BackOfficeRole): KycActionResult;
};

let port: KycReviewsService | null = null;

export function setKycReviewsPort(next: KycReviewsService): void {
  port = next;
}

export const kycReviewsService: KycReviewsService = {
  list(role) {
    if (!port) throw new Error('KycReviewsService port not configured');
    return port.list(role);
  },
  getById(id, role) {
    if (!port) throw new Error('KycReviewsService port not configured');
    return port.getById(id, role);
  },
  countOpen() {
    if (!port) throw new Error('KycReviewsService port not configured');
    return port.countOpen();
  },
  falsePositive(id, input, role) {
    if (!port) throw new Error('KycReviewsService port not configured');
    return port.falsePositive(id, input, role);
  },
  requestAdditional(id, input, role) {
    if (!port) throw new Error('KycReviewsService port not configured');
    return port.requestAdditional(id, input, role);
  },
  reject(id, input, role) {
    if (!port) throw new Error('KycReviewsService port not configured');
    return port.reject(id, input, role);
  },
  verify(id, input, role) {
    if (!port) throw new Error('KycReviewsService port not configured');
    return port.verify(id, input, role);
  },
  finalizeVerify(id, role) {
    if (!port) throw new Error('KycReviewsService port not configured');
    return port.finalizeVerify(id, role);
  },
  addDocument(id, input, role) {
    if (!port) throw new Error('KycReviewsService port not configured');
    return port.addDocument(id, input, role);
  },
};
