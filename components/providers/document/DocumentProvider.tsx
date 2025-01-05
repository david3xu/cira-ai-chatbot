'use client';

import React, { useReducer, useMemo } from 'react';
import { DocumentContext } from './context';
import { Document, DocumentState, DocumentAction } from '@/lib/types/document';
import { ProviderProps } from '@/lib/types/provider';

const initialState: DocumentState = {
  documents: [],
  currentDocument: null,
  isLoading: false,
  error: null,
  processingStatus: 'idle',
  uploadProgress: 0
};

function documentReducer(state: DocumentState, action: DocumentAction): DocumentState {
  switch (action.type) {
    case 'SET_DOCUMENTS':
      return { 
        ...state, 
        documents: action.payload 
      };
    case 'SET_CURRENT_DOCUMENT':
      return { 
        ...state, 
        currentDocument: action.payload 
      };
    case 'ADD_DOCUMENT':
      return { 
        ...state, 
        documents: [...state.documents, action.payload] 
      };
    case 'UPDATE_DOCUMENT':
      return {
        ...state,
        documents: state.documents.map(doc =>
          doc.id === action.payload.id ? { ...doc, ...action.payload } : doc
        )
      };
    case 'REMOVE_DOCUMENT':
      return {
        ...state,
        documents: state.documents.filter(doc => doc.id !== action.payload),
        currentDocument: state.currentDocument?.id === action.payload ? null : state.currentDocument
      };
    case 'SET_LOADING':
      return { 
        ...state, 
        isLoading: action.payload 
      };
    case 'SET_ERROR':
      return { 
        ...state, 
        error: action.payload 
      };
    case 'SET_PROCESSING_STATUS':
      return { 
        ...state, 
        processingStatus: action.payload 
      };
    case 'SET_UPLOAD_PROGRESS':
      return { 
        ...state, 
        uploadProgress: action.payload 
      };
    default:
      return state;
  }
}

export function DocumentProvider({ children }: ProviderProps) {
  const [state, dispatch] = useReducer(documentReducer, initialState);

  // Document State Actions
  const actions = useMemo(() => ({
    setDocuments: (documents: Document[]) => 
      dispatch({ type: 'SET_DOCUMENTS', payload: documents }),
      
    setCurrentDocument: (document: Document | null) => 
      dispatch({ type: 'SET_CURRENT_DOCUMENT', payload: document }),
      
    addDocument: (document: Document) => 
      dispatch({ type: 'ADD_DOCUMENT', payload: document }),
      
    updateDocument: (document: Partial<Document> & { id: string }) => 
      dispatch({ type: 'UPDATE_DOCUMENT', payload: document }),
      
    removeDocument: (documentId: string) => 
      dispatch({ type: 'REMOVE_DOCUMENT', payload: documentId }),
      
    setLoading: (loading: boolean) => 
      dispatch({ type: 'SET_LOADING', payload: loading }),
      
    setError: (error: Error | null) => 
      dispatch({ type: 'SET_ERROR', payload: error }),
      
    setProcessingStatus: (status: 'idle' | 'processing' | 'complete' | 'error') => 
      dispatch({ type: 'SET_PROCESSING_STATUS', payload: status }),
      
    setUploadProgress: (progress: number) => 
      dispatch({ type: 'SET_UPLOAD_PROGRESS', payload: progress })
  }), []);

  // Computed values
  const computedValues = useMemo(() => ({
    hasDocuments: state.documents.length > 0,
    isProcessing: state.processingStatus === 'processing',
    hasError: state.error !== null,
    uploadComplete: state.uploadProgress === 100
  }), [
    state.documents.length,
    state.processingStatus,
    state.error,
    state.uploadProgress
  ]);

  const value = useMemo(() => ({
    state,
    actions,
    ...computedValues
  }), [state, actions, computedValues]);

  return (
    <DocumentContext.Provider value={value}>
      {children}
    </DocumentContext.Provider>
  );
} 