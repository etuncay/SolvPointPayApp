import { useTranslation } from 'react-i18next';
import type { UseFormReturn } from 'react-hook-form';
import { Field } from '@epay/ui';
import { FX_CURRENCIES, WORK_HOURS_OPTIONS, type FxMarginDraft } from '../domain/types';
import { isInsideWorkHours } from '../domain/work-hours';

type Props = {
  form: UseFormReturn<FxMarginDraft>;
  disabled: boolean;
};

export function MarginSettingsPanel({ form, disabled }: Props) {
  const { t } = useTranslation();
  const { register, watch } = form;
  const rows = watch('rows');
  const activeInside = isInsideWorkHours();

  return (
    <div className="form-card" style={{ padding: 20 }}>
      <h3 className="fs-14" style={{ marginBottom: 16 }}>
        {t('fx_panel_margins')}
      </h3>
      <p className="t-mute fs-12" style={{ marginBottom: 16 }}>
        {t('fx_margins_hint')}
        {activeInside ? ` (${t('fx_work_inside_active')})` : ` (${t('fx_work_outside_active')})`}
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {FX_CURRENCIES.map((currency) =>
          WORK_HOURS_OPTIONS.map((workHours) => {
            const idx = rows.findIndex((r) => r.currency === currency && r.workHours === workHours);
            if (idx < 0) return null;
            const prefix = `rows.${idx}` as const;
            const highlight = workHours === (activeInside ? 'Inside' : 'Outside');
            return (
              <div
                key={`${currency}-${workHours}`}
                style={{
                  padding: 14,
                  borderRadius: 8,
                  border: '1px solid var(--border)',
                  background: highlight
                    ? 'color-mix(in srgb, var(--accent, #2563eb) 8%, transparent)'
                    : undefined,
                }}
              >
                <div className="fs-12 fw-600" style={{ marginBottom: 12 }}>
                  {currency} — {t(`fx_work_${workHours}`)}
                </div>
                <div className="form-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                  <Field label={t('fx_col_buy_fixed')}>
                    <input
                      className="input"
                      type="number"
                      step="any"
                      disabled={disabled}
                      {...register(`${prefix}.buyFixedMargin`, { valueAsNumber: true })}
                    />
                  </Field>
                  <Field label={t('fx_col_buy_var')}>
                    <input
                      className="input"
                      type="number"
                      step="any"
                      disabled={disabled}
                      {...register(`${prefix}.buyVariableMarginPct`, { valueAsNumber: true })}
                    />
                  </Field>
                  <Field label={t('fx_col_rounding')}>
                    <input
                      className="input"
                      type="number"
                      min={0}
                      max={6}
                      disabled={disabled}
                      {...register(`${prefix}.roundingDecimals`, { valueAsNumber: true })}
                    />
                  </Field>
                  <Field label={t('fx_col_sell_fixed')}>
                    <input
                      className="input"
                      type="number"
                      step="any"
                      disabled={disabled}
                      {...register(`${prefix}.sellFixedMargin`, { valueAsNumber: true })}
                    />
                  </Field>
                  <Field label={t('fx_col_sell_var')}>
                    <input
                      className="input"
                      type="number"
                      step="any"
                      disabled={disabled}
                      {...register(`${prefix}.sellVariableMarginPct`, { valueAsNumber: true })}
                    />
                  </Field>
                </div>
              </div>
            );
          }),
        )}
      </div>
    </div>
  );
}
