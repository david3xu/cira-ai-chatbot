import { create } from 'zustand';
import { ProcessedDocument } from '@/lib/services/types';

interface DocumentState {
  currentDocument: ProcessedDocument | null;
  setCurrentDocument: (doc: ProcessedDocument | null) => void;
  clearDocument: () => void;
}

export const useDocumentContext = create<DocumentState>((set) => ({
  currentDocument: null,
  setCurrentDocument: (doc) => set({ currentDocument: doc }),
  clearDocument: () => set({ currentDocument: null }),
})); 