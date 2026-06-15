export {
  SYSTEM_CHILD_IDS,
  SYSTEM_CHILD_HREFS,
  SYSTEM_PATH_SUB_ID,
  SYSTEM_SUB_LABEL_KEYS,
  canSeeSystemMenu,
  filterSystemMenuItem,
  getSystemMenuDefaultHref,
  getSystemSectionNo,
  getSystemViewMode,
  getVisibleSystemChildIds,
  resolveSystemActiveSub,
  type SystemChildId,
} from './domain/nav-permissions';
export { SystemSectionPlaceholder } from './system-section-placeholder';
export { SystemIndexRedirect } from './system-index-redirect';
export { BACKOFFICE_SCREENS, getScreenById, getScreenByKey } from './shared/screen-registry';
export type { BackofficeScreenDef } from './shared/screen-registry';
export { SYSTEM_PARAMETERS_MODULE } from './shared/parameters-store-path';
