/*
 * Home Actions
 *
 * Actions change things in your application
 * Since this boilerplate uses a uni-directional data flow, specifically redux,
 * we have these actions which are the only way your application interacts with
 * your application state. This guarantees that your state is up to date and nobody
 * messes it up weirdly somewhere.
 *
 * To add a new Action:
 * 1) Import your constant
 * 2) Add a function like this:
 *    export function yourAction(var) {
 *        return { type: YOUR_ACTION_CONSTANT, var: var }
 *    }
 */

import { ADD_FOLDER, ADD_FOLDER_SUCCESS, ADD_FOLDER_ERROR, RESET_ADD_FOLDER } from './constants';

export function addFolder(folder) {
  return {
    type: ADD_FOLDER,
    folder,
  };
}

export function addFolderSuccess() {
  return {
    type: ADD_FOLDER_SUCCESS
  };
}

export function addFolderError(error) {
  return {
    type: ADD_FOLDER_ERROR,
    error
  };
}

export function resetAddFolder() {
  return {
    type: RESET_ADD_FOLDER
  };
}