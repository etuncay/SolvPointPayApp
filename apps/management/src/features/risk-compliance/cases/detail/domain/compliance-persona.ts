export type CompliancePersona = 'operator' | 'manager';

const STORAGE_KEY = 'epay_compliance_persona';

/** Compliance alt rolü — operatör (varsayılan) / yönetici */
export function getCompliancePersona(): CompliancePersona {
  if (typeof window === 'undefined') return 'operator';
  const fromUrl = new URLSearchParams(window.location.search).get('compliancePersona');
  if (fromUrl === 'manager') return 'manager';
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored === 'manager') return 'manager';
  } catch {
    /* ignore */
  }
  return 'operator';
}

export function setCompliancePersona(persona: CompliancePersona): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, persona);
  } catch {
    /* ignore */
  }
}
