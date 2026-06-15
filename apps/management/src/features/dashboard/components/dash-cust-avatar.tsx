/** Dashboard tabloları — mockup cust-avatar stili */
export function DashCustAvatar({ name, idx = 0 }: { name: string; idx?: number }) {
  const initials = name
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  return (
    <span className="cust-avatar">
      <span className={`dot c${(idx % 5) + 1}`}>{initials}</span>
      <span>{name}</span>
    </span>
  );
}
