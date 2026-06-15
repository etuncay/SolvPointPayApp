import { Icon } from '@/components/icons/Icon';

export function DirBadge({ dir }: { dir: 'in' | 'out' }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <span
        style={{
          width: 30,
          height: 30,
          borderRadius: 9,
          display: 'grid',
          placeItems: 'center',
          flexShrink: 0,
          background: dir === 'in' ? 'var(--pos-soft)' : 'var(--bg-2)',
          color: dir === 'in' ? 'var(--pos)' : 'var(--ink-2)',
        }}
      >
        <Icon
          name={dir === 'in' ? 'arrowDownLeft' : 'arrowUpRight'}
          style={{ width: 16, height: 16 }}
        />
      </span>
    </span>
  );
}
