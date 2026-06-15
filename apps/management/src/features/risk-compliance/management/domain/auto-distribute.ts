export type WorkloadMember = {
  userId: string;
};

/** En düşük workload; eşitse sırayla (round-robin benzeri) */
export function pickMemberByWorkload(
  members: WorkloadMember[],
  workloads: Record<string, number>,
): string | null {
  if (members.length === 0) return null;
  let best = members[0]!.userId;
  let bestLoad = workloads[best] ?? 0;
  for (const m of members) {
    const load = workloads[m.userId] ?? 0;
    if (load < bestLoad) {
      best = m.userId;
      bestLoad = load;
    }
  }
  return best;
}
