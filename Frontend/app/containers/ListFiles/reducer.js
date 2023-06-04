/*
 * HomeReducer
 *
 * The reducer takes care of our data. Using actions, we can
 * update our application state. To add a new action,
 * add it to the switch statement in the reducer function
 *
 */

import produce from 'immer';
import { GET_FILES, GET_FILES_SUCCESS, DELETE_FILE_SUCCESS } from './constants';

// The initial state of the App
export const initialState = {
  files: [],
  parent: {},
  fileDeleted: 1,
};

/* eslint-disable default-case, no-param-reassign */
const listFiles = (state = initialState, action) =>
  produce(state, draft => {
    switch (action.type) {
      case GET_FILES:
        break;
      case GET_FILES_SUCCESS:
        draft.files = action.result.files;
        draft.parent = action.result.parent;
        break;
      case DELETE_FILE_SUCCESS:
        draft.fileDeleted += 1;
        break;
    }
  });

export default listFiles;
