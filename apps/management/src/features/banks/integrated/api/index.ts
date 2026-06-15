import { mockIntegratedBanksAdapter } from './mock-integrated-banks-adapter';
import type { IntegratedBanksService } from './integrated-banks-service';

export const integratedBanksService: IntegratedBanksService = mockIntegratedBanksAdapter;
