import type { ReferenceListCode } from './types';

export const REFERENCE_LIST_I18N: Record<ReferenceListCode, string> = {
  RiskyCountries: 'rm_list_RiskyCountries',
  RiskyPhonePrefixes: 'rm_list_RiskyPhonePrefixes',
  RiskyEmailProviders: 'rm_list_RiskyEmailProviders',
  RiskyCities: 'rm_list_RiskyCities',
  UsuallyUsedCurrencies: 'rm_list_UsuallyUsedCurrencies',
  BlacklistedKeywords: 'rm_list_BlacklistedKeywords',
  RiskyAgents: 'rm_list_RiskyAgents',
  RiskyCustomers: 'rm_list_RiskyCustomers',
  RiskyCredentials: 'rm_list_RiskyCredentials',
  RiskyIPs: 'rm_list_RiskyIPs',
  RiskyOccupations: 'rm_list_RiskyOccupations',
};

export const DEFAULT_OPERATOR_GROUP_ID = 'GRP_OPERATORS';
export const DEFAULT_MANAGER_GROUP_ID = 'GRP_MANAGERS';
