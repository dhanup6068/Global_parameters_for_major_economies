/**
 * Gets the repositories of the user from Github
 */

import { call, put, select, takeLatest } from 'redux-saga/effects';
import { ADD_FILE } from './constants';
import Config from '../../../config.json';
import { addFileSuccess, addFileError } from './actions';
import { message } from "antd";

import request from 'utils/request';

export function* addFileSaga(args) {
  const { file: { db, formData } } = args;
  const requestURL = `${Config.backend.baseUrl}${db.toUpperCase()}/file`;
  try {
    const result = yield call(request, requestURL, {
      method: 'POST',
      body: formData,
    });
    if (result.status !== 200) throw result;
    message.success(result.message);
    yield put(addFileSuccess());
  }
  catch (err) {
    console.log("Error in add file:", err);
    yield put(addFileError());
    message.error(err.message);
  }
}

export default function* githubData() {
  // Watches for LOAD_REPOS actions and calls getRepos when one comes in.
  // By using `takeLatest` only the result of the latest API call is applied.
  // It returns task descriptor (just like fork) so we can continue execution
  // It will be cancelled automatically on component unmount
  yield takeLatest(ADD_FILE, addFileSaga);
}
