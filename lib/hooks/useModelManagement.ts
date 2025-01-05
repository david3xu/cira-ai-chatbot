// import { useCallback } from 'react';
// import { useChatContext } from '@/lib/features/chat/context/useChatContext';
// import { ModelService } from '@/lib/services/ModelService';
// import { useLoadingActions } from './useLoadingActions';
// import type { ModelConfig, Model } from '@/lib/types/app';

// export function useModelManagement() {
//   const { state, dispatch } = useChatContext();
//   const { withLoading } = useLoadingActions();

//   const updateModel = useCallback(async (modelId: string) => {
//     return withLoading(async () => {
//       try {
//         // Get model details and validate
//         const [model, modelConfig] = await Promise.all([
//           ModelService.getModel(modelId),
//           ModelService.getModelConfig(modelId)
//         ]);

//         // Update state
//         dispatch({ type: 'SET_MODEL', payload: model });
//         dispatch({ type: 'SET_MODEL_CONFIG', payload: modelConfig });

//         return { model, modelConfig };
//       } catch (error) {
//         dispatch({ 
//           type: 'SET_ERROR', 
//           payload: error instanceof Error ? error.message : 'Failed to update model' 
//         });
//         throw error;
//       }
//     }, 'Updating model configuration...');
//   }, [dispatch, withLoading]);

//   const updateModelConfig = useCallback(async (config: Partial<ModelConfig>) => {
//     if (!state.model?.id) {
//       throw new Error('No model selected');
//     }

//     return withLoading(async () => {
//       try {
//         // Validate and update config
//         const updatedConfig = await ModelService.updateModelConfig(
//           state.model.id,
//           config
//         );

//         dispatch({ type: 'SET_MODEL_CONFIG', payload: updatedConfig });
//         return updatedConfig;
//       } catch (error) {
//         dispatch({ 
//           type: 'SET_ERROR', 
//           payload: error instanceof Error ? error.message : 'Failed to update configuration' 
//         });
//         throw error;
//       }
//     }, 'Updating model settings...');
//   }, [state.model?.id, dispatch, withLoading]);

//   const resetModelConfig = useCallback(async () => {
//     if (!state.model?.id) return;

//     return withLoading(async () => {
//       try {
//         const defaultConfig = await ModelService.getDefaultConfig(state.model.id);
//         dispatch({ type: 'SET_MODEL_CONFIG', payload: defaultConfig });
//         return defaultConfig;
//       } catch (error) {
//         dispatch({ 
//           type: 'SET_ERROR', 
//           payload: error instanceof Error ? error.message : 'Failed to reset configuration' 
//         });
//         throw error;
//       }
//     }, 'Resetting model settings...');
//   }, [state.model?.id, dispatch, withLoading]);

//   return {
//     // State
//     currentModel: state.model,
//     modelConfig: state.modelConfig,
//     isLoading: state.isLoading,

//     // Actions
//     updateModel,
//     updateModelConfig,
//     resetModelConfig,

//     // Helpers
//     hasModelSelected: Boolean(state.model?.id),
//     getModelDetails: (): { model: Model; config: ModelConfig } | null => 
//       state.model && state.modelConfig 
//         ? { model: state.model, config: state.modelConfig }
//         : null
//   };
// } 