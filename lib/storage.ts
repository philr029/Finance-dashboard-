import { AppData, AppSettings } from '@/types';
import { SEED_DATA } from '@/data/seed';

const STORAGE_KEY = 'vaultflow_data';

export function loadData(): AppData {
  if (typeof window === 'undefined') return SEED_DATA;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      saveData(SEED_DATA);
      return SEED_DATA;
    }
    return JSON.parse(raw) as AppData;
  } catch {
    return SEED_DATA;
  }
}

export function saveData(data: AppData): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...data, lastUpdated: new Date().toISOString() }));
  } catch {
    // storage unavailable
  }
}

export function clearData(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

export function exportData(): string {
  const data = loadData();
  return JSON.stringify(data, null, 2);
}

export function importData(json: string): AppData {
  const parsed = JSON.parse(json) as AppData;
  saveData(parsed);
  return parsed;
}

export function resetToSeedData(): AppData {
  saveData(SEED_DATA);
  return SEED_DATA;
}
