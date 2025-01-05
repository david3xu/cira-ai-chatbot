import { createContext } from 'react';
import { ThemeContextValue } from '@/lib/types/theme';

export const ThemeContext = createContext<ThemeContextValue | undefined>(undefined); 