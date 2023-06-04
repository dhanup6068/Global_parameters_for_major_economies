import { ADD_FILE, ADD_FILE_SUCCESS, ADD_FILE_ERROR, RESET_ADD_FILE } from './constants';

export function addFile(file) {
  return {
    type: ADD_FILE,
    file,
  };
}

export function addFileSuccess() {
  return {
    type: ADD_FILE_SUCCESS
  };
}

export function addFileError(error) {
  return {
    type: ADD_FILE_ERROR,
    error
  };
}