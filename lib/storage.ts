import { AppData } from '@/types';
import { seedData } from '@/data/seed';

const STORAGE_KEY = 'vaultflow_data';

export function loadData(): AppData {
  if (typeof window === 'undefined') return seedData;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seedData));
      return seedData;
    }
    return JSON.parse(stored) as AppData;
  } catch {
    return seedData;
  }
}

export function saveData(data: AppData): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function resetData(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seedData));
}
