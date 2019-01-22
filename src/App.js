import React, { Component } from 'react';
import { Switch, Route, withRouter } from 'react-router-dom';
import firebase from './firebase/firebase';

import Welcome from './components/Welcome';
import Register from './components/auth/Register';
import Login from './components/auth/Login';
import Dashboard from './components/Dashboard';

class App extends Component {
  componentDidMount() {
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        this.props.history.push('/dashboard');
      }
    });
  }

  render() {
    return (
      <Switch>
        <Route path="/" exact component={Welcome} />
        <Route path="/register" component={Register} />
        <Route path="/login" component={Login} />
        <Route path="/dashboard" component={Dashboard} />
      </Switch>
    );
  }
}

export default withRouter(App);
