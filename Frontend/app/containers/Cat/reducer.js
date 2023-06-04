/*
 * HomeReducer
 *
 * The reducer takes care of our data. Using actions, we can
 * update our application state. To add a new action,
 * add it to the switch statement in the reducer function
 *
 */

import produce from 'immer';
import { GET_FILE_DATA, GET_FILE_DATA_SUCCESS, GET_PARTITIONS, GET_PARTITIONS_SUCCESS, GET_PARTITION_DATA, GET_PARTITION_DATA_SUCCESS, RESET_CAT } from './constants';

// The initial state of the App
export const initialState = { data: [], fileName: "", partitions: [], loadingCat: false, loadingParts: false };

/* eslint-disable default-case, no-param-reassign */
const addFolderReducer = (state = initialState, action) =>
  produce(state, draft => {
    switch (action.type) {
      case GET_FILE_DATA:
        draft.loadingCat = true;
        break;
      case GET_FILE_DATA_SUCCESS:
        draft.loadingCat = false;
        draft.data = action.data.data;
        draft.fileName = action.data.fileName;
        draft.parentInode = action.data.parentInode;
        break;
      case GET_PARTITIONS:
        draft.loadingParts = true;
        break;
      case GET_PARTITIONS_SUCCESS:
        draft.loadingParts = false;
        draft.partitionedOn = action.partitionedOn;
        draft.partitions = action.partitions;
        break;
      case GET_PARTITION_DATA:
        draft.loading = true;
        break;
      case GET_PARTITION_DATA_SUCCESS:
        draft.loading = false;
        draft.partitionData = action.partitionData;
        break;
      case RESET_CAT:
        draft.data = [];
        draft.fileName = "";
        draft.partitions = [];
    }
  });

export default addFolderReducer;
