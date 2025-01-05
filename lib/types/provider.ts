export interface ProviderProps {
  children: React.ReactNode;
}

export interface ProviderState {
  loading: boolean;
  error: Error | null;
}
