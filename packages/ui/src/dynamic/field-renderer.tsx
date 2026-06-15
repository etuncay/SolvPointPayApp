/* ──────────────────────────────────────────────────────
 *  FieldRenderer — maps FieldConfig → @epay/ui primitives
 *
 *  NOT: 'Row' tipi form tarafından (DynamicForm) düzleştirilir;
 *  burada yaprak alanlar + CustomComponent + Divider çizilir.
 * ────────────────────────────────────────────────────── */
import * as React from 'react';
import type { DateRange } from 'react-day-picker';
import type { FieldConfig, CustomFunctions, SelectOption } from './types';
import { FormMode, isFormReadOnly } from './form-mode';
import { applyMask } from './mask';
import { Field } from '../form/field';
import { Combobox, type ComboboxOption } from '../composite/combobox';
import { ToggleGroup, ToggleGroupItem } from '../primitives/toggle-group';
import { Toggle } from '../primitives/toggle';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '../primitives/input-otp';
import { Input } from '../primitives/input';
import { Textarea } from '../primitives/textarea';
import { Select } from '../primitives/select';
import { PasswordInput } from '../primitives/password-input';
import { DatePicker } from '../primitives/date-picker';
import { DateRangePicker } from '../primitives/date-range-picker';
import { NumberField } from '../primitives/number-field';
import { TagsInput } from '../primitives/tags-input';
import { FileUpload } from '../primitives/file-upload';
import { Slider } from '../primitives/slider';
import { Checkbox } from '../primitives/checkbox';
import { Switch } from '../primitives/switch';
import { RadioGroup, RadioGroupItem } from '../primitives/radio-group';
import { cn } from '../lib/utils';

interface FieldRendererProps {
  field: FieldConfig;
  value: unknown;
  error?: string;
  disabled: boolean;
  mode: FormMode;
  onChange: (name: string, value: unknown) => void;
  /** Alan blur olduğunda (varsa) — anlık validasyon için */
  onBlur?: (name: string) => void;
  apiOptions?: SelectOption[];
  customFunctions?: CustomFunctions;
  /** Hesaplanmış zorunluluk (requiredRules dahil); verilmezse statik rules'tan türetilir */
  required?: boolean;
  /** Onay/inceleme görünümünde değişen alan — kırmızı vurgu */
  changed?: boolean;
  /** Değişen alanın eski değeri — "Eski: …" satırında gösterilir */
  oldValue?: unknown;
  /** "Eski" etiketi (i18n) — varsayılan 'Eski' */
  oldLabel?: string;
}

/** Option tabanlı alanların değerini etiketine çevir; diğerlerini okunur metne. */
function formatDisplayValue(
  field: FieldConfig,
  value: unknown,
  apiOptions?: SelectOption[],
): string {
  if (value == null || value === '') return '—';
  const optionTypes = ['Select', 'MultiSelect', 'Combobox', 'RadioGroup', 'ToggleGroup'];
  if (optionTypes.includes(field.type)) {
    const opts = apiOptions ?? field.options ?? [];
    const toLabel = (v: unknown) =>
      opts.find((o) => String(o.value) === String(v))?.label ?? String(v);
    return Array.isArray(value) ? value.map(toLabel).join(', ') : toLabel(value);
  }
  if (typeof value === 'boolean') return value ? '✓' : '✗';
  if (Array.isArray(value)) return value.map(String).join(', ');
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

/* ── value <-> primitive dönüşüm yardımcıları ───────────── */

function parseDate(v: unknown): Date | undefined {
  if (!v) return undefined;
  if (v instanceof Date) return Number.isNaN(v.getTime()) ? undefined : v;
  const s = String(v);
  const d = new Date(s.length === 10 ? `${s}T00:00:00` : s);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

/** Date → 'yyyy-mm-dd' (timezone kaymasını önlemek için yerel bileşenlerle) */
function formatDateValue(d: Date | undefined): string {
  if (!d) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Native kontrolden gelen string'i, option'ın orijinal tipine geri çevir. */
function coerceOptionValue(opts: SelectOption[], raw: string): string | number | boolean {
  const match = opts.find((o) => String(o.value) === raw);
  return match ? match.value : raw;
}

export function FieldRenderer({
  field,
  value,
  error,
  disabled,
  mode,
  onChange,
  onBlur,
  apiOptions,
  customFunctions,
  required,
  changed,
  oldValue,
  oldLabel,
}: FieldRendererProps) {
  const isReadOnly = isFormReadOnly(mode) || field.readOnly || disabled;
  const isRequired = required ?? (field.rules?.some((r) => r.required) ?? false);

  const diffNode = changed ? (
    <span className="diff-old">
      {oldLabel ?? 'Eski'}: <span className="mono">{formatDisplayValue(field, oldValue, apiOptions)}</span>
    </span>
  ) : undefined;

  // Custom component
  if (field.type === 'CustomComponent' && field.component) {
    const Comp = customFunctions?.components?.[field.component];
    if (Comp) {
      return (
        <Field
          label={field.label ?? field.name}
          htmlFor={field.name}
          required={isRequired}
          error={error}
          col={field.col}
          className={field.className}
          changed={changed}
          diffNode={diffNode}
        >
          <Comp
            value={value}
            onChange={(v: unknown) => onChange(field.name, v)}
            disabled={isReadOnly}
            {...(field.componentProps ?? {})}
          />
        </Field>
      );
    }
    return null;
  }

  // Divider
  if (field.type === 'Divider') {
    return (
      <hr
        className="form-divider"
        style={{ gridColumn: '1 / -1', margin: '8px 0', border: 'none', borderTop: '1px solid var(--line)' }}
      />
    );
  }

  // Row, DynamicForm tarafından düzleştirilir — buraya düşerse görmezden gel.
  if (field.type === 'Row') return null;

  const widget = renderWidget(field, value, isReadOnly, onChange, onBlur, apiOptions);

  return (
    <Field
      label={field.label ?? field.name}
      htmlFor={field.name}
      required={isRequired}
      error={error}
      hint={field.hint}
      col={field.col}
      locked={isFormReadOnly(mode)}
      className={field.className}
      changed={changed}
      diffNode={diffNode}
    >
      {widget}
    </Field>
  );
}

function renderWidget(
  field: FieldConfig,
  value: unknown,
  readOnly: boolean,
  onChange: (name: string, val: unknown) => void,
  onBlur: ((name: string) => void) | undefined,
  apiOptions?: SelectOption[],
): React.ReactNode {
  const handleChange = (v: unknown) => onChange(field.name, v);
  const handleBlur = onBlur ? () => onBlur(field.name) : undefined;
  const id = field.name;
  const strVal = value != null ? String(value) : '';

  switch (field.type) {
    case 'Input':
      return (
        <Input
          id={id}
          className={cn(readOnly && 'locked')}
          value={strVal}
          onChange={(e) => handleChange(e.target.value)}
          onBlur={handleBlur}
          readOnly={readOnly}
          placeholder={field.placeholder}
          maxLength={field.maxLength}
        />
      );

    case 'PasswordInput':
      return (
        <PasswordInput
          id={id}
          className={cn(readOnly && 'locked')}
          value={strVal}
          onChange={(e) => handleChange(e.target.value)}
          onBlur={handleBlur}
          readOnly={readOnly}
          placeholder={field.placeholder}
        />
      );

    case 'MaskedInput': {
      const mask = field.mask;
      return (
        <Input
          id={id}
          className={cn('mono', readOnly && 'locked')}
          value={strVal}
          onChange={(e) => handleChange(mask ? applyMask(e.target.value, mask) : e.target.value)}
          onBlur={handleBlur}
          readOnly={readOnly}
          placeholder={field.mask ?? field.placeholder}
        />
      );
    }

    case 'InputNumber':
      return (
        <NumberField
          value={typeof value === 'number' ? value : value != null && value !== '' ? Number(value) : undefined}
          onChange={(v) => handleChange(v)}
          min={field.min}
          max={field.max}
          step={field.step}
          disabled={readOnly}
          inputClassName={cn('mono', readOnly && 'locked')}
        />
      );

    case 'TextArea':
      return (
        <Textarea
          id={id}
          className={cn(readOnly && 'locked')}
          value={strVal}
          onChange={(e) => handleChange(e.target.value)}
          onBlur={handleBlur}
          readOnly={readOnly}
          placeholder={field.placeholder}
          rows={field.rows ?? 3}
          maxLength={field.maxLength}
        />
      );

    case 'Select': {
      const opts = apiOptions ?? field.options ?? [];
      return (
        <Select
          id={id}
          className={cn(readOnly && 'locked')}
          value={strVal}
          onChange={(e) => handleChange(e.target.value === '' ? '' : coerceOptionValue(opts, e.target.value))}
          onBlur={handleBlur}
          disabled={readOnly}
        >
          <option value="">{field.placeholder ?? '— Seçiniz —'}</option>
          {opts.map((o) => (
            <option key={String(o.value)} value={String(o.value)} disabled={o.disabled}>
              {o.label}
            </option>
          ))}
        </Select>
      );
    }

    case 'MultiSelect': {
      const opts = apiOptions ?? field.options ?? [];
      const selected = Array.isArray(value) ? (value as unknown[]).map(String) : [];
      return (
        <Select
          id={id}
          className={cn(readOnly && 'locked')}
          multiple
          value={selected}
          onChange={(e) => handleChange(Array.from(e.target.selectedOptions, (o) => o.value))}
          disabled={readOnly}
        >
          {opts.map((o) => (
            <option key={String(o.value)} value={String(o.value)} disabled={o.disabled}>
              {o.label}
            </option>
          ))}
        </Select>
      );
    }

    case 'Combobox': {
      const opts: ComboboxOption[] = (apiOptions ?? field.options ?? []).map((o) => ({
        value: String(o.value),
        label: o.label,
        disabled: o.disabled,
      }));
      return (
        <Combobox
          options={opts}
          value={value != null ? String(value) : undefined}
          onChange={(v) => handleChange(v)}
          placeholder={field.placeholder}
          disabled={readOnly}
        />
      );
    }

    case 'ToggleGroup': {
      const opts = field.options ?? [];
      const isMultiple = field.toggleType === 'multiple';
      if (isMultiple) {
        const selected = Array.isArray(value) ? (value as unknown[]).map(String) : [];
        return (
          <ToggleGroup
            type="multiple"
            value={selected}
            onValueChange={(vals: string[]) => handleChange(vals)}
            disabled={readOnly}
            className="flex gap-6 flex-wrap"
          >
            {opts.map((o) => (
              <ToggleGroupItem key={String(o.value)} value={String(o.value)} disabled={o.disabled}>
                {o.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        );
      }
      return (
        <ToggleGroup
          type="single"
          value={value != null ? String(value) : ''}
          onValueChange={(v: string) => handleChange(v ? coerceOptionValue(opts, v) : undefined)}
          disabled={readOnly}
          className="flex gap-6 flex-wrap"
        >
          {opts.map((o) => (
            <ToggleGroupItem key={String(o.value)} value={String(o.value)} disabled={o.disabled}>
              {o.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      );
    }

    case 'Toggle':
      return (
        <Toggle
          pressed={Boolean(value)}
          onPressedChange={(p: boolean) => handleChange(p)}
          disabled={readOnly}
        >
          {field.placeholder ?? field.label}
        </Toggle>
      );

    case 'InputOTP': {
      const len = field.otpLength ?? 6;
      return (
        <InputOTP
          maxLength={len}
          value={strVal}
          onChange={(v: string) => handleChange(v)}
          disabled={readOnly}
        >
          <InputOTPGroup>
            {Array.from({ length: len }, (_, i) => (
              <InputOTPSlot key={i} index={i} />
            ))}
          </InputOTPGroup>
        </InputOTP>
      );
    }

    case 'Checkbox':
      return (
        <label className="cbx-row">
          <Checkbox
            id={id}
            checked={Boolean(value)}
            onCheckedChange={(c) => handleChange(c === true)}
            disabled={readOnly}
          />
          {field.placeholder && <span>{field.placeholder}</span>}
        </label>
      );

    case 'Switch':
      return (
        <label className="sw-row">
          <Switch
            id={id}
            checked={Boolean(value)}
            onCheckedChange={(c: boolean) => handleChange(c)}
            disabled={readOnly}
          />
          {field.placeholder && <span>{field.placeholder}</span>}
        </label>
      );

    case 'RadioGroup': {
      const opts = field.options ?? [];
      return (
        <RadioGroup
          value={value != null ? String(value) : ''}
          onValueChange={(v: string) => handleChange(coerceOptionValue(opts, v))}
          disabled={readOnly}
        >
          {opts.map((o) => (
            <label key={String(o.value)} className="rdo-row">
              <RadioGroupItem value={String(o.value)} disabled={o.disabled || readOnly} />
              <span>{o.label}</span>
            </label>
          ))}
        </RadioGroup>
      );
    }

    case 'DatePicker':
      return (
        <DatePicker
          value={parseDate(value)}
          onChange={(d) => handleChange(formatDateValue(d))}
          placeholder={field.placeholder}
          disabled={readOnly}
        />
      );

    case 'DateRangePicker': {
      const arr = Array.isArray(value) ? (value as unknown[]) : [];
      const from = parseDate(arr[0]);
      const to = parseDate(arr[1]);
      const range: DateRange | undefined = from || to ? { from, to } : undefined;
      return (
        <DateRangePicker
          value={range}
          onChange={(r) => handleChange([formatDateValue(r?.from), formatDateValue(r?.to)])}
          placeholder={field.placeholder}
          disabled={readOnly}
        />
      );
    }

    case 'TagsInput':
      return (
        <TagsInput
          value={Array.isArray(value) ? (value as unknown[]).map(String) : []}
          onChange={(tags) => handleChange(tags)}
          placeholder={field.placeholder}
          disabled={readOnly}
        />
      );

    case 'Slider': {
      const num = typeof value === 'number' ? value : field.min ?? 0;
      return (
        <div className="flex items-center gap-8">
          <Slider
            value={[num]}
            min={field.min ?? 0}
            max={field.max ?? 100}
            step={field.step ?? 1}
            onValueChange={(v: number[]) => handleChange(v[0])}
            disabled={readOnly}
            style={{ flex: 1 }}
          />
          <span className="mono fs-12 t-mute" style={{ minWidth: 32, textAlign: 'right' }}>
            {String(value ?? '—')}
          </span>
        </div>
      );
    }

    case 'Upload':
      return (
        <FileUpload
          value={Array.isArray(value) ? (value as File[]) : []}
          onChange={(files) => handleChange(files)}
          accept={field.accept}
          multiple={field.maxFiles != null && field.maxFiles > 1}
          disabled={readOnly}
          label={field.placeholder ?? 'Dosya seçin veya sürükleyin'}
        />
      );

    default:
      return (
        <Input
          id={id}
          className={cn(readOnly && 'locked')}
          value={strVal}
          onChange={(e) => handleChange(e.target.value)}
          onBlur={handleBlur}
          readOnly={readOnly}
          placeholder={field.placeholder}
        />
      );
  }
}
