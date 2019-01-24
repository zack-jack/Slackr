import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import {
  Grid,
  Form,
  Segment,
  Button,
  Header,
  Message,
  Icon
} from 'semantic-ui-react';
import md5 from 'md5';

import firebase from '../../firebase/firebase';

class Register extends Component {
  state = {
    username: '',
    email: '',
    password: '',
    passwordConfirm: '',
    usersRef: firebase.database().ref('users'),
    errors: [],
    isSubmitting: false
  };

  isFormValid = () => {
    let errors = [];
    let error;

    // Check if empty form fields
    if (this.isFormEmpty(this.state)) {
      error = { message: 'Please fill in all required fields.' };
      errors.push(error);

      this.setState({ errors });

      return false;
    } else if (!this.isPasswordValid(this.state)) {
      return false;
    } else {
      // form data is valid
      return true;
    }
  };

  isFormEmpty = ({ username, email, password, passwordConfirm }) => {
    return (
      !username.length ||
      !email.length ||
      !password.length ||
      !passwordConfirm.length
    );
  };

  isPasswordValid = ({ password, passwordConfirm }) => {
    let errors = [];
    let error;

    // Check password matches the confirm password
    if (password !== passwordConfirm) {
      error = { message: 'Passwords do not match.' };
      errors.push(error);

      this.setState({ errors });

      return false;

      // Check password length requirement
    } else if (password.length < 8 || passwordConfirm.length < 8) {
      error = { message: 'Password must be at least 8 characters.' };
      errors.push(error);

      this.setState({ errors });

      return false;
    } else {
      return true;
    }
  };

  displayErrors = errors => {
    return errors.map((error, i) => {
      return (
        <p key={i} className="error">
          {error.message}
        </p>
      );
    });
  };

  handleChange = e => {
    this.setState({ [e.target.name]: e.target.value });
  };

  handleSubmit = e => {
    e.preventDefault();

    if (this.isFormValid()) {
      this.setState({ errors: [], isSubmitting: true });

      const { email, password } = this.state;

      firebase
        .auth()
        .createUserWithEmailAndPassword(email, password)
        .then(newUser => {
          newUser.user
            .updateProfile({
              displayName: this.state.username,
              photoURL: `http://gravatar.com/avatar/${md5(
                newUser.user.email
              )}?d=identicon`
            })
            .then(() => {
              this.saveUser(newUser);

              this.setState({ isSubmitting: false });
            })
            .catch(err => {
              console.log(err);
              this.setState({
                errors: [...this.state.errors, err],
                isSubmitting: false
              });
            });
        })
        .catch(err => {
          console.log(err);

          this.setState({
            errors: [...this.state.errors, err],
            isSubmitting: false
          });
        });
    }
  };

  saveUser = newUser => {
    return this.state.usersRef.child(newUser.user.uid).set({
      name: newUser.user.displayName,
      avatar: newUser.user.photoURL
    });
  };

  render() {
    const {
      username,
      email,
      password,
      passwordConfirm,
      errors,
      isSubmitting
    } = this.state;

    return (
      <Grid textAlign="center" verticalAlign="middle" className="register app">
        <Grid.Column style={{ maxWidth: 450 }}>
          <Header as="h2" icon color="orange" textAlign="center">
            <Icon name="slack hash" color="orange" />
            Register for Slackr
          </Header>

          <Form size="large" onSubmit={this.handleSubmit}>
            <Segment>
              <Form.Input
                fluid
                name="username"
                icon="user"
                iconPosition="left"
                type="text"
                placeholder="Username"
                value={username}
                onChange={this.handleChange}
              />

              <Form.Input
                fluid
                name="email"
                icon="envelope"
                iconPosition="left"
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={this.handleChange}
              />

              <Form.Input
                fluid
                name="password"
                icon="lock"
                iconPosition="left"
                type="password"
                placeholder="Password"
                value={password}
                onChange={this.handleChange}
              />

              <Form.Input
                fluid
                name="passwordConfirm"
                icon="repeat"
                iconPosition="left"
                type="password"
                placeholder="Password Confirmation"
                value={passwordConfirm}
                onChange={this.handleChange}
              />

              <Button
                className={isSubmitting ? 'loading' : ''}
                color="orange"
                disabled={isSubmitting}
                fluid
                size="large"
              >
                Register
              </Button>
            </Segment>
          </Form>

          {errors.length > 0 && (
            <Message error>{this.displayErrors(errors)}</Message>
          )}

          <Message>
            Already registered? <Link to="/login">Login</Link>
          </Message>
        </Grid.Column>
      </Grid>
    );
  }
}

export default Register;
