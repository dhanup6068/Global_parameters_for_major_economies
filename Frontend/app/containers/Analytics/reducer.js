/*
 * HomeReducer
 *
 * The reducer takes care of our data. Using actions, we can
 * update our application state. To add a new action,
 * add it to the switch statement in the reducer function
 *
 */

import produce from 'immer';
import { GET_FILE_COLUMNS, GET_FILE_COLUMNS_ERROR, GET_FILE_COLUMNS_SUCCESS, SEARCH, SEARCH_SUCCESS, SEARCH_ERROR, RESET_SEARCH } from './constants';

// The initial state of the App
export const initialState = {
  fileColumns: [],
  loading: false
};

/* eslint-disable default-case, no-param-reassign */
const analytics = (state = initialState, action) =>
  produce(state, draft => {
    switch (action.type) {
      case GET_FILE_COLUMNS:
        draft.loading = true;
        break;
      case GET_FILE_COLUMNS_SUCCESS:
        draft.loading = false;
        draft.fileColumns = action.result.fileColumns;
        break;
      case GET_FILE_COLUMNS_ERROR:
        draft.loading = false;
        break;

      case SEARCH:
        draft.loading = true;
        draft.loadingString = action.loadingString;
        break;
      case SEARCH_SUCCESS:
        draft.loading = false;
        draft.searchResults = action.result.searchResults;
        break;
      case SEARCH_ERROR:
        draft.loading = false;
        break;
      
      case RESET_SEARCH:
        draft.searchResults = [];
        break;
    }
  });

export default analytics;
