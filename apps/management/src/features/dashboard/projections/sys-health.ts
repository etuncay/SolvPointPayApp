import { SYS_HEALTH } from '@/mocks/data';
import type { SysHealthData } from '../domain/types';

export function projectSysHealth(): SysHealthData {
  return {
    ...SYS_HEALTH,
    topErrors: SYS_HEALTH.topErrors.map((e) => ({ ...e })),
  };
}
