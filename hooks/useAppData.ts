'use client';
import { useState, useEffect, useCallback } from 'react';
import { AppData } from '@/types';
import { loadData, saveData, resetData } from '@/lib/storage';
import { seedData } from '@/data/seed';

export function useAppData() {
  const [data, setData] = useState<AppData>(seedData);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setData(loadData());
    setIsLoaded(true);
  }, []);

  const updateData = useCallback((newData: AppData) => {
    setData(newData);
    saveData(newData);
  }, []);

  const reset = useCallback(() => {
    resetData();
    setData(loadData());
  }, []);

  return { data, updateData, reset, isLoaded };
}
