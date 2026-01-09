

import React, { createContext, useState, useEffect, useContext, } from 'react';
import type { AdminPreferences, } from '../types/index.types';
import type { GetUser } from '../types/index.types'
import { api } from '../utils/api';
import type { UniversalHelpersCtx } from '../types/index.types';



export const UniversalContext = createContext<UniversalHelpersCtx>({
  preferences: null,
  setPreferences: () => { },
  users: [] as GetUser[],
  setUsers: () => { },
});







export function UniversalProvider({ children }: { children: React.ReactNode }) {
  const [preferences, setPreferences] = useState<AdminPreferences | null>(null);
  const [users, setUsers] = useState<GetUser[]>([]);


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

    const fetchUsers = async () => {
      try {
        const response = await api.get('/users');
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    }

    fetchPreferences();
    fetchUsers();
  }, []);

  return (
    <UniversalContext.Provider value={{ preferences, setPreferences, users, setUsers }}>
      {children}
    </UniversalContext.Provider>
  );
}

export function getUsers() {
  const { users, setUsers } = useContext(UniversalContext);
  return {
    users,
    setUsers,
  };
}


export function getPreferences() {
  const { preferences, setPreferences } = useContext(UniversalContext);
  return {
    preferences,
    setPreferences,
  }

}