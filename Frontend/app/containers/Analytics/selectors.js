/**
 * Homepage selectors
 */

import { createSelector } from 'reselect';
import { initialState } from './reducer';

const selectAnalytics = state => state.analytics || initialState;

const makeSelectAnalytics = () =>
  createSelector(
    selectAnalytics,
    state => state
  );

export { makeSelectAnalytics };