/**
 * Gets the repositories of the user from Github
 */

import { call, put, select, takeLatest } from 'redux-saga/effects';
import { GET_FILE_DATA, GET_PARTITIONS, GET_PARTITION_DATA } from './constants';
import Config from '../../../config.json';
import { getFileDataSuccess, getPartitionsSuccess, getPartitionDataSuccess } from './actions';
import { message } from "antd";

import request from 'utils/request';

export function* getFileSaga(args) {
  const { inode, db } = args;
  const requestURL = `${Config.backend.baseUrl}${db.toUpperCase()}/cat/${inode}`;

  try {
    const result = yield call(request, requestURL);
    if (result.status !== 200) throw result;
    yield put(getFileDataSuccess(result));
  } catch (err) {
    message.error(err.message);
  }
}

export function* getPartitionsSaga(args) {
  const { inode, db } = args;
  const requestURL = `${Config.backend.baseUrl}${db.toUpperCase()}/getPartitions/${inode}`;

  try {
    const result = yield call(request, requestURL);
    if (result.status !== 200) throw result;
    yield put(getPartitionsSuccess(result.partitionedOn, result.partitions));
  } catch (err) {
    message.error(err.message);
  }
}

export function* getPartitionDataSaga(args) {
  const { blockId, db } = args;
  const requestURL = `${Config.backend.baseUrl}${db.toUpperCase()}/getPartition/${blockId}`;

  try {
    const result = yield call(request, requestURL);
    if (result.status !== 200) throw result;
    yield put(getPartitionDataSuccess(result.partitionData));
  } catch (err) {
    message.error(err.message);
  }
}

/**
 * Root saga manages watcher lifecycle
 */
export default function* githubData() {
  // Watches for LOAD_REPOS actions and calls getRepos when one comes in.
  // By using `takeLatest` only the result of the latest API call is applied.
  // It returns task descriptor (just like fork) so we can continue execution
  // It will be cancelled automatically on component unmount
  yield takeLatest(GET_FILE_DATA, getFileSaga);
  yield takeLatest(GET_PARTITIONS, getPartitionsSaga);
  yield takeLatest(GET_PARTITION_DATA, getPartitionDataSaga);
}
