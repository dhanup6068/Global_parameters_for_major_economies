/*
 * HomeReducer
 *
 * The reducer takes care of our data. Using actions, we can
 * update our application state. To add a new action,
 * add it to the switch statement in the reducer function
 *
 */

import produce from 'immer';
import { ADD_FOLDER, ADD_FOLDER_SUCCESS, RESET_ADD_FOLDER } from './constants';

// The initial state of the App
export const initialState = { folderAdded: 1 };

/* eslint-disable default-case, no-param-reassign */
const addFolderReducer = (state = initialState, action) =>
  produce(state, draft => {
    switch (action.type) {
      case ADD_FOLDER:
        break;
      case ADD_FOLDER_SUCCESS:
        draft.folderAdded += 1;
        break;
    }
  });

export default addFolderReducer;
