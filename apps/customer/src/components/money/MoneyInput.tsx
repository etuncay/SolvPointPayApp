import { Field } from '@/components/ui/Field';

export function MoneyInput({
  label,
  value,
  onChange,
  sym,
  large,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  sym: string;
  large?: boolean;
}) {
  return (
    <Field label={label} required full={large}>
      <div className="input-affix">
        <span className="pre" style={large ? { fontSize: 18 } : undefined}>
          {sym}
        </span>
        <input
          className={`input tnum${large ? ' money-input-lg' : ''}`}
          type="text"
          inputMode="decimal"
          value={value}
          placeholder="0,00"
          onChange={(e) => onChange(e.target.value.replace(/[^\d.,]/g, ''))}
        />
      </div>
    </Field>
  );
}
