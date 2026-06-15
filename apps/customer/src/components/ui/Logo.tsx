export function Logo({ size = 38 }: { size?: number }) {
  return (
    <span className="brand-mark" style={{ width: size, height: size }}>
      <svg viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M6 7.5C6 6.7 6.7 6 7.5 6H18v3H9v2.5h7.5v3H9V17h9v3H7.5C6.7 20 6 19.3 6 18.5V7.5z"
          fill="#fff"
        />
        <circle cx="17" cy="17.5" r="3" fill="var(--accent)" />
      </svg>
    </span>
  );
}
