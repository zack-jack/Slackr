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

import firebase from '../../firebase/firebase';

class Login extends Component {
  state = {
    email: '',
    password: '',
    errors: [],
    isSubmitting: false
  };

  isFormValid = ({ email, password }) => {
    let errors = [];
    let error;

    if (!email || !password) {
      error = { message: 'Please fill in all required fields.' };
      errors.push(error);

      this.setState({ errors });

      return false;
    }
  };

  displayErrors = errors => {
    return errors.map((error, i) => {
      return <p key={i}>{error.message}</p>;
    });
  };

  handleChange = e => {
    this.setState({ [e.target.name]: e.target.value });
  };

  handleSubmit = e => {
    e.preventDefault();

    if (this.isFormValid(this.state)) {
      this.setState({ errors: [], isSubmitting: true });

      const { email, password } = this.state;
      firebase
        .auth()
        .signInWithEmailAndPassword(email, password)
        .then(signedInUser => {
          this.setState({ isSubmitting: false });
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

  render() {
    const { email, password, errors, isSubmitting } = this.state;

    return (
      <Grid textAlign="center" verticalAlign="middle">
        <Grid.Column style={{ maxWidth: 450 }}>
          <Header as="h2" icon color="violet" textAlign="center">
            <Icon name="slack hash" color="violet" />
            Login to Slackr
          </Header>

          <Form size="large" onSubmit={this.handleSubmit}>
            <Segment>
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

              <Button
                className={isSubmitting ? 'loading' : ''}
                color="violet"
                disabled={isSubmitting}
                fluid
                size="large"
              >
                Login
              </Button>
            </Segment>
          </Form>

          {errors.length > 0 && (
            <Message error>{this.displayErrors(errors)}</Message>
          )}

          <Message>
            Don't have an account? <Link to="/register">Register</Link>
          </Message>
        </Grid.Column>
      </Grid>
    );
  }
}

export default Login;
