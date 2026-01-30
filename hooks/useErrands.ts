import { useState, useEffect } from 'react';
import { Errand, MOCK_ERRANDS } from '@/data/mocks';

const STORAGE_KEY = 'sendme_errands_v1';

export function useErrands() {
  const [errands, setErrands] = useState<Errand[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load from localStorage or use mocks
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setErrands(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse errands', e);
        setErrands(MOCK_ERRANDS);
      }
    } else {
      setErrands(MOCK_ERRANDS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_ERRANDS));
    }
    setIsLoaded(true);
  }, []);

  const addErrand = (newErrand: Omit<Errand, 'id' | 'status' | 'timestamp' | 'distance'>) => {
    const errand: Errand = {
      ...newErrand,
      id: Math.random().toString(36).substr(2, 9),
      status: 'Pending',
      timestamp: 'Just now',
      distance: '2.5 km', // Mock distance
    };

    const updated = [errand, ...errands];
    setErrands(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return errand;
  };

  const updateErrandStatus = (id: string, status: Errand['status']) => {
    const updated = errands.map(e => e.id === id ? { ...e, status } : e);
    setErrands(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  return { errands, addErrand, updateErrandStatus, isLoaded };
}
