import type { RiskScoreScope, FraudDslScope } from './variables';
import { isAllowedIdentifier, FRAUD_SCOPE_VARIABLES } from './variables';
import {
  FRAUD_ENTITIES,
  FRAUD_FUNCTIONS,
  FRAUD_TEXT_OPS,
  FRAUD_REFERENCE_LISTS,
  validateEntityRef,
} from './fraud-entities';

export type DslValidationResult = { ok: true } | { ok: false; errors: string[] };

/** Fraud DSL anahtar kelimeleri (mantıksal + fonksiyon + metin operatörleri) */
const FRAUD_KEYWORDS = new Set<string>([
  'AND',
  'OR',
  'NOT',
  'IN',
  'TRUE',
  'FALSE',
  ...FRAUD_FUNCTIONS,
  ...FRAUD_TEXT_OPS,
]);

/** `Entity.Attribute` veya `Entity.Attribute(gün)` referansı */
const ENTITY_REF_RE = /\b([A-Za-z][A-Za-z0-9]*)\.([A-Za-z][A-Za-z0-9]*)(?:\((\d+)\))?/g;

function balancedParens(s: string): boolean {
  let depth = 0;
  for (const ch of s) {
    if (ch === '(') depth += 1;
    if (ch === ')') {
      depth -= 1;
      if (depth < 0) return false;
    }
  }
  return depth === 0;
}

/** Basit tokenizer — string literal ve operatörler */
function tokenize(dsl: string): string[] {
  const tokens: string[] = [];
  let i = 0;
  while (i < dsl.length) {
    if (/\s/.test(dsl[i]!)) {
      i += 1;
      continue;
    }
    if (dsl[i] === '(' || dsl[i] === ')') {
      tokens.push(dsl[i]!);
      i += 1;
      continue;
    }
    if (dsl[i] === "'" || dsl[i] === '"') {
      const q = dsl[i]!;
      let j = i + 1;
      while (j < dsl.length && dsl[j] !== q) j += 1;
      if (j >= dsl.length) return [];
      tokens.push(dsl.slice(i, j + 1));
      i = j + 1;
      continue;
    }
    const m = dsl.slice(i).match(/^([a-zA-Z_][a-zA-Z0-9_]*|>=|<=|!=|>|<|=|\d+(?:\.\d+)?)/);
    if (m) {
      tokens.push(m[1]!);
      i += m[1]!.length;
      continue;
    }
    return [];
  }
  return tokens;
}

export function validateConditionDsl(dsl: string, scope: RiskScoreScope): DslValidationResult {
  return validateDslInternal(dsl, (tok) => isAllowedIdentifier(tok, scope));
}

/**
 * 7.4.1 — Fraud kapsam DSL doğrulama (entity.attribute modeli).
 * `Entity.Attribute(window?)` referansları katı doğrulanır; operatör/fonksiyon/referans
 * listeleri tanınır; geriye dönük düz değişkenler (FRAUD_SCOPE_VARIABLES) da kabul edilir.
 */
export function validateFraudConditionDsl(dsl: string, scope: FraudDslScope): DslValidationResult {
  const errors: string[] = [];
  const trimmed = dsl.trim();
  if (!trimmed) return { ok: false, errors: ['rs_dsl_empty'] };
  if (!balancedParens(trimmed)) errors.push('rs_dsl_unbalanced_parens');

  // 1) Entity.Attribute(window?) referanslarını katı doğrula
  ENTITY_REF_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = ENTITY_REF_RE.exec(trimmed)) !== null) {
    const win = m[3] != null ? Number(m[3]) : null;
    const err = validateEntityRef(m[1]!, m[2]!, win);
    if (err) errors.push(err);
  }

  // 2) Referans + string literal'leri çıkar; kalan bare identifier'ları sınıflandır
  const rest = trimmed.replace(ENTITY_REF_RE, ' ').replace(/'[^']*'|"[^"]*"/g, ' ');
  const bareIds = rest.match(/[A-Za-z_][A-Za-z0-9_]*/g) ?? [];
  const legacyVars = FRAUD_SCOPE_VARIABLES[scope] as readonly string[];
  for (const id of bareIds) {
    if (FRAUD_KEYWORDS.has(id.toUpperCase())) continue;
    if ((FRAUD_REFERENCE_LISTS as readonly string[]).includes(id)) continue;
    if ((FRAUD_ENTITIES as readonly string[]).includes(id)) continue;
    if (legacyVars.includes(id)) continue;
    if (/^[A-Z]/.test(id)) continue; // PascalCase → enum/literal (ör. AgentWithdrawal, TRY, Active)
    errors.push(`rs_dsl_unknown_token:${id}`);
  }

  if (errors.length > 0) return { ok: false, errors };
  return { ok: true };
}

function validateDslInternal(
  dsl: string,
  allowToken: (token: string) => boolean,
): DslValidationResult {
  const errors: string[] = [];
  const trimmed = dsl.trim();
  if (!trimmed) {
    return { ok: false, errors: ['rs_dsl_empty'] };
  }
  if (!balancedParens(trimmed)) {
    errors.push('rs_dsl_unbalanced_parens');
  }
  const tokens = tokenize(trimmed);
  if (tokens.length === 0) {
    return { ok: false, errors: ['rs_dsl_invalid'] };
  }
  for (const tok of tokens) {
    if (tok === '(' || tok === ')' || tok === '>' || tok === '<' || tok === '>=' || tok === '<=' || tok === '=' || tok === '!=') {
      continue;
    }
    if (/^['"]/.test(tok) || /^\d/.test(tok)) continue;
    const upper = tok.toUpperCase();
    if (upper === 'AND' || upper === 'OR' || upper === 'NOT') continue;
    if (tok === 'true' || tok === 'false') continue;
    if (!allowToken(tok)) {
      errors.push(`rs_dsl_unknown_token:${tok}`);
    }
  }
  if (errors.length > 0) return { ok: false, errors };
  return { ok: true };
}

/** MVP koşul değerlendirme — simülasyon için sınırlı subset */
export function evaluateConditionDsl(
  dsl: string,
  ctx: Record<string, unknown>,
  scope: RiskScoreScope,
): boolean {
  const v = validateConditionDsl(dsl, scope);
  if (!v.ok) return false;
  try {
    return evalBool(trimmedLower(dsl.trim()), ctx);
  } catch {
    return false;
  }
}

function trimmedLower(s: string): string {
  return s.replace(/\bAND\b/gi, '&&').replace(/\bOR\b/gi, '||').replace(/\bNOT\b/gi, '!');
}

function parseValue(raw: string): string | number | boolean {
  if (raw === 'true') return true;
  if (raw === 'false') return false;
  if (/^['"]/.test(raw)) return raw.slice(1, -1);
  const n = Number(raw);
  return Number.isNaN(n) ? raw : n;
}

function evalBool(expr: string, ctx: Record<string, unknown>): boolean {
  const orParts = splitTop(expr, '||');
  if (orParts.length > 1) return orParts.some((p) => evalBool(p.trim(), ctx));

  const andParts = splitTop(expr, '&&');
  if (andParts.length > 1) return andParts.every((p) => evalBool(p.trim(), ctx));

  const e = expr.trim();
  if (e.startsWith('!')) return !evalBool(e.slice(1).trim(), ctx);
  if (e.startsWith('(') && e.endsWith(')')) return evalBool(e.slice(1, -1).trim(), ctx);

  const cmp = e.match(/^(\w+)\s*(>=|<=|!=|>|<|=)\s*('[^']*'|"[^"]*"|\d+(?:\.\d+)?|true|false|\w+)$/);
  if (!cmp) return false;
  const [, field, op, raw] = cmp;
  const left = ctx[field!] ?? ctx[field!.toLowerCase()];
  const right = parseValue(raw!);
  switch (op) {
    case '>':
      return Number(left) > Number(right);
    case '<':
      return Number(left) < Number(right);
    case '>=':
      return Number(left) >= Number(right);
    case '<=':
      return Number(left) <= Number(right);
    case '=':
      return left === right || String(left) === String(right);
    case '!=':
      return left !== right && String(left) !== String(right);
    default:
      return false;
  }
}

function splitTop(expr: string, sep: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let start = 0;
  let i = 0;
  while (i < expr.length) {
    const ch = expr[i]!;
    if (ch === '(') depth += 1;
    if (ch === ')') depth -= 1;
    if (depth === 0 && expr.slice(i, i + sep.length) === sep) {
      parts.push(expr.slice(start, i));
      i += sep.length;
      start = i;
      continue;
    }
    i += 1;
  }
  parts.push(expr.slice(start));
  return parts.length > 1 ? parts : [expr];
}
