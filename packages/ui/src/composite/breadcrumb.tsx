export type Crumb = { label: string; href?: string };

export function Breadcrumb({
  homeLabel,
  homeHref = '/',
  crumbs,
  LinkComponent = 'a',
}: {
  homeLabel: string;
  homeHref?: string;
  crumbs: Crumb[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  LinkComponent?: React.ElementType<any>;
}) {
  const Link = LinkComponent;
  return (
    <nav className="breadcrumb" aria-label="Breadcrumb">
      <Link href={homeHref} to={homeHref} className="">
        {homeLabel}
      </Link>
      {crumbs.map((c, i) => (
        <span key={i}>
          <span className="sep">›</span>
          {i === crumbs.length - 1 || !c.href ? (
            <span className="current">{c.label}</span>
          ) : (
            <Link href={c.href} to={c.href} className="lk">
              {c.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
