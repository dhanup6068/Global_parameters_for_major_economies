/*
 * HomeReducer
 *
 * The reducer takes care of our data. Using actions, we can
 * update our application state. To add a new action,
 * add it to the switch statement in the reducer function
 *
 */

import produce from 'immer';
import { ADD_FILE, ADD_FILE_SUCCESS, ADD_FILE_ERROR } from './constants';

// The initial state of the App
export const initialState = { fileAdded: 1, loading: false };

/* eslint-disable default-case, no-param-reassign */
const addFileReducer = (state = initialState, action) =>
  produce(state, draft => {
    switch (action.type) {
      case ADD_FILE:
        draft.loading = true;
        break;
      case ADD_FILE_SUCCESS:
        draft.fileAdded = draft.fileAdded + 1;
        draft.loading = false;
        break;
      case ADD_FILE_ERROR:
        draft.loading = false;
        break;
    }
  });

export default addFileReducer;
