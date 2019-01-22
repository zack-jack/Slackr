import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Switch, Route, withRouter } from 'react-router-dom';
import firebase from '../firebase/firebase';

import Welcome from './Welcome';
import Register from './auth/Register';
import Login from './auth/Login';
import Chat from './chat/Chat';
import Spinner from './common/Spinner';

import { setUser, clearUser } from '../actions/user';

class App extends Component {
  componentDidMount() {
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        // Add current user data to the redux store
        this.props.setUser(user);

        // Redirect to the chat
        this.props.history.push('/slackr');
      } else {
        this.props.history.push('/');

        // Remove user data from redux store
        this.props.clearUser();
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
        <Route path="/slackr" component={Chat} />
      </Switch>
    );
  }
}

const mapStateToProps = state => ({
  isLoading: state.user.isLoading
});

export default withRouter(
  connect(
    mapStateToProps,
    { setUser, clearUser }
  )(App)
);
