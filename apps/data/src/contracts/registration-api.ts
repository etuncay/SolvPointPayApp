import type { AgentRegistrationRecord, AgentRegistrationSaveResult } from '../types/registration';

/**
 * Temsilci bireysel müşteri kaydı API yüzeyi.
 * Gerçek backend geçişinde OCR/sanction/lookup uçları .NET API'ye bağlanır.
 */
export interface AgentRegistrationApi {
  getById(id: string): Promise<AgentRegistrationRecord | undefined>;
  /** Kimlik No ile mevcut müşteri ara (lookup). */
  lookupByIdentityNo(idNo: string): Promise<AgentRegistrationRecord | undefined>;
  /** §8 — müşterinin aktif (devam eden) transferi var mı? Varsa kısıtlı alanlar kilitlenir. */
  hasPendingTransfer(idNo: string): Promise<boolean>;
  /** Taslak (inactive) veya tam (active) kayıt. Sanction kontrolü dahil. */
  save(
    values: Record<string, unknown>,
    opts: { draft: boolean },
  ): Promise<AgentRegistrationSaveResult>;
}
