export type RaceResult = { timeMs: number; coins: number; perfect: number; steps: number; maxCombo: number; misses: number };
const key = 'sayo-dash:city:best';
export function readBest(): number | null {
  try { const n = Number(localStorage.getItem(key)); return Number.isFinite(n) && n > 0 ? n : null; } catch { return null; }
}
export function saveBest(timeMs: number): boolean {
  const best = readBest();
  if (best !== null && timeMs >= best) return false;
  try { localStorage.setItem(key, String(timeMs)); } catch { /* Play remains available when storage is blocked. */ }
  return true;
}
