import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { initContract } from './utils/utils';
import { ContainerProvider } from './utils/container';
import DaosContextProvider from './components/shared/DaosContextProvider';

import 'bootstrap-css-only/css/bootstrap.min.css';
import 'mdbreact/dist/css/mdb.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './global.css';

window.nearInitPromise = initContract()
  .then(() => {
    ReactDOM.render(
      <ContainerProvider>
        <DaosContextProvider>
          <App />
        </DaosContextProvider>
      </ContainerProvider>,
      document.querySelector('#root')
    );
  })
  .catch(console.error);
