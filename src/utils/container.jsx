import React, {
  createContext,
  useContext,
  useReducer,
  useState,
  useEffect
} from 'react'
import {reducer, defaultState} from './store'
import CustomizedSnackbar from './snackbar-wrapper'
import Loading from './Loading'

const StateContext = createContext({})
const MutationContext = createContext({})

export const ContainerProvider = ({children}) => {
  const [state, dispatch] = useReducer(reducer, defaultState)

  window.rootState = state

  const [toasts, updateToasts] = useState([])

  const methods = {
    startLoading() {
      dispatch({type: 'loading', payload: true})
    },
    stopLoading() {
      dispatch({type: 'loading', payload: false})
    },
    updateConfig(params) {
      dispatch({type: 'config', payload: {...state.config, ...params}})
    },
    removeTop() {
      const items = toasts.filter((e, idx) => idx > 0)
      updateToasts([...items])
    },
    toastSuccess(message) {
      updateToasts([
        ...toasts,
        {
          variant: 'success',
          message
        }
      ])
    },
    toastInfo(message) {
      updateToasts([
        ...toasts,
        {
          variant: 'info',
          message
        }
      ])
    },
    toastError(message) {
      updateToasts([
        ...toasts,
        {
          variant: 'error',
          message
        }
      ])
    },
  }

  useEffect(() => {
    window.localStorage.setItem(
      'dao_storage',
      JSON.stringify({
        factory: state.config.factory,
        contract: state.config.contract,
        network: state.config.network,
        filter: {
          switchAll: state.config.filter.switchAll,
          switchInProgress: state.config.filter.switchInProgress,
          switchDone: state.config.filter.switchDone,
          switchNew: state.config.filter.switchNew,
          switchExpired: state.config.filter.switchExpired,
        },
        lastShownProposal: state.config.lastShownProposal,
        lastJsonData: state.config.lastJsonData,
      })
    )
  }, [state])

  return (
    <StateContext.Provider value={state}>
      <MutationContext.Provider value={methods}>
        <CustomizedSnackbar toasts={toasts}/>
        {state.loading ? <Loading/> : null}
        {children}
      </MutationContext.Provider>
    </StateContext.Provider>
  )
}

export function useGlobalState() {
  return useContext(StateContext)
}

export function useGlobalMutation() {
  return useContext(MutationContext)
}
