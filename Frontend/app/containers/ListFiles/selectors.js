/**
 * Homepage selectors
 */

import { createSelector } from 'reselect';
import { initialState } from './reducer';

const selectListFiles = state => state.files || initialState;

const makeSelectListFiles = () =>
  createSelector(
    selectListFiles,
    state => state
  );

export { makeSelectListFiles };