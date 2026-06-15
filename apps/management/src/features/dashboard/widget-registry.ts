import type { ComponentType } from 'react';
import type { BackOfficeRole } from '@epay/ui';
import type { WidgetProps } from './widgets/widget-props';
import { WMyApprovals } from './widgets/w-my-approvals';
import { WPendingXfer } from './widgets/w-pending-xfer';
import { WKycManual } from './widgets/w-kyc-manual';
import { WAmlHeld } from './widgets/w-aml-held';
import { WRejected } from './widgets/w-rejected';
import { WDailyVolume } from './widgets/w-daily-volume';
import { WNewCustomers } from './widgets/w-new-customers';
import { WTopCustomers } from './widgets/w-top-customers';
import { WTopAgents } from './widgets/w-top-agents';
import { WSysHealth } from './widgets/w-sys-health';

export type WidgetDef = {
  id: string;
  col: 4 | 6 | 8 | 12;
  roles: BackOfficeRole[];
  comp: ComponentType<WidgetProps>;
};

export const ALL_WIDGETS: WidgetDef[] = [
  { id: 'my_approvals', col: 4, roles: ['ops', 'finance', 'compliance', 'management'], comp: WMyApprovals },
  { id: 'pending_xfer', col: 8, roles: ['ops', 'management'], comp: WPendingXfer },
  { id: 'kyc_manual', col: 6, roles: ['ops', 'compliance', 'management'], comp: WKycManual },
  { id: 'aml_held', col: 6, roles: ['compliance', 'ops', 'management'], comp: WAmlHeld },
  { id: 'rejected', col: 12, roles: ['ops', 'compliance', 'finance', 'management'], comp: WRejected },
  { id: 'daily_volume', col: 8, roles: ['finance', 'management'], comp: WDailyVolume },
  { id: 'new_customers', col: 4, roles: ['finance', 'management'], comp: WNewCustomers },
  { id: 'top_customers', col: 6, roles: ['finance', 'management', 'ops'], comp: WTopCustomers },
  { id: 'top_agents', col: 6, roles: ['finance', 'management', 'ops'], comp: WTopAgents },
  { id: 'sys_health', col: 12, roles: ['management'], comp: WSysHealth },
];
