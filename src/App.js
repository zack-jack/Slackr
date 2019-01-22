import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Switch, Route, withRouter } from 'react-router-dom';
import firebase from './firebase/firebase';

import Welcome from './components/Welcome';
import Register from './components/auth/Register';
import Login from './components/auth/Login';
import Dashboard from './components/Dashboard';
import Spinner from './components/common/Spinner';

import { setUser } from './actions/auth';

class App extends Component {
  componentDidMount() {
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        this.props.setUser(user);
        this.props.history.push('/dashboard');
      }
    });
  }

  render() {
    return this.props.isLoading ? (
      <Spinner />
    ) : (
      <Switch>
        <Route path="/" exact component={Welcome} />
        <Route path="/register" component={Register} />
        <Route path="/login" component={Login} />
        <Route path="/dashboard" component={Dashboard} />
      </Switch>
    );
  }
}

const mapStateToProps = state => ({
  isLoading: state.auth.isLoading
});

export default withRouter(
  connect(
    mapStateToProps,
    { setUser }
  )(App)
);
