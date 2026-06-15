/* ──────────────────────────────────────────────────────
 *  Dynamic Form & Table — Config DSL Types
 *  UI-agnostic declarative config → runtime renderer
 * ────────────────────────────────────────────────────── */
import type * as React from 'react';
import type { FormMode } from './form-mode';

// ─── Shared ──────────────────────────────────────────

export type { FormMode } from './form-mode';

export interface FormPermissions {
  view?: boolean;
  create?: boolean;
  update?: boolean;
  delete?: boolean;
}

export type TranslateFn = (key: string, fallback?: string) => string;

// ─── Validation ──────────────────────────────────────

export interface FieldRule {
  required?: boolean;
  message?: string;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  patternMessage?: string;
  /** Cross-field expression: `'values.password === values.confirmPassword'` */
  expression?: string;
  expressionMessage?: string;
  /** Key in customFunctions.asyncValidators */
  asyncValidator?: string;
}

// ─── Field Config ────────────────────────────────────

export type FieldType =
  | 'Input'
  | 'InputNumber'
  | 'TextArea'
  | 'Select'
  | 'MultiSelect'
  | 'Combobox'
  | 'Checkbox'
  | 'Switch'
  | 'RadioGroup'
  | 'ToggleGroup'
  | 'Toggle'
  | 'DatePicker'
  | 'DateRangePicker'
  | 'Upload'
  | 'MaskedInput'
  | 'PasswordInput'
  | 'InputOTP'
  | 'TagsInput'
  | 'Slider'
  | 'Divider'
  | 'Row'
  | 'CustomComponent';

export interface SelectOption {
  label: string;
  value: string | number | boolean;
  disabled?: boolean;
}

export interface OptionsFromApi {
  endpoint: string;
  dependsOn?: string;
}

export interface FieldConfig {
  name: string;
  type: FieldType;
  label?: string;
  placeholder?: string;
  hint?: string;
  col?: 1 | 2 | 3 | 4;
  defaultValue?: unknown;
  rules?: FieldRule[];

  /** Static options for Select / RadioGroup / MultiSelect */
  options?: SelectOption[];
  /** Fetch options from API; cascade select */
  optionsFromApi?: OptionsFromApi;

  /** Expression string evaluated against form values → boolean */
  shouldRender?: string;
  /** Same semantics, alternative API */
  visibilityRules?: string;
  /** Expression → disabled/enabled */
  enableRules?: string;
  /** Expression → koşullu zorunluluk (true ise alan required olur) */
  requiredRules?: string;

  /** Row children */
  fields?: FieldConfig[];

  /** Input props passthrough */
  min?: number;
  max?: number;
  step?: number;
  rows?: number;
  maxLength?: number;
  readOnly?: boolean;

  /** Mask pattern for MaskedInput */
  mask?: string;

  /** Number of slots for InputOTP (varsayılan: 6) */
  otpLength?: number;
  /** ToggleGroup: tek mi çok mu seçim (varsayılan: single) */
  toggleType?: 'single' | 'multiple';

  /** Accept for Upload */
  accept?: string;
  maxFiles?: number;

  /** Custom component key (resolved via customFunctions) */
  component?: string;
  componentProps?: Record<string, unknown>;

  /** CSS class on the field wrapper */
  className?: string;
}

// ─── Panel Config ────────────────────────────────────

export interface PanelConfig {
  key: string;
  title: string;
  /** Sol rail sıra numarası (ör. ·, 5, +) */
  no?: string;
  /** Kart başlığı sağ meta metni */
  meta?: string;
  /** Lucide ikon anahtarı: user | id-card | mail | settings | file | wallet */
  icon?: string;
  fields: FieldConfig[];
  /** Expression → panel visible */
  visible?: string;
  defaultOpen?: boolean;
}

// ─── Tab Config ──────────────────────────────────────

export interface FormTabConfig {
  key: string;
  title: string;
  fields?: FieldConfig[];
  panels?: PanelConfig[];
  /** Expression → tab gizli (rail + içerik render edilmez) */
  visible?: string;
  /** Expression → rail'de görünür, içerik kilitli (önceki adım tamamlanmadan) */
  locked?: string;
  /** Kilitli sekmede gösterilecek mesaj (i18n fallback) */
  lockedMessage?: string;
}

// ─── Button Toolbar ──────────────────────────────────

export interface ToolbarButtonConfig {
  key: string;
  label: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  icon?: string;
  /** Show in which modes */
  modes?: FormMode[];
  /** Confirm dialog text before executing */
  confirm?: string;
  /** Loading key for async buttons */
  loadingKey?: string;
  /** Tablo toolbar: TablePermissions anahtarı (yoksa her zaman göster) */
  permission?: keyof TablePermissions;
}

export interface ButtonToolbarConfig {
  position?: 'top' | 'bottom' | 'both';
  buttons: ToolbarButtonConfig[];
}

// ─── Form Config ─────────────────────────────────────

/**
 * JSON-driven header action button. `onButtonClick(key, values)` ile handler'a bağlanır
 * (buttonToolbar ile aynı mekanizma). Görünürlük `visible` ifadesiyle (fail-closed) kontrol edilir.
 */
export interface FormHeaderActionConfig {
  key: string;
  /** i18n anahtarı — buton etiketi */
  labelKey?: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  /** Lucide ikon anahtarı: ban | upload | history | file | eye */
  icon?: string;
  /** İfade → görünür (fail-closed false) */
  visible?: string;
  /** Sol (leading) ya da sağ (trailing) aksiyon grubu — varsayılan trailing */
  position?: 'leading' | 'trailing';
  /** Çalıştırmadan önce onay metni */
  confirm?: string;
}

/**
 * JSON config içinden header tanımı. React node gerektiren parçalar (avatar, status rozeti)
 * `titleComponent` / `statusComponent` ile CustomComponent registry'sine bağlanır;
 * geri kalan metin/etiket/boolean alanlar i18n anahtarı veya ifadeyle çözülür.
 */
export interface FormHeaderConfig {
  /** i18n anahtarı — başlık */
  titleKey?: string;
  /** İfade → başlık metni (string döndürür) */
  titleExpr?: string;
  /** CustomComponent registry anahtarı — avatar/başlık (titleKey/titleExpr yerine) */
  titleComponent?: string;
  /** i18n anahtarı — alt başlık */
  subtitleKey?: string;
  /** İfade → alt başlık metni */
  subtitleExpr?: string;
  /** CustomComponent registry anahtarı — status göstergesi */
  statusComponent?: string;
  showDraft?: boolean;
  /** İfade → taslak butonu görünür */
  showDraftExpr?: string;
  draftLabelKey?: string;
  saveLabelKey?: string;
  /** İfade → kaydet etiketi i18n anahtarı (örn. yeni/düzenleme farkı) */
  saveLabelExpr?: string;
  cancelLabelKey?: string;
  railTitleKey?: string;
  actions?: FormHeaderActionConfig[];
}

export interface FormConfig {
  title?: string;
  layout?: 'vertical' | 'horizontal';
  /**
   * Bölüm/sekme gezinme menüsünün konumu:
   * - `top` (varsayılan): içeriğin üstünde yatay, yapışkan SectionTopBar.
   * - `sidebar`: sol dikey SectionRail.
   * Her iki konumda da scroll-spy aktif bölümü vurgular.
   */
  navLayout?: 'sidebar' | 'top';
  /** JSON-driven üst bar (başlık, status, aksiyonlar). Prop `header` öncelikli olarak birleşir. */
  header?: FormHeaderConfig;
  fields?: FieldConfig[];
  panels?: PanelConfig[];
  tabs?: FormTabConfig[];
  buttonToolbar?: ButtonToolbarConfig;
}

// ─── Custom Functions ────────────────────────────────

/**
 * `CustomComponent` alanları için props sözleşmesi. FieldRenderer her render'da
 * `value`, `onChange` ve `disabled` geçer, ardından `field.componentProps`'u yayar;
 * index imzası bu yayılan ekstra prop'ları karşılar.
 */
export interface CustomComponentProps {
  value?: unknown;
  onChange: (value: unknown) => void;
  disabled?: boolean;
  [key: string]: unknown;
}

export interface CustomFunctions {
  [key: string]: unknown;

  /** Async option fetching */
  apiCall?: (endpoint: string, params?: unknown) => Promise<SelectOption[]>;
  /** Async validators map */
  asyncValidators?: Record<
    string,
    (value: unknown, allValues: Record<string, unknown>) => Promise<string | undefined>
  >;
  /** Field change side-effects */
  onFieldChange?: (
    fieldName: string,
    value: unknown,
    allValues: Record<string, unknown>,
  ) => void;
  /** Custom component registry */
  components?: Record<string, React.ComponentType<CustomComponentProps>>;
}

/**
 * Tablo `customFunctions` değerleri: hücre render fonksiyonları `(value, row) => ReactNode`
 * ve toolbar/bulk buton handler'ları. Render geri çağrılarının parametrelerini tipler
 * (implicit-any olmadan); handler'lar için gevşek dönüş (`void`) kabul edilir.
 */
export type TableCustomFunction = (
  value: unknown,
  row: Record<string, unknown>,
) => React.ReactNode | void;

export type TableCustomFunctions = Record<string, TableCustomFunction>;

// ─── DynamicForm header (bireysel müşteri formu üst barı) ──

export interface DynamicFormHeaderProps {
  title?: React.ReactNode;
  subtitle?: string;
  status?: React.ReactNode;
  /** Sol rail başlığı — varsayılan: Bölümler */
  railTitle?: string;
  saveLabel?: React.ReactNode;
  cancelLabel?: React.ReactNode;
  draftLabel?: React.ReactNode;
  showDraft?: boolean;
  onDraft?: () => void;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  /** Üst page-head gizlenir (kayıt form barı) */
  hidePageHead?: boolean;
}

/** Modül/sayfa üst barı — DynamicTable header ile aynı yüzey (title, subtitle, actions) */
export interface DynamicFormShellProps {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  status?: React.ReactNode;
  actions?: React.ReactNode;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  hidePageHead?: boolean;
}

// ─── Form Diff (onay/inceleme görünümü) ──────────────

/**
 * Onay ekranı gibi salt-okunur görünümlerde değişen alanları vurgulamak için.
 * `changedFields` içindeki alanlar kırmızı çerçeveyle işaretlenir; `oldValues`
 * verilirse alanın altında "Eski: …" satırı gösterilir (8.1 Onay Havuzu §8).
 */
export interface FormDiff {
  /** Değişen alan adları — kırmızı vurgu uygulanır */
  changedFields: string[];
  /** Alan adı → eski değer; "Eski: …" satırında gösterilir */
  oldValues?: Record<string, unknown>;
  /** "Eski" etiketi (i18n) — varsayılan 'Eski' */
  oldLabel?: string;
}

// ─── DynamicForm Props ───────────────────────────────

export interface DynamicFormProps {
  config: FormConfig;
  mode: FormMode;
  permissions?: FormPermissions;
  initialValues?: Record<string, unknown>;
  /** Değişen alan vurgusu (salt-okunur onay görünümü için) */
  diff?: FormDiff;
  customFunctions?: CustomFunctions;
  onSubmit?: (values: Record<string, unknown>) => void | Promise<void>;
  onCancel?: () => void;
  onDelete?: () => void;
  onButtonClick?: (key: string, values: Record<string, unknown>) => void | Promise<void>;
  /** Sayfa/modül üst barı (Playground başlığı, geri dön vb.) */
  shell?: DynamicFormShellProps;
  /** Kayıt formu üst barı + FormPrimaryActions + rail başlığı */
  header?: DynamicFormHeaderProps;
  t?: TranslateFn;
  loading?: boolean;
  className?: string;
}

// ═══════════════════════════════════════════════════════
//  TABLE CONFIG DSL
// ═══════════════════════════════════════════════════════

export type ColumnAlign = 'left' | 'center' | 'right';

export interface ColumnConfig {
  key: string;
  title: string;
  dataIndex: string;
  width?: number;
  minWidth?: number;
  align?: ColumnAlign;
  sortable?: boolean;
  /** Render function key in customFunctions */
  render?: string;
  /** Built-in render: 'date' | 'datetime' | 'currency' | 'boolean' | 'status' */
  format?: 'date' | 'datetime' | 'currency' | 'boolean' | 'status' | 'mono';
  /** Filter config for column header filter */
  filter?: ColumnFilterDef;
  /** Hide column by default */
  hidden?: boolean;
  /** Disable export for this column */
  excludeFromExport?: boolean;
  /** Use mono font */
  mono?: boolean;
  /** format:'status' için değer → durum sınıfı eşlemesi (örn. {Active:'active', Closed:'danger'}) */
  statusMap?: Record<string, 'active' | 'inactive' | 'pending' | 'danger' | 'muted' | 'ok' | 'warn'>;
}

export interface ColumnFilterDef {
  type: 'text' | 'select' | 'date-range' | 'number-range' | 'multi-select';
  placeholder?: string;
  options?: SelectOption[];
}

export interface HeaderFilterConfig {
  fields: FieldConfig[];
  /** Default collapsed */
  defaultCollapsed?: boolean;
}

export interface TableTabConfig {
  key: string;
  title: string;
  /** Static filters injected when this tab is active */
  filters?: Record<string, unknown>;
  /** Badge count key from response meta */
  countKey?: string;
}

export interface TableApiConfig {
  /** Async function (params) => ApiResponse */
  method: (params: TableQueryParams) => Promise<TableApiResponse>;
}

export interface PaginationConfig {
  defaultPageSize?: number;
  pageSizeOptions?: number[];
}

export interface TablePermissions {
  new?: boolean;
  edit?: boolean;
  delete?: boolean;
  view?: boolean;
  export?: boolean;
  /** Legacy sayfa izinleri (insert → new, update → edit) */
  insert?: boolean;
  update?: boolean;
}

export interface TableToolbarButtons {
  /** Boş obje `{}` → varsayılan buton; `{ label, onClick }` → özel etiket/aksiyon */
  new?: { label?: string; onClick?: () => void };
  export?: { label?: string; onClick?: () => void };
  customButtons?: ToolbarButtonConfig[];
}

/** 12 kolonluk grid'te gelişmiş filtre genişliği */
export type AdvancedFilterSpan = 3 | 4 | 6 | 12;

/** Gelişmiş filtre paneli (FilterBar + AdvancedFilters) */
export interface TableAdvancedFilterConfig {
  key: string;
  label: string;
  type: 'select' | 'text' | 'date';
  placeholder?: string;
  options?: SelectOption[];
  /** 12 kolon grid'te genişlik; varsayılan 3 */
  span?: AdvancedFilterSpan;
  /** true ise filtre yeni satırın başından başlar */
  breakBefore?: boolean;
}

/** İsteğe bağlı satır satır yerleşim — span yine geçerli */
export interface TableAdvancedFilterRowConfig {
  filters: Array<{ key: string; span?: AdvancedFilterSpan }>;
}

export interface TableAdvancedFiltersLayout {
  /** span belirtilmeyen filtreler için varsayılan genişlik */
  defaultSpan?: AdvancedFilterSpan;
  /** Açık satırlar — verilirse düz liste sırası yerine bu kullanılır */
  rows?: TableAdvancedFilterRowConfig[];
}

export interface TableSearchConfig {
  placeholder?: string;
  /** API headerFilters.search ve client-side arama alanları */
  keys?: string[];
}

export interface TableConfig {
  /** Opsiyonel — `hideTitleBar` veya forma gömülü tablolarda boş bırakılır */
  title?: string;
  hideTitleBar?: boolean;
  api: TableApiConfig;
  columns: ColumnConfig[];
  headerFilter?: HeaderFilterConfig;
  /** Üst arama çubuğu */
  search?: TableSearchConfig;
  /** FilterBar altında açılan gelişmiş filtreler */
  advancedFilters?: TableAdvancedFilterConfig[];
  /** Gelişmiş filtre grid yerleşimi (span varsayılanı / açık satırlar) */
  advancedFiltersLayout?: TableAdvancedFiltersLayout;
  /** true ise kolon başlığı filtreleri kapalı (gelişmiş filtre önerilir) */
  hideColumnFilters?: boolean;
  tabs?: TableTabConfig[];
  /** `false` → sayfalama kapalı (forma gömülü tablolar) */
  pagination?: PaginationConfig | false;
  rowKey?: string;
  toolbar?: TableToolbarButtons;
  /** Satır seçimi (checkbox kolonu) aç */
  selectable?: boolean;
  /** Seçim varken BulkBar'da gösterilecek toplu aksiyon butonları */
  bulkActions?: ToolbarButtonConfig[];
  /** Kolon görünürlüğü aç/kapa paneli göster */
  columnToggle?: boolean;
}

// ─── Table Query / Response ──────────────────────────

export interface TableQueryParams {
  page: number;
  pageSize: number;
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: Record<string, unknown>;
  headerFilters?: Record<string, unknown>;
  tabFilters?: Record<string, unknown>;
}

export interface TableApiResponse {
  data: Record<string, unknown>[];
  total: number;
  success: boolean;
  message?: string;
  meta?: Record<string, unknown>;
}

// ─── DynamicTable header (liste sayfası üst barı) ──

export interface DynamicTableHeaderProps {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  status?: React.ReactNode;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  /** Üst page-head gizlenir (sayfa kendi PageHead'ini kullanıyorsa) */
  hidePageHead?: boolean;
}

// ─── DynamicTable Props ──────────────────────────────

export interface DynamicTableProps {
  config: TableConfig;
  permissions?: TablePermissions;
  customFunctions?: TableCustomFunctions;
  /** Üst başlık + config toolbar (export / new / custom) */
  header?: DynamicTableHeaderProps;
  onRowClick?: (row: Record<string, unknown>) => void;
  onView?: (row: Record<string, unknown>) => void;
  onEdit?: (row: Record<string, unknown>) => void;
  onDelete?: (row: Record<string, unknown>) => void;
  /** false ise satır silmeden önce onay dialogu gösterilmez (ör. form sil moduna yönlendirme) */
  confirmOnDelete?: boolean;
  onNew?: () => void;
  /** Özel CSV dışa aktarma; yoksa yerleşik export */
  onExport?: (rows: Record<string, unknown>[]) => void;
  /** toolbar.customButtons — config.toolbar.new.onClick sonrası */
  onToolbarButtonClick?: (key: string) => void | Promise<void>;
  /** config.bulkActions — seçili satırlarla toplu aksiyon */
  onBulkAction?: (key: string, rows: Record<string, unknown>[]) => void | Promise<void>;
  /** Sayfa verisi güncellendiğinde */
  onDataChange?: (rows: Record<string, unknown>[], total: number) => void;
  locale?: string;
  t?: TranslateFn;
  className?: string;
}
