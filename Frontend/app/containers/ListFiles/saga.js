/**
 * Gets the repositories of the user from Github
 */

import { call, put, select, takeLatest } from 'redux-saga/effects';
import { GET_FILES, DELETE_FILE } from './constants';
import Config from '../../../config.json';
import { getFilesSuccess, getFilesError, getFiles } from './actions';
import { message } from "antd";

import request from 'utils/request';

/**
 * Github repos request/response handler
 */
export function* getFilesSaga(args) {
  const { parentId, db } = args;
  let requestURL = `${Config.backend.baseUrl}${db.toUpperCase()}/files`;
  if (parentId) requestURL += `?parentId=${parentId}`;
  try {
    const result = yield call(request, requestURL);
    if (result.status !== 200) throw result;
    yield put(getFilesSuccess(result));
  } catch (err) {
    yield put(getFilesError(err));
  }
}

export function* deleteFileSaga(args) {
  const { inode, parentId, db } = args;

  let requestURL = `${Config.backend.baseUrl}${db.toUpperCase()}/file/${inode}`;

  try {
    const result = yield call(request, requestURL, { method: 'DELETE' });
    if (result.status !== 200) throw result;
    message.success(result.message);
    yield put(getFiles(db, parentId));
  } catch (err) {
    message.error(err.message);
    // yield put(getFilesError(err));
  }
}

/**
 * Root saga manages watcher lifecycle
 */
export default function* githubData() {
  yield takeLatest(GET_FILES, getFilesSaga);
  yield takeLatest(DELETE_FILE, deleteFileSaga);
}
