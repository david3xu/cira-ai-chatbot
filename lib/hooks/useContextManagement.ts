// import { useCallback } from 'react';
// import { useChatContext } from '@/lib/features/chat/context/useChatContext';
// import { useLoadingActions } from './useLoadingActions';
// import { ModelService } from '@/lib/services/ModelService';
// import { StorageService } from '@/lib/services/StorageService';
// import type { DominationField, ModelConfig } from '@/lib/types/app';

// interface ContextState {
//   dominationField: DominationField;
//   customPrompt: string | null;
//   modelConfig: ModelConfig | null;
//   uploadedFiles: string[];
//   isLoading: boolean;
//   error: Error | null;
// }

// interface UpdateContextOptions {
//   updateModel?: boolean;
//   clearFiles?: boolean;
//   resetConfig?: boolean;
// }

// export function useContextManagement() {
//   const { state, dispatch } = useChatContext();
//   const { withLoading } = useLoadingActions();

//   const updateDominationField = useCallback(async (
//     field: DominationField,
//     options: UpdateContextOptions = {}
//   ) => {
//     return withLoading(async () => {
//       try {
//         // Validate field change with service
//         await ModelService.validateDominationField(field);
        
//         dispatch({ type: 'SET_DOMINATION_FIELD', payload: field });
        
//         // Update model settings if needed
//         if (options.updateModel && state.model?.id) {
//           const modelConfig = await ModelService.getModelConfig(
//             state.model.id, 
//             field
//           );
//           dispatch({ type: 'SET_MODEL_CONFIG', payload: modelConfig });
//         }

//         return field;
//       } catch (error) {
//         dispatch({ 
//           type: 'SET_ERROR', 
//           payload: error instanceof Error ? error.message : 'Failed to update field' 
//         });
//         throw error;
//       }
//     }, 'Updating context...');
//   }, [state.model?.id, dispatch, withLoading]);

//   const updateCustomPrompt = useCallback(async (
//     prompt: string | null,
//     options: UpdateContextOptions = {}
//   ) => {
//     return withLoading(async () => {
//       try {
//         // Validate prompt
//         if (prompt) {
//           if (prompt.length > 500) {
//             throw new Error('Custom prompt too long');
//           }
//           // Additional validation if needed
//           await ModelService.validatePrompt(prompt);
//         }

//         dispatch({ type: 'SET_CUSTOM_PROMPT', payload: prompt });

//         // Update model config if needed
//         if (options.updateModel && state.model?.id) {
//           const modelConfig = await ModelService.getModelConfig(
//             state.model.id,
//             undefined,
//             prompt
//           );
//           dispatch({ type: 'SET_MODEL_CONFIG', payload: modelConfig });
//         }

//         return prompt;
//       } catch (error) {
//         dispatch({ 
//           type: 'SET_ERROR', 
//           payload: error instanceof Error ? error.message : 'Invalid prompt' 
//         });
//         throw error;
//       }
//     }, 'Updating prompt...');
//   }, [state.model?.id, dispatch, withLoading]);

//   const clearContext = useCallback(async (options: UpdateContextOptions = {}) => {
//     return withLoading(async () => {
//       try {
//         // Reset context state
//         dispatch({ type: 'SET_CUSTOM_PROMPT', payload: null });
//         dispatch({ type: 'SET_DOMINATION_FIELD', payload: 'general' });

//         // Clear files if requested
//         if (options.clearFiles) {
//           await Promise.all(
//             state.uploadedFiles.map(fileId => 
//               StorageService.deleteFile(fileId)
//             )
//           );
//           dispatch({ type: 'SET_UPLOADED_FILES', payload: [] });
//         }

//         // Reset model to default if needed
//         if (options.resetConfig && state.model?.id) {
//           const defaultConfig = await ModelService.getDefaultConfig(state.model.id);
//           dispatch({ type: 'SET_MODEL_CONFIG', payload: defaultConfig });
//         }
//       } catch (error) {
//         dispatch({ 
//           type: 'SET_ERROR', 
//           payload: error instanceof Error ? error.message : 'Failed to clear context' 
//         });
//         throw error;
//       }
//     }, 'Clearing context...');
//   }, [state.model?.id, state.uploadedFiles, dispatch, withLoading]);

//   return {
//     // State
//     dominationField: state.dominationField,
//     customPrompt: state.customPrompt,
//     isLoading: state.isLoading,
//     error: state.error,

//     // Actions
//     updateDominationField,
//     updateCustomPrompt,
//     clearContext,

//     // Helpers
//     getContextState: (): ContextState => ({
//       dominationField: state.dominationField,
//       customPrompt: state.customPrompt,
//       modelConfig: state.modelConfig,
//       uploadedFiles: state.uploadedFiles,
//       isLoading: state.isLoading,
//       error: state.error
//     }),
//     hasCustomPrompt: Boolean(state.customPrompt),
//     hasUploadedFiles: state.uploadedFiles.length > 0
//   };
// } 