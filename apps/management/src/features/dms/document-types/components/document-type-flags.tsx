type Props = {
  checked: boolean;
  label?: string;
};

export function DocumentTypeFlagCheckbox({ checked, label }: Props) {
  return (
    <input
      type="checkbox"
      checked={checked}
      readOnly
      disabled
      aria-label={label}
      title={label}
    />
  );
}
