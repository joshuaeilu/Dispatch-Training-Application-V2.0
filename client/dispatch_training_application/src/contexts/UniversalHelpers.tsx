

import React, { createContext, useState, useEffect } from 'react';
import type { AdminPreferences } from '../types/index.types';
import { api } from '../utils/api';
type Context = {
    preferences: AdminPreferences | null;
    setPreferences: (prefs: AdminPreferences | null) => void;
    selectedKey: string;
    setSelectedKey: (key: string) => void;
}

export const UniversalContext = createContext<Context>({
    preferences: null,
    setPreferences: () => {},
    selectedKey: '',
    setSelectedKey: () => {},
});

export function UniversalProvider({ children }: { children: React.ReactNode }) {
    const [preferences, setPreferences] = useState<AdminPreferences | null>(null);
    const [selectedKey, setSelectedKey] = useState<string>('dashboard');

     useEffect(() => {
        const fetchPreferences = async () => {
          try {
            const res = await api.get('/preferences');
            setPreferences({
              ...res.data
            });
          } catch (error) {
            console.error('Error fetching admin preferences:', error);
          }
        };
    
        fetchPreferences();
      }, []);

    return (
        <UniversalContext.Provider value={{ preferences, setPreferences, selectedKey, setSelectedKey }}>
            {children}
        </UniversalContext.Provider>
    );
}
