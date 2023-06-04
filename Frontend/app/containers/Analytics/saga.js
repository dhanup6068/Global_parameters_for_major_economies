import { call, put, select, takeLatest } from 'redux-saga/effects';
import { GET_FILE_COLUMNS, SEARCH } from './constants';
import Config from '../../../config.json';
import { getFileColumnsError, getFileColumnsSuccess, searchSuccess, searchError } from './actions';
import { message } from "antd";

import request from 'utils/request';

export function* getFileColumnsSaga(args) {
  const { inode, db } = args;
  let requestURL = `${Config.backend.baseUrl}${db.toUpperCase()}/columns/${inode}`;

  try {
    const result = yield call(request, requestURL);

    if (result.status !== 200) throw result;
    yield put(getFileColumnsSuccess(result));
  } catch (err) {
    message.error(err.message);
    yield put(getFileColumnsError(err));
  }
}

export function* searchSaga(args) {
  const { db, inode, searchFields: { column, searchValue = null, operator = null, from = null, to = null, fromDate = null, toDate = null } } = args;
  let requestURL = `${Config.backend.baseUrl}${db.toUpperCase()}/search/${inode}/${column}?operator=${operator}`;
  if (operator === "between") {
    if (column === "timeStamp"){
      requestURL += `&from=${fromDate}&to=${toDate}`;
    }
    else
      requestURL += `&from=${from}&to=${to}`;
  }
  else
    requestURL += `&searchValue=${searchValue}`;

  // let requestURL = `${Config.backend.baseUrl}${db.toUpperCase()}/search/${inode}/${column}/${searchValue}?exactMatch=${exactMatch}`;

  try {
    const result = yield call(request, requestURL);

    if (result.status !== 200) throw result;
    yield put(searchSuccess(result));
  } catch (err) {
    message.error(err.message);
    yield put(searchError(err));
  }
}

export default function* analyticsSaga() {
  yield takeLatest(GET_FILE_COLUMNS, getFileColumnsSaga);
  yield takeLatest(SEARCH, searchSaga);
}
