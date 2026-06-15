/* ──────────────────────────────────────────────────────
 *  DynamicForm — config-driven form renderer
 *
 *  Panelli formlar: üst page-head + FormPrimaryActions,
 *  sol SectionRail, sağda dikey FormCard yığını (scroll spy).
 * ────────────────────────────────────────────────────── */
import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import type * as React from 'react';
import {
  Ban,
  Eye,
  FileText,
  History,
  IdCard,
  Mail,
  Save,
  Settings,
  Trash2,
  Upload,
  User,
  Wallet,
  X,
} from 'lucide-react';
import type {
  DynamicFormProps,
  DynamicFormHeaderProps,
  FieldConfig,
  FormConfig,
  FormHeaderActionConfig,
  PanelConfig,
  FormTabConfig,
  SelectOption,
  ToolbarButtonConfig,
} from './types';
import { FormShellHead } from './form-shell-head';
import { FormMode } from './form-mode';
import { evalBool, evaluateExpression } from './expression';
import {
  collectFields,
  runAsyncValidators,
  validateAllFields,
  validateField,
} from './validation';
import { FieldRenderer } from './field-renderer';
import { useConfirm } from './use-confirm';
import { FormCard, FormGrid } from '../form/form-card';
import { FormLayout, SectionRail, SectionTopBar, type RailSection } from '../form/section-rail';
import { FormPrimaryActions } from '../composite/form-primary-actions';
import { Button } from '../primitives/button';
import { cn } from '../lib/utils';

const PANEL_ICON_MAP: Record<string, React.ReactNode> = {
  user: <User size={13} />,
  'id-card': <IdCard size={13} />,
  mail: <Mail size={13} />,
  settings: <Settings size={13} />,
  file: <FileText size={13} />,
  wallet: <Wallet size={13} />,
};

function panelIcon(key?: string): React.ReactNode {
  if (!key) return undefined;
  return PANEL_ICON_MAP[key];
}

/** config.header.actions ikon anahtarları */
const HEADER_ICON_MAP: Record<string, React.ReactNode> = {
  ban: <Ban size={13} />,
  upload: <Upload size={13} style={{ transform: 'rotate(180deg)' }} />,
  history: <History size={13} />,
  file: <FileText size={13} />,
  eye: <Eye size={13} />,
};

/** config.buttonToolbar özel butonları — formun 3 yerinde tekrar etmeyecek şekilde tek bileşen. */
function CustomToolbarButtons({
  buttons,
  disabled,
  onClick,
  wrap = true,
}: {
  buttons: ToolbarButtonConfig[];
  disabled?: boolean;
  onClick: (key: string, confirm?: string) => void;
  wrap?: boolean;
}) {
  if (buttons.length === 0) return null;
  const items = buttons.map((b) => (
    <button
      key={b.key}
      type="button"
      className={cn('btn', b.variant ? `btn-${b.variant}` : 'btn-secondary')}
      onClick={() => onClick(b.key, b.confirm)}
      disabled={disabled}
    >
      {b.label}
    </button>
  ));
  if (!wrap) return <>{items}</>;
  return (
    <div className="flex items-center gap-8" style={{ marginTop: 16 }}>
      {items}
    </div>
  );
}

/* ── state ──────────────────────────────────────────── */

interface FormState {
  values: Record<string, unknown>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  activeTab: string;
  loading: boolean;
  apiOptions: Record<string, SelectOption[]>;
  /** Submit denendi mi — true ise hatalar touched olmasa da gösterilir */
  submitAttempted: boolean;
}

type FormAction =
  | { type: 'SET_VALUE'; name: string; value: unknown }
  | { type: 'SET_VALUES'; values: Record<string, unknown> }
  | { type: 'SET_ERRORS'; errors: Record<string, string> }
  | { type: 'CLEAR_ERRORS' }
  | { type: 'TOUCH'; name: string }
  | { type: 'SET_TAB'; tab: string }
  | { type: 'SET_LOADING'; loading: boolean }
  | { type: 'SET_API_OPTIONS'; name: string; options: SelectOption[] }
  | { type: 'SET_SUBMITTED'; value: boolean }
  | { type: 'RESET'; values: Record<string, unknown> };

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case 'SET_VALUE':
      return {
        ...state,
        values: { ...state.values, [action.name]: action.value },
        errors: { ...state.errors, [action.name]: undefined as unknown as string },
      };
    case 'SET_VALUES':
      return { ...state, values: { ...state.values, ...action.values } };
    case 'SET_ERRORS':
      return { ...state, errors: { ...state.errors, ...action.errors } };
    case 'CLEAR_ERRORS':
      return { ...state, errors: {} };
    case 'TOUCH':
      return { ...state, touched: { ...state.touched, [action.name]: true } };
    case 'SET_TAB':
      return { ...state, activeTab: action.tab };
    case 'SET_LOADING':
      return { ...state, loading: action.loading };
    case 'SET_API_OPTIONS':
      return { ...state, apiOptions: { ...state.apiOptions, [action.name]: action.options } };
    case 'SET_SUBMITTED':
      return { ...state, submitAttempted: action.value };
    case 'RESET':
      return { ...state, values: action.values, errors: {}, touched: {}, submitAttempted: false };
    default:
      return state;
  }
}

function buildInitialValues(
  config: FormConfig,
  initial?: Record<string, unknown>,
): Record<string, unknown> {
  const vals: Record<string, unknown> = {};
  const allFields = collectFields(config.fields, config.panels, config.tabs);

  function applyDefaults(fields: FieldConfig[]) {
    for (const f of fields) {
      if (f.type === 'Row' && f.fields) {
        applyDefaults(f.fields);
        continue;
      }
      if (f.defaultValue !== undefined) vals[f.name] = f.defaultValue;
    }
  }
  applyDefaults(allFields);
  if (initial) Object.assign(vals, initial);
  return vals;
}

function getFirstTabKey(config: FormConfig): string {
  if (config.tabs?.length) return config.tabs[0].key;
  return '';
}

function panelVisible(panel: PanelConfig, values: Record<string, unknown>, mode: FormMode): boolean {
  return !panel.visible || evalBool(panel.visible, values, mode, false);
}

function buildPanelSections(
  panels: PanelConfig[],
  values: Record<string, unknown>,
  mode: FormMode,
): RailSection[] {
  return panels
    .filter((p) => panelVisible(p, values, mode))
    .map((p, i) => ({
      id: p.key,
      no: p.no ?? String(i + 1),
      label: p.title,
    }));
}

function tabLocked(tab: FormTabConfig, values: Record<string, unknown>, mode: FormMode): boolean {
  return !!(tab.locked && evalBool(tab.locked, values, mode, false));
}

function buildTabSections(
  tabs: FormTabConfig[],
  values: Record<string, unknown>,
  mode: FormMode,
): RailSection[] {
  const sections: RailSection[] = [];
  let tabIndex = 0;
  for (const tab of tabs) {
    if (tab.visible && !evalBool(tab.visible, values, mode, false)) continue;
    tabIndex += 1;
    const locked = tabLocked(tab, values, mode);
    if (tab.panels?.length) {
      for (const p of tab.panels) {
        if (!panelVisible(p, values, mode)) continue;
        sections.push({
          id: p.key,
          no: p.no ?? '·',
          label: p.title,
          disabled: locked,
        });
      }
    } else {
      sections.push({
        id: tab.key,
        no: String(tabIndex),
        label: tab.title,
        disabled: locked,
      });
    }
  }
  return sections;
}

/** Row child'ları dahil, alan adı bu listede var mı? */
function fieldsContain(fields: FieldConfig[] | undefined, name: string): boolean {
  for (const f of fields ?? []) {
    if (f.name === name) return true;
    if (f.type === 'Row' && f.fields && fieldsContain(f.fields, name)) return true;
  }
  return false;
}

function findSectionForField(
  fieldName: string,
  config: FormConfig,
): string | undefined {
  if (config.panels) {
    for (const p of config.panels) {
      if (fieldsContain(p.fields, fieldName)) return p.key;
    }
  }
  if (config.tabs) {
    for (const tab of config.tabs) {
      if (fieldsContain(tab.fields, fieldName)) return tab.key;
      for (const p of tab.panels ?? []) {
        if (fieldsContain(p.fields, fieldName)) return p.key;
      }
    }
  }
  return undefined;
}

/** Bir tab'ın tüm yaprak alan adları (Row child'ları dahil, Divider hariç). */
function tabLeafNames(tab: FormTabConfig): string[] {
  const names: string[] = [];
  const walk = (fields?: FieldConfig[]) => {
    for (const f of fields ?? []) {
      if (f.type === 'Divider') continue;
      if (f.type === 'Row' && f.fields) {
        walk(f.fields);
        continue;
      }
      names.push(f.name);
    }
  };
  walk(tab.fields);
  for (const p of tab.panels ?? []) walk(p.fields);
  return names;
}

function useSectionScrollSpy(sectionIds: string[], _deps: unknown[]) {
  const [activeSec, setActiveSec] = useState(sectionIds[0] ?? '');
  // Section ID listesi değişince ilk bölümü resetle.
  const idsKey = sectionIds.join(',');

  useEffect(() => {
    if (sectionIds.length) setActiveSec(sectionIds[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idsKey]);

  useEffect(() => {
    if (!sectionIds.length) return;

    const scrollRoot = document.querySelector<HTMLElement>('.main');
    if (!scrollRoot) return;

    // Sticky section-topbar'ın yaklaşık yüksekliği + üst padding payı.
    const TOPBAR_OFFSET = 56;

    /**
     * Elemanın scrollRoot içindeki kümülatif offsetTop'unu hesaplar.
     * getBoundingClientRect() scroll durumuna bağlıdır; offsetTop zinciri
     * daha güvenilirdir.
     */
    function getOffsetTop(el: HTMLElement): number {
      let top = 0;
      let cur: HTMLElement | null = el;
      while (cur && cur !== scrollRoot) {
        top += cur.offsetTop;
        cur = cur.offsetParent as HTMLElement | null;
      }
      return top;
    }

    function calcActive(): string {
      // Eşik: geçerli scroll pozisyonu + topbar yüksekliği.
      const threshold = scrollRoot!.scrollTop + TOPBAR_OFFSET;
      let bestId = sectionIds[0];
      for (const id of sectionIds) {
        const el = document.getElementById(`sec-${id}`);
        if (!el) continue;
        // Eşiği aşan son section aktiftir (section'lar yukarıdan aşağı sıralı).
        if (getOffsetTop(el) <= threshold) bestId = id;
      }
      return bestId;
    }

    const onScroll = () => setActiveSec(calcActive());

    // Hem konteyneri hem window'ı dinle; bazı ortamlarda event farklı
    // elementten yayılabilir (klavye, programatik scroll vb.).
    scrollRoot.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    // İlk yüklemede aktif bölümü hesapla.
    onScroll();

    return () => {
      scrollRoot.removeEventListener('scroll', onScroll);
      window.removeEventListener('scroll', onScroll);
    };
    // Yalnızca section ID listesi değişince yeniden kur; form değerleri
    // dinleyiciyi bozmamalı.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idsKey]);

  return [activeSec, setActiveSec] as const;
}

function FormPageHead({
  header,
  mode,
  isView,
  showSave,
  showDelete,
  isLoading,
  onSave,
  onCancel,
  onDelete,
  onDraft,
  t,
}: {
  header?: DynamicFormHeaderProps;
  mode: FormMode;
  isView: boolean;
  showSave: boolean;
  showDelete: boolean;
  isLoading: boolean;
  onSave: () => void;
  onCancel?: () => void;
  onDelete: () => void;
  onDraft?: () => void;
  t: (key: string, fb?: string) => string;
}) {
  if (header?.hidePageHead) return null;

  const title = header?.title ?? t('form_details', 'Detaylar');
  const subtitle = header?.subtitle;

  return (
    <div className="page-head" style={{ alignItems: 'center' }}>
      <div style={{ minWidth: 0 }}>
        <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {title}
        </h1>
        {(header?.status || subtitle) && (
          <div className="head-status">
            {header?.status}
            {subtitle ? <span className="reason">{subtitle}</span> : null}
          </div>
        )}
      </div>
      <div className="head-actions" style={{ flexWrap: 'wrap', justifyContent: 'flex-end' }}>
        <FormPrimaryActions
          leading={header?.leading}
          showDraft={header?.showDraft && !isView}
          onDraft={onDraft}
          draftLabel={header?.draftLabel ?? t('form_draft', 'Taslak Kaydet')}
          showSave={showSave && !isView}
          onSave={onSave}
          saveLabel={
            header?.saveLabel ??
            (mode === FormMode.Create ? t('form_save_verify', 'Kaydet ve Doğrula') : t('form_save', 'Kaydet'))
          }
          saveDisabled={isLoading}
          showCancel={!isView && !!onCancel}
          onCancel={onCancel}
          cancelLabel={header?.cancelLabel ?? t('form_cancel', 'Vazgeç')}
          trailing={
            <>
              {showDelete && (
                <Button type="button" variant="danger" onClick={onDelete} disabled={isLoading}>
                  <Trash2 size={13} />
                  {t('table_delete', 'Sil')}
                </Button>
              )}
              {header?.trailing}
            </>
          }
        />
      </div>
    </div>
  );
}

export function DynamicForm({
  config,
  mode,
  permissions,
  initialValues,
  diff,
  customFunctions,
  onSubmit,
  onCancel,
  onDelete,
  onButtonClick,
  shell,
  header,
  t = (k, fb) => fb ?? k,
  loading: externalLoading,
  className,
}: DynamicFormProps) {
  const [state, dispatch] = useReducer(formReducer, {
    values: buildInitialValues(config, initialValues),
    errors: {},
    touched: {},
    activeTab: getFirstTabKey(config),
    loading: false,
    apiOptions: {},
    submitAttempted: false,
  });
  const dirtyRef = useRef(false);
  const [tabErrors, setTabErrors] = useState<Record<string, number>>({});
  const { confirm, dialog } = useConfirm();

  const isView = mode === FormMode.View || mode === FormMode.Delete;
  const isLoading = state.loading || externalLoading;
  const useRailLayout = !!(config.panels?.length || config.tabs?.length);

  const handleFieldChange = useCallback(
    (name: string, value: unknown) => {
      dispatch({ type: 'SET_VALUE', name, value });
      dispatch({ type: 'TOUCH', name });
      dirtyRef.current = true;
      customFunctions?.onFieldChange?.(name, value, state.values);

      const allFields = collectFields(config.fields, config.panels, config.tabs);
      for (const f of allFields) {
        if (f.optionsFromApi?.dependsOn === name && customFunctions?.apiCall) {
          void customFunctions.apiCall(f.optionsFromApi.endpoint, value).then((opts) => {
            dispatch({ type: 'SET_API_OPTIONS', name: f.name, options: opts });
            dispatch({ type: 'SET_VALUE', name: f.name, value: undefined });
          });
        }
      }
    },
    [config, customFunctions, state.values],
  );

  /** Yalnızca o an GÖRÜNÜR alanları topla (gizli koşullu alanlar doğrulanmaz). */
  const collectVisibleFields = useCallback((): FieldConfig[] => {
    const out: FieldConfig[] = [];
    const walk = (fields?: FieldConfig[]) => {
      for (const f of fields ?? []) {
        if (f.type === 'Divider') continue;
        const visible =
          evalBool(f.shouldRender, state.values, mode, false) &&
          evalBool(f.visibilityRules, state.values, mode, false);
        if (!visible) continue;
        if (f.type === 'Row' && f.fields) {
          walk(f.fields);
          continue;
        }
        out.push(f);
      }
    };
    if (config.fields) walk(config.fields);
    if (config.panels) {
      for (const p of config.panels) {
        if (!panelVisible(p, state.values, mode)) continue;
        walk(p.fields);
      }
    }
    if (config.tabs) {
      for (const tab of config.tabs) {
        if (tab.visible && !evalBool(tab.visible, state.values, mode, false)) continue;
        if (tabLocked(tab, state.values, mode)) continue;
        walk(tab.fields);
        for (const p of tab.panels ?? []) {
          if (!panelVisible(p, state.values, mode)) continue;
          walk(p.fields);
        }
      }
    }
    return out;
  }, [config, state.values, mode]);

  const handleSubmit = useCallback(async () => {
    const visibleFields = collectVisibleFields();
    const syncErrors = validateAllFields(visibleFields, state.values);
    const asyncErrors = await runAsyncValidators(visibleFields, state.values, customFunctions);
    const errors = { ...syncErrors, ...asyncErrors };

    if (Object.keys(errors).length > 0) {
      // Hataları yaz + submit denendi işaretle (alan touched olmasa da görünür).
      dispatch({ type: 'SET_ERRORS', errors });
      dispatch({ type: 'SET_SUBMITTED', value: true });

      const firstField = Object.keys(errors)[0];
      const secId = findSectionForField(firstField, config);
      if (typeof document !== 'undefined') {
        if (secId) {
          document.getElementById(`sec-${secId}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        // İlk hatalı alanı odakla (best-effort; scroll'u bozmadan).
        window.setTimeout(() => {
          const el = document.getElementById(firstField);
          if (el) {
            el.focus({ preventScroll: true });
            if (!secId) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 60);
      }

      if (config.tabs) {
        const errs: Record<string, number> = {};
        for (const tab of config.tabs) {
          if (tabLocked(tab, state.values, mode)) continue;
          const count = tabLeafNames(tab).filter((n) => errors[n]).length;
          if (count > 0) errs[tab.key] = count;
        }
        setTabErrors(errs);
      }
      return;
    }

    dispatch({ type: 'CLEAR_ERRORS' });
    dispatch({ type: 'SET_SUBMITTED', value: false });
    setTabErrors({});
    dispatch({ type: 'SET_LOADING', loading: true });
    try {
      await onSubmit?.(state.values);
    } finally {
      dispatch({ type: 'SET_LOADING', loading: false });
    }
  }, [collectVisibleFields, config, state.values, customFunctions, onSubmit]);

  const handleCancel = useCallback(async () => {
    if (dirtyRef.current) {
      const ok = await confirm({
        title: t('form_discard_title', 'Değişiklikler kaybolacak'),
        description: t('form_discard_confirm', 'Kaydetmeden çıkılsın mı?'),
        confirmLabel: t('form_discard_ok', 'Çık'),
        cancelLabel: t('form_keep_editing', 'Devam et'),
        danger: true,
      });
      if (!ok) return;
    }
    onCancel?.();
  }, [onCancel, t, confirm]);

  const handleDelete = useCallback(async () => {
    const ok = await confirm({
      title: t('form_delete_title', 'Kaydı sil'),
      description: t('form_delete_confirm', 'Bu kaydı silmek istediğinize emin misiniz?'),
      confirmLabel: t('table_delete', 'Sil'),
      cancelLabel: t('form_cancel', 'Vazgeç'),
      danger: true,
    });
    if (!ok) return;
    onDelete?.();
  }, [onDelete, t, confirm]);

  const handleCustomButton = useCallback(
    async (key: string, confirmText?: string) => {
      if (confirmText) {
        const ok = await confirm({
          description: confirmText,
          confirmLabel: t('form_confirm', 'Onayla'),
          cancelLabel: t('form_cancel', 'Vazgeç'),
        });
        if (!ok) return;
      }
      dispatch({ type: 'SET_LOADING', loading: true });
      try {
        await onButtonClick?.(key, state.values);
      } finally {
        dispatch({ type: 'SET_LOADING', loading: false });
      }
    },
    [onButtonClick, state.values, confirm, t],
  );

  /** İsimden alan config'i (Row child'ları dahil) — blur validasyonu / option init için */
  const fieldsByName = useMemo(() => {
    const map = new Map<string, FieldConfig>();
    const walk = (list?: FieldConfig[]) => {
      for (const f of list ?? []) {
        if (f.type === 'Row' && f.fields) {
          walk(f.fields);
          continue;
        }
        map.set(f.name, f);
      }
    };
    walk(collectFields(config.fields, config.panels, config.tabs));
    return map;
  }, [config]);

  const handleFieldBlur = useCallback(
    (name: string) => {
      const f = fieldsByName.get(name);
      if (!f) return;
      const err = validateField(f, state.values[name], state.values);
      dispatch({ type: 'TOUCH', name });
      dispatch({ type: 'SET_ERRORS', errors: { [name]: (err ?? undefined) as unknown as string } });
    },
    [fieldsByName, state.values],
  );

  // optionsFromApi seçeneklerini yükle — mount'ta ve initialValues değişince
  // (edit modunda bağımlı alan, ör. ülkeye bağlı şehir, dolsun).
  useEffect(() => {
    if (!customFunctions?.apiCall) return;
    for (const f of fieldsByName.values()) {
      if (!f.optionsFromApi) continue;
      const dep = f.optionsFromApi.dependsOn;
      const depVal = dep ? (initialValues?.[dep] ?? state.values[dep]) : undefined;
      if (dep && (depVal == null || depVal === '')) continue;
      void customFunctions.apiCall(f.optionsFromApi.endpoint, depVal).then((opts) => {
        dispatch({ type: 'SET_API_OPTIONS', name: f.name, options: opts });
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customFunctions, fieldsByName, initialValues]);

  // initialValues referansı değişince (kullanıcı düzenlemediyse) formu yeniden tohumla.
  const initialRef = useRef(initialValues);
  useEffect(() => {
    if (initialValues === initialRef.current) return;
    initialRef.current = initialValues;
    if (dirtyRef.current) return;
    dispatch({ type: 'RESET', values: buildInitialValues(config, initialValues) });
    dirtyRef.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialValues]);

  const renderField = useCallback(
    (field: FieldConfig, tabForceDisabled = false): React.ReactNode => {
      // Row → tam genişlik alt-grid; child'lar düz değer okur/yazar + kurallar uygulanır.
      if (field.type === 'Row' && field.fields) {
        const rowVisible =
          evalBool(field.shouldRender, state.values, mode, false) &&
          evalBool(field.visibilityRules, state.values, mode, false);
        if (!rowVisible) return null;
        const children = field.fields.map((f) => renderField(f, tabForceDisabled)).filter(Boolean);
        if (children.length === 0) return null;
        return (
          <div key={field.name} className="fgrid" style={{ gridColumn: '1 / -1' }}>
            {children}
          </div>
        );
      }

      const visible =
        evalBool(field.shouldRender, state.values, mode, false) &&
        evalBool(field.visibilityRules, state.values, mode, false);
      if (!visible) return null;

      const disabled = tabForceDisabled || !evalBool(field.enableRules, state.values, mode);
      // Zorunluluk: statik rules.required VEYA koşullu requiredRules ifadesi.
      const required =
        (field.rules?.some((r) => r.required) ?? false) ||
        (field.requiredRules ? evalBool(field.requiredRules, state.values, mode) : false);

      const changed = diff?.changedFields.includes(field.name) ?? false;

      return (
        <FieldRenderer
          key={field.name}
          field={field}
          value={state.values[field.name]}
          error={
            state.touched[field.name] || state.submitAttempted
              ? state.errors[field.name]
              : undefined
          }
          disabled={disabled || isView}
          mode={mode}
          onChange={handleFieldChange}
          onBlur={handleFieldBlur}
          apiOptions={state.apiOptions[field.name]}
          customFunctions={customFunctions}
          required={required}
          changed={changed}
          oldValue={changed ? diff?.oldValues?.[field.name] : undefined}
          oldLabel={diff?.oldLabel}
        />
      );
    },
    [state, mode, isView, handleFieldChange, handleFieldBlur, customFunctions, diff],
  );

  const renderFields = useCallback(
    (fields: FieldConfig[], tabForceDisabled = false) =>
      fields.map((field) => renderField(field, tabForceDisabled)),
    [renderField],
  );

  const showSave =
    !isView && (mode === FormMode.Create ? permissions?.create !== false : permissions?.update !== false);
  const showDelete =
    (mode === FormMode.Update || mode === FormMode.Delete) && permissions?.delete === true;

  const railSections = useMemo(() => {
    if (config.panels?.length) {
      return buildPanelSections(config.panels, state.values, mode);
    }
    if (config.tabs?.length) {
      return buildTabSections(config.tabs, state.values, mode);
    }
    return [];
  }, [config.panels, config.tabs, state.values, mode]);

  const sectionIds = useMemo(() => railSections.map((s) => s.id), [railSections]);
  const [activeSec, setActiveSec] = useSectionScrollSpy(sectionIds, [mode, state.values]);

  const renderPanelCard = useCallback(
    (panel: PanelConfig) => {
      if (!panelVisible(panel, state.values, mode)) return null;
      return (
        // Karta tıklanınca topbar'da o bölüm aktiflenir (scroll spy fallback).
        <div key={panel.key} onClickCapture={() => setActiveSec(panel.key)}>
          <FormCard
            id={`sec-${panel.key}`}
            no={panel.no}
            title={panel.title}
            meta={panel.meta}
            icon={panelIcon(panel.icon)}
          >
            <FormGrid>{renderFields(panel.fields)}</FormGrid>
          </FormCard>
        </div>
      );
    },
    [renderFields, state.values, mode, setActiveSec],
  );

  const bottomToolbar = useMemo(() => {
    if (useRailLayout) return null;
    if (isView && !config.buttonToolbar?.buttons?.length) return null;

    return (
      <div className="flex items-center gap-8" style={{ marginTop: 16 }}>
        {showSave && (
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => void handleSubmit()}
            disabled={isLoading}
          >
            <Save size={14} />
            {mode === FormMode.Create ? t('form_save', 'Kaydet') : t('form_update', 'Güncelle')}
          </button>
        )}
        {showDelete && (
          <button type="button" className="btn btn-danger" onClick={handleDelete} disabled={isLoading}>
            <Trash2 size={14} />
            {t('table_delete', 'Sil')}
          </button>
        )}
        {!isView && onCancel && (
          <button type="button" className="btn btn-ghost" onClick={handleCancel} disabled={isLoading}>
            <X size={14} />
            {t('form_cancel', 'Vazgeç')}
          </button>
        )}
        <CustomToolbarButtons
          buttons={(config.buttonToolbar?.buttons ?? []).filter((b) => !b.modes || b.modes.includes(mode))}
          disabled={isLoading}
          onClick={(k, c) => void handleCustomButton(k, c)}
          wrap={false}
        />
      </div>
    );
  }, [
    useRailLayout,
    showSave,
    showDelete,
    isView,
    isLoading,
    mode,
    config,
    handleSubmit,
    handleDelete,
    handleCancel,
    handleCustomButton,
    t,
    onCancel,
  ]);

  // config.header (JSON) → DynamicFormHeaderProps. Prop `header` öncelikli birleşir.
  const resolvedHeader = useMemo<DynamicFormHeaderProps | undefined>(() => {
    const hc = config.header;
    if (!hc) return header;

    const comps = customFunctions?.components;
    const renderComp = (key?: string): React.ReactNode => {
      if (!key) return undefined;
      const Comp = comps?.[key];
      return Comp ? <Comp value={state.values} onChange={() => {}} /> : undefined;
    };
    const labelFrom = (key?: string, expr?: string): string | undefined => {
      if (expr) return t(String(evaluateExpression(expr, state.values, mode, key ?? '') ?? key ?? ''));
      return key ? t(key) : undefined;
    };
    const textFrom = (key?: string, expr?: string): string | undefined => {
      if (expr) return String(evaluateExpression(expr, state.values, mode, '') ?? '');
      return key ? t(key) : undefined;
    };

    const actionNode = (a: FormHeaderActionConfig) => (
      <Button
        key={a.key}
        type="button"
        variant={a.variant === 'secondary' ? 'default' : a.variant}
        onClick={() => void handleCustomButton(a.key, a.confirm)}
        disabled={!!isLoading}
      >
        {a.icon ? HEADER_ICON_MAP[a.icon] : null}
        {a.labelKey ? t(a.labelKey) : a.key}
      </Button>
    );
    const visibleActions = (hc.actions ?? []).filter((a) =>
      evalBool(a.visible, state.values, mode, false),
    );
    const leadingActions = visibleActions.filter((a) => a.position === 'leading');
    const trailingActions = visibleActions.filter((a) => a.position !== 'leading');

    const built: DynamicFormHeaderProps = {
      title: renderComp(hc.titleComponent) ?? textFrom(hc.titleKey, hc.titleExpr),
      subtitle: textFrom(hc.subtitleKey, hc.subtitleExpr),
      status: renderComp(hc.statusComponent),
      showDraft: hc.showDraftExpr ? evalBool(hc.showDraftExpr, state.values, mode, false) : hc.showDraft,
      draftLabel: hc.draftLabelKey ? t(hc.draftLabelKey) : undefined,
      saveLabel: labelFrom(hc.saveLabelKey, hc.saveLabelExpr),
      cancelLabel: hc.cancelLabelKey ? t(hc.cancelLabelKey) : undefined,
      railTitle: hc.railTitleKey ? t(hc.railTitleKey) : undefined,
      leading: leadingActions.length ? <>{leadingActions.map(actionNode)}</> : undefined,
      trailing: trailingActions.length ? <>{trailingActions.map(actionNode)}</> : undefined,
    };
    return header ? { ...built, ...header } : built;
  }, [config.header, header, customFunctions, state.values, mode, t, handleCustomButton, isLoading]);

  const pageHead = (
    <FormPageHead
      header={resolvedHeader}
      mode={mode}
      isView={isView}
      showSave={showSave}
      showDelete={showDelete}
      isLoading={!!isLoading}
      onSave={() => void handleSubmit()}
      onCancel={onCancel ? handleCancel : undefined}
      onDelete={handleDelete}
      onDraft={
        resolvedHeader?.onDraft ??
        (resolvedHeader?.showDraft && onButtonClick ? () => void handleCustomButton('draft') : undefined)
      }
      t={t}
    />
  );

  const showShell = shell && !shell.hidePageHead;
  const shellHead = showShell ? <FormShellHead shell={shell} /> : null;
  const bodyStyle = showShell ? ({ marginTop: 16 } as React.CSSProperties) : undefined;

  const customToolbarButtons =
    config.buttonToolbar?.buttons?.filter((b) => !b.modes || b.modes.includes(mode)) ?? [];

  const railTitle = resolvedHeader?.railTitle ?? t('form_sections', 'Bölümler');

  const navigateSection = (id: string) => {
    document.getElementById(`sec-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Gezinme menüsü konumu: varsayılan `top` (üstte yatay sticky bar); `sidebar` → sol rail.
  const navLayout = config.navLayout ?? 'top';
  const topNav =
    navLayout === 'top' ? (
      <SectionTopBar sections={railSections} activeId={activeSec} onNavigate={navigateSection} />
    ) : null;
  const railNav =
    navLayout === 'top' ? null : (
      <SectionRail
        sections={railSections}
        activeId={activeSec}
        title={railTitle}
        onNavigate={navigateSection}
      />
    );

  /* ── flat fields ── */
  if (config.fields && !config.panels && !config.tabs) {
    return (
      <div className={cn('dynamic-form', className)}>
        {shellHead}
        {dialog}
        <div style={bodyStyle}>
          {pageHead}
          {config.title && <h2 className="fs-14 fw-600" style={{ marginBottom: 12 }}>{config.title}</h2>}
          <FormCard title={config.title ?? t('form_details', 'Detaylar')}>
            <FormGrid>{renderFields(config.fields)}</FormGrid>
          </FormCard>
          {bottomToolbar}
        </div>
      </div>
    );
  }

  /* ── panels (rail layout) ── */
  if (config.panels && !config.tabs) {
    const visiblePanels = config.panels.filter((p) => panelVisible(p, state.values, mode));

    return (
      <div className={cn('dynamic-form', className)}>
        {shellHead}
        {dialog}
        <div style={bodyStyle}>
          {pageHead}
          {topNav}
          <FormLayout rail={railNav}>
            {visiblePanels.map((panel) => renderPanelCard(panel))}
          </FormLayout>
          <CustomToolbarButtons
            buttons={customToolbarButtons}
            disabled={isLoading}
            onClick={(k, c) => void handleCustomButton(k, c)}
          />
        </div>
      </div>
    );
  }

  /* ── tabs → rail + stacked sections ── */
  if (config.tabs) {
    const visibleTabs = config.tabs.filter(
      (tab) => !tab.visible || evalBool(tab.visible, state.values, mode, false),
    );

    return (
      <div className={cn('dynamic-form', className)}>
        {shellHead}
        {dialog}
        <div style={bodyStyle}>
          {pageHead}
          {topNav}
          <FormLayout rail={railNav}>
            {visibleTabs.map((tab) => {
              const locked = tabLocked(tab, state.values, mode);
              if (tab.panels?.length) {
                return tab.panels
                  .filter((p) => panelVisible(p, state.values, mode))
                  .map((panel) => renderPanelCard(panel));
              }
              if (tab.fields) {
                return (
                  <div key={tab.key} onClickCapture={() => setActiveSec(tab.key)}>
                    <FormCard id={`sec-${tab.key}`} title={tab.title}>
                      {locked ? (
                        <p className="t-mute fs-12" style={{ margin: '0 0 12px' }}>
                          {tab.lockedMessage ?? t('form_tab_locked', 'Bu bölüme geçmek için önceki adımları tamamlayın.')}
                        </p>
                      ) : null}
                      <FormGrid>{renderFields(tab.fields, locked)}</FormGrid>
                      {!locked && tabErrors[tab.key] ? (
                        <p className="t-danger fs-11" style={{ marginTop: 8 }}>
                          {tabErrors[tab.key]} {t('form_tab_errors', 'alan hatalı')}
                        </p>
                      ) : null}
                    </FormCard>
                  </div>
                );
              }
              return null;
            })}
          </FormLayout>
          <CustomToolbarButtons
            buttons={customToolbarButtons}
            disabled={isLoading}
            onClick={(k, c) => void handleCustomButton(k, c)}
          />
        </div>
      </div>
    );
  }

  return null;
}
