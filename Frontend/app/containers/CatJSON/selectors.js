/**
 * Homepage selectors
 */

import { createSelector } from 'reselect';
import { initialState } from './reducer';

const makeSelectAddFolder = state => state.addFolder || initialState;

const makeSelectParent = state => state.files || { empty: true };

const makeSelectFolderAdded = () =>
  createSelector(
    makeSelectAddFolder,
    state => state.folderAdded
  );

const makeSelectParentData = () =>
  createSelector(
    makeSelectParent,
    state => state.parent
  );

export { makeSelectFolderAdded, makeSelectParentData };
