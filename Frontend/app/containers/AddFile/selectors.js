/**
 * Homepage selectors
 */

import { createSelector } from 'reselect';
import { initialState } from './reducer';

const makeSelectAddFile = state => state.addFile || initialState;
const makeSelectParent = state => state.files || { empty: true };
const addFileLoader = state => state.addFile.loading;

const makeSelectFileAdded = () =>
  createSelector(
    makeSelectAddFile,
    state => state.fileAdded
  );

const makeSelectParentData = () =>
  createSelector(
    makeSelectParent,
    state => state.parent
  );

const makeSelectLoading = () =>
  createSelector(
    addFileLoader,
    state => state
  );

export { makeSelectFileAdded, makeSelectParentData, makeSelectLoading };
