

import React, { createContext, useState, useEffect, useMemo } from 'react';
import type { AdminPreferences, Role, MenuItem } from '../types/index.types';
import { api } from '../utils/api';
import { AppstoreFilled, FileTextOutlined, QuestionCircleOutlined, ApartmentOutlined, VideoCameraOutlined, UserOutlined, QuestionCircleFilled, UploadOutlined } from '@ant-design/icons';
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

const [selectedKey, setSelectedKey] = useState<string>(() => {
  return sessionStorage.getItem('selectedKey') || '/dashboard';
});
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
