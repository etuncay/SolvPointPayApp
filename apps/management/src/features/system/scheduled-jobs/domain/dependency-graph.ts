/** Bağımlılık grafiğinde döngü oluşup oluşmayacağını kontrol eder */
export function wouldCreateCycle(
  jobs: { id: string; dependencyIds: string[] }[],
  jobId: string,
  newDependencyIds: string[],
): boolean {
  const adj = new Map<string, string[]>();
  for (const j of jobs) {
    adj.set(j.id, j.id === jobId ? [...newDependencyIds] : [...j.dependencyIds]);
  }
  if (!adj.has(jobId)) {
    adj.set(jobId, [...newDependencyIds]);
  }

  const visiting = new Set<string>();
  const visited = new Set<string>();

  function dfs(node: string): boolean {
    if (visiting.has(node)) return true;
    if (visited.has(node)) return false;
    visiting.add(node);
    for (const next of adj.get(node) ?? []) {
      if (dfs(next)) return true;
    }
    visiting.delete(node);
    visited.add(node);
    return false;
  }

  return dfs(jobId);
}
