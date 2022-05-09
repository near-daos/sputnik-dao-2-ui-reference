import React, { useContext } from 'react';
import DaosContext from '../contexts/DaosContext';
import {
  DAOS_LIST_START,
  DAOS_LIST_SUCCESS,
  DAOS_LIST_FAILURE,
  DAOS_LIST_FILTER,
  DAOS_LIST_RESET
} from '../constants/index';

const loadAllDaos = async () => {
  const daos = await window.contract.get_daos();

  console.log(daos);

  return daos;
};

const useDaoSearchFilters = () => {
  const context = useContext(DaosContext);

  if (context === undefined) {
    throw new Error(`useDaoSearchFilters must be used within a DaosContextProvider`);
  }

  const [{ status, error, daosFiltered }, dispatch] = context;

  dispatch({ type: DAOS_LIST_START });
  loadAllDaos()
    .then((daos) => {
      dispatch({ type: DAOS_LIST_SUCCESS, payload: daos });
    })
    .catch((error) => {
      dispatch({ type: DAOS_LIST_FAILURE, payload: error });
    });

  const filterDaosByName = (name) => {
    if (name === '') {
      return dispatch({ type: DAOS_LIST_RESET });
    }

    dispatch({ type: DAOS_LIST_FILTER, filter: name });
  };

  return { daosFiltered, status, error, filterDaosByName };
};

export default useDaoSearchFilters;
