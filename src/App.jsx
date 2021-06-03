import React from 'react';
import {Route, Switch} from 'react-router-dom';
import Dao from './Dao';
import {BrowserRouterHook} from './utils/use-router';
import NotFound from "./NotFound";
import ProposalPage from "./ProposalPage";

function App() {
  return (
    <BrowserRouterHook>
      <Switch>
        <Route exact path="/:dao" component={Dao}/>
        <Route exact path="/:dao/add_proposal/:type" component={Dao}/>
        <Route exact path="/:dao/:proposal" component={ProposalPage}/>
        <Route path="/" component={Dao}/>
        <Route path="*">
          <NotFound/>
        </Route>
      </Switch>
    </BrowserRouterHook>
  )
}

export default App
