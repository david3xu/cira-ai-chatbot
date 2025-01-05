// import { useCallback } from 'react';
// import { useChatContext } from '@/lib/features/chat/context/useChatContext';
// import { useLoadingActions } from './useLoadingActions';
// import { UploaderService } from '@/lib/services/UploaderService';
// import type { UploadedFile, UploadProgress } from '@/lib/types/state/uploadedFile';

// interface FileHandlerState {
//   files: UploadedFile[];
//   isUploading: boolean;
//   currentProgress: UploadProgress | null;
//   error: Error | null;
// }

// interface UploadOptions {
//   maxSize?: number;
//   allowedTypes?: string[];
//   generateThumbnail?: boolean;
//   onProgress?: (progress: UploadProgress) => void;
// }

// export function useFileHandler() {
//   const { state, dispatch } = useChatContext();
//   const { withLoading } = useLoadingActions();

//   const validateFile = useCallback((file: File, options?: UploadOptions) => {
//     if (options?.maxSize && file.size > options.maxSize) {
//       throw new Error(`File size exceeds ${options.maxSize} bytes`);
//     }

//     if (options?.allowedTypes && !options.allowedTypes.includes(file.type)) {
//       throw new Error(`File type ${file.type} not allowed`);
//     }

//     return true;
//   }, []);

//   const uploadFile = useCallback(async (
//     file: File, 
//     options?: UploadOptions
//   ) => {
//     return withLoading(async () => {
//       try {
//         // Validate file
//         validateFile(file, options);

//         // Start upload
//         dispatch({ type: 'SET_UPLOADING', payload: true });
        
//         const uploadedFile = await UploaderService.uploadFile(file, {
//           onProgress: (progress) => {
//             dispatch({ type: 'SET_UPLOAD_PROGRESS', payload: progress });
//             options?.onProgress?.(progress);
//           }
//         });

//         // Add file to state
//         dispatch({ 
//           type: 'ADD_UPLOADED_FILE', 
//           payload: uploadedFile 
//         });

//         // Add system message if in chat
//         if (state.currentChat) {
//           dispatch({
//             type: 'ADD_MESSAGE',
//             payload: {
//               id: crypto.randomUUID(),
//               content: `File uploaded: ${file.name}`,
//               role: 'system',
//               createdAt: new Date().toISOString(),
//               metadata: {
//                 fileId: uploadedFile.id,
//                 fileName: uploadedFile.name,
//                 fileType: uploadedFile.type
//               }
//             }
//           });
//         }

//         return uploadedFile;
//       } catch (error) {
//         dispatch({ 
//           type: 'SET_ERROR', 
//           payload: error instanceof Error ? error.message : 'Failed to upload file' 
//         });
//         throw error;
//       } finally {
//         dispatch({ type: 'SET_UPLOADING', payload: false });
//         dispatch({ type: 'SET_UPLOAD_PROGRESS', payload: null });
//       }
//     }, 'Uploading file...');
//   }, [state.currentChat, dispatch, validateFile, withLoading]);

//   const removeFile = useCallback(async (fileId: string) => {
//     return withLoading(async () => {
//       try {
//         await UploaderService.deleteFile(fileId);
        
//         dispatch({ type: 'REMOVE_UPLOADED_FILE', payload: fileId });

//         // Remove associated system message if exists
//         if (state.currentChat) {
//           const messageToRemove = state.messages.find(
//             msg => msg.metadata?.fileId === fileId
//           );
//           if (messageToRemove) {
//             dispatch({ type: 'DELETE_MESSAGE', payload: messageToRemove.id });
//           }
//         }
//       } catch (error) {
//         dispatch({ 
//           type: 'SET_ERROR', 
//           payload: error instanceof Error ? error.message : 'Failed to remove file' 
//         });
//         throw error;
//       }
//     }, 'Removing file...');
//   }, [state.currentChat, state.messages, dispatch, withLoading]);

//   return {
//     // State
//     files: state.uploadedFiles,
//     isUploading: state.isUploading,
//     currentProgress: state.uploadProgress,
//     error: state.error,

//     // Actions
//     uploadFile,
//     removeFile,
//     validateFile,

//     // Helpers
//     getFileById: (id: string) => state.uploadedFiles.find(f => f.id === id),
//     getFileState: (): FileHandlerState => ({
//       files: state.uploadedFiles,
//       isUploading: state.isUploading,
//       currentProgress: state.uploadProgress,
//       error: state.error
//     }),
//     hasFiles: state.uploadedFiles.length > 0
//   };
// } 