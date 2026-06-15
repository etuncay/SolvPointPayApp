import type { ParameterValueType } from '../domain/types';

type Props = {
  valueType: ParameterValueType;
  value: string;
  disabled?: boolean;
  onChange: (value: string) => void;
};

export function ParameterValueCell({ valueType, value, disabled, onChange }: Props) {
  if (valueType === 'boolean') {
    return (
      <select
        className="select fs-12 mono"
        disabled={disabled}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="true">true</option>
        <option value="false">false</option>
      </select>
    );
  }

  return (
    <input
      className="input fs-12 mono"
      type={valueType === 'string' ? 'text' : 'number'}
      disabled={disabled}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
