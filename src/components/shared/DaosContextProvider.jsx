import React, { useReducer } from 'react';
import DaosContext from '../../contexts/DaosContext';
import {
  DAOS_LIST_START,
  DAOS_LIST_SUCCESS,
  DAOS_LIST_FAIL,
  DAOS_LIST_RESET,
  DAOS_LIST_FILTER,
  DAOS_LIST_STATUS_PENDING,
  DAOS_LIST_STATUS_RESOLVED,
  DAOS_LIST_STATUS_REJECTED
} from '../../constants/index';

const daosReducer = (state, action) => {
  switch (action.type) {
    case DAOS_LIST_START: {
      return {
        ...state,
        status: DAOS_LIST_STATUS_PENDING
      };
    }
    case DAOS_LIST_SUCCESS: {
      return {
        ...state,
        status: DAOS_LIST_STATUS_RESOLVED,
        daos: action.daos,
        daosFiltered: action.daos
      };
    }
    case DAOS_LIST_FAIL: {
      return {
        ...state,
        status: DAOS_LIST_STATUS_REJECTED,
        error: action.error
      };
    }
    case DAOS_LIST_FILTER: {
      return {
        ...state,
        daosFiltered: state.daos
          ? state.daos.filter((dao) => {
              return dao.toLowerCase().includes(action.filter.toLowerCase());
            })
          : [],
        status: DAOS_LIST_STATUS_RESOLVED
      };
    }
    case DAOS_LIST_RESET: {
      return {
        ...state,
        status: null,
        error: null
      };
    }
    default: {
      throw new Error(`Unhandled action type: ${action.type}`);
    }
  }
};

const DaosContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(daosReducer, {
    status: null,
    error: null,
    daos: [],
    daosFiltered: []
  });
  const value = [state, dispatch];
  return <DaosContext.Provider value={value}>{children}</DaosContext.Provider>;
};

export default DaosContextProvider;
