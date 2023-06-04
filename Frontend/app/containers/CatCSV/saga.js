/**
 * Gets the repositories of the user from Github
 */

import { call, put, select, takeLatest } from 'redux-saga/effects';
import { ADD_FOLDER } from './constants';
import Config from '../../../config.json';
import { addFolderSuccess } from './actions';
import { message } from "antd";

import request from 'utils/request';

/**
 * Github repos request/response handler
 */
// export function* addFolderSaga(args) {
//   const { folder: { parentId, db, folderName: name } } = args;
//   const requestURL = `${Config.backend.baseUrl}${db.toUpperCase()}/folder`;
//   const body = { name, parentId };

//   try {
//     const result = yield call(request, requestURL, {
//       method: 'POST',
//       body: JSON.stringify(body),
//       headers: { 'Content-Type': 'application/json' },
//     });
//     if (result.status !== 200) throw result;
//     message.success(result.message);
//     yield put(addFolderSuccess());
//   } catch (err) {
//     message.error(err.message);
//   }
// }

/**
 * Root saga manages watcher lifecycle
 */
export default function* githubData() {
  // Watches for LOAD_REPOS actions and calls getRepos when one comes in.
  // By using `takeLatest` only the result of the latest API call is applied.
  // It returns task descriptor (just like fork) so we can continue execution
  // It will be cancelled automatically on component unmount
  // yield takeLatest(ADD_FOLDER, addFolderSaga);
}
