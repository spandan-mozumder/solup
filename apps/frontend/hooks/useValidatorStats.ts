import { useEffect, useState } from 'react';

interface ValidatorStats {
  onlineValidators: number;
  validators: { id: string; publicKey: string }[];
}

export function useValidatorStats(intervalMs: number = 5000) {
  const [stats, setStats] = useState<ValidatorStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    let timer: any;

    async function fetchStats() {
      try {
        const res = await fetch(process.env.NEXT_PUBLIC_HUB_BASE_URL ? `${process.env.NEXT_PUBLIC_HUB_BASE_URL}/stats` : 'http://localhost:8081/stats');
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const json = await res.json();
        if (active) {
            setStats(json);
            setError(null);
        }
      } catch (e:any) {
        if (active) setError(e.message);
      } finally {
        if (active) timer = setTimeout(fetchStats, intervalMs);
      }
    }

    fetchStats();
    return () => { active = false; if (timer) clearTimeout(timer); };
  }, [intervalMs]);

  return { stats, error };
}
