/*
 * Home Actions
 *
 * Actions change things in your application
 * Since this boilerplate uses a uni-directional data flow, specifically redux,
 * we have these actions which are the only way your application interacts with
 * your application state. This guarantees that your state is up to date and nobody
 * messes it up weirdly somewhere.
 *
 * To add a new Action:
 * 1) Import your constant
 * 2) Add a function like this:
 *    export function yourAction(var) {
 *        return { type: YOUR_ACTION_CONSTANT, var: var }
 *    }
 */

import { GET_FILE_DATA, GET_FILE_DATA_SUCCESS, GET_PARTITIONS, GET_PARTITIONS_SUCCESS, GET_PARTITION_DATA, GET_PARTITION_DATA_SUCCESS, RESET_CAT } from './constants';

export function getFileData(inode, db) {
  return {
    type: GET_FILE_DATA,
    inode,
    db,
  };
}

export function getFileDataSuccess(data) {
  return {
    type: GET_FILE_DATA_SUCCESS,
    data,
  };
}

export function getPartitions(inode, db) {
  return {
    type: GET_PARTITIONS,
    inode,
    db,
  };
}

export function getPartitionsSuccess(partitionedOn, partitions) {
  return {
    type: GET_PARTITIONS_SUCCESS,
    partitionedOn,
    partitions
  };
}

export function getPartitionData(db, blockId) {
  return {
    type: GET_PARTITION_DATA,
    db,
    blockId
  };
}

export function getPartitionDataSuccess(partitionData) {
  return {
    type: GET_PARTITION_DATA_SUCCESS,
    partitionData,
  };
}

export function resetCat() {
  return {
    type: RESET_CAT
  };
}