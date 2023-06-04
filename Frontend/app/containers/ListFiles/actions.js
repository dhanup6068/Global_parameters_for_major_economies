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

import { GET_FILES, GET_FILES_SUCCESS, GET_FILES_ERROR, DELETE_FILE, DELETE_FILE_SUCCESS } from './constants';

/**
 * Changes the input field of the form
 *
 * @param  {string} username The new text of the input field
 *
 * @return {object} An action object with a type of CHANGE_USERNAME
 */
// export function changeUsername(username) {
//   return {
//     type: CHANGE_USERNAME,
//     username,
//   };
// }

export function getFiles(db, parentId) {
  return {
    type: GET_FILES,
    parentId,
    db
  };
}

export function getFilesSuccess(result) {
  return {
    type: GET_FILES_SUCCESS,
    result
  };
}

export function getFilesError(error) {
  return {
    type: GET_FILES_ERROR,
    error
  };
}

export function deleteFile(inode, db, parentId) {
  return {
    type: DELETE_FILE,
    inode,
    db,
    parentId
  };
}