import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

// Semantic UI styles
import 'semantic-ui-css/semantic.min.css';

// Components
import App from './components/App';
import Register from './components/auth/Register';
import Login from './components/auth/Login';

ReactDOM.render(
  <Router>
    <Switch>
      <Route path="/" exact component={App} />
      <Route path="/register" component={Register} />
      <Route path="/login" component={Login} />
    </Switch>
  </Router>,
  document.getElementById('root')
);
