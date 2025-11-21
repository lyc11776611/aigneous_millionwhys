'use client';

import { createContext, useContext } from 'react';

export interface AuthContextType {
  password: string;
  setPassword: (pw: string) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  password: '',
  setPassword: () => {},
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);
