import { persistentActions } from './persistentActions';

// export { chatActions } from './chatActions';
export { persistentActions } from './persistentActions';

// Combine actions for easier usage
export const actions = {
  // ...chatActions,
  local: persistentActions
}; 