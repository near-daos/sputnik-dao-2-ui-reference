import 'regenerator-runtime/runtime';
import { connect, Contract, keyStores, WalletConnection } from 'near-api-js';
import { useGlobalState, useGlobalMutation } from './container';
import getConfig from '../config';
import * as nearApi from 'near-api-js';
import Decimal from 'decimal.js';
import { yoktoNear } from './funcs';

export const nearConfig = getConfig(process.env.NODE_ENV || 'development');

export async function initContract() {
  const near = await connect(
    Object.assign({ deps: { keyStore: new keyStores.BrowserLocalStorageKeyStore() } }, nearConfig)
  );
  window.walletConnection = new WalletConnection(near);
  window.accountId = window.walletConnection.getAccountId();
  window.factoryContract = await new Contract(
    window.walletConnection.account(),
    nearConfig.contractName,
    {
      viewMethods: ['get_dao_list', 'get_number_daos', 'get_daos'],
      changeMethods: ['create']
    }
  );
}

export function logout() {
  window.walletConnection.signOut();
  window.location.replace(window.location.origin + window.location.pathname);
}

export function login({ redirectToCreateDao } = { redirectToCreateDao: false }) {
  const successUrl = redirectToCreateDao
    ? window.location.origin + '/?createdao=true'
    : window.location.origin + window.location.pathname;

  const signInConfig = {
    contractId: nearConfig.contractName,
    successUrl
  };

  window.walletConnection.requestSignIn(signInConfig);
}

export const provider = new nearApi.providers.JsonRpcProvider(nearConfig.nodeUrl);
export const connection = new nearApi.Connection(nearConfig.nodeUrl, provider, {});

export async function accountExists(accountId) {
  try {
    await new nearApi.Account(connection, accountId).state();
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
}

export async function getDaoState(dao) {
  try {
    const state = await new nearApi.Account(connection, dao).state();
    const amountYokto = new Decimal(state.amount);
    return amountYokto.div(yoktoNear).toFixed(2);
  } catch (error) {
    console.log(error);
    return 0;
  }
}
