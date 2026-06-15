import { useRef } from 'react';

export function OtpInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.padEnd(6, ' ').split('').slice(0, 6);

  function set(i: number, v: string) {
    const digits = v.replace(/\D/g, '');
    if (digits.length > 1) {
      onChange(digits.slice(0, 6));
      const next = Math.min(5, digits.length - 1);
      refs.current[next]?.focus();
      return;
    }
    const digit = digits.slice(-1);
    const arr = value.padEnd(6, ' ').split('');
    arr[i] = digit || ' ';
    onChange(arr.join('').replace(/ /g, ''));
    if (digit && i < 5) refs.current[i + 1]?.focus();
  }

  function keyDown(i: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !digits[i]?.trim() && i > 0) {
      refs.current[i - 1]?.focus();
    }
  }

  return (
    <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          inputMode="numeric"
          maxLength={1}
          value={digits[i]?.trim() ?? ''}
          onChange={(e) => set(i, e.target.value)}
          onKeyDown={(e) => keyDown(i, e)}
          aria-label={`OTP ${i + 1}`}
          style={{
            width: 50,
            height: 60,
            textAlign: 'center',
            fontSize: 26,
            fontWeight: 700,
            fontFamily: 'var(--font-display)',
            borderRadius: 13,
            border: '1.5px solid var(--line-strong)',
            background: 'var(--surface)',
            color: 'var(--ink)',
            outline: 'none',
          }}
        />
      ))}
    </div>
  );
}
