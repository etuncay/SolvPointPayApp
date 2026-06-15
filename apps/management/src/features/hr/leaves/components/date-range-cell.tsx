export function DateRangeCell({ startDate, endDate }: { startDate: string; endDate: string }) {
  if (startDate === endDate) return <span>{startDate}</span>;
  return (
    <span>
      {startDate} – {endDate}
    </span>
  );
}
