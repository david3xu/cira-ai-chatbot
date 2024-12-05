import { databaseActions } from './databaseActions';
import { persistentActions } from './persistentActions';
import { sessionActions } from './sessionActions';

export const storageActions = {
  database: {
    ...databaseActions,
  },
  persistent: persistentActions,
  session: sessionActions
};

