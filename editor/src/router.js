import React from 'react';
import { Router, Route } from 'dva/router';
import Studio from './routes/Studio';

function RouterConfig({ history }) {
  return (
    <Router history={history}>
      <Route path="/" component={Studio} />
    </Router>
  );
}

export default RouterConfig;
