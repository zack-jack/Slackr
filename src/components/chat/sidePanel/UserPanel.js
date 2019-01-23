import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Grid, Header, Icon, Dropdown, Image } from 'semantic-ui-react';

import firebase from 'firebase';
import { clearUser } from '../../../actions/user';

class UserPanel extends Component {
  state = {
    user: this.props.currentUser
  };

  onChange = e => {
    const selectedText = e.target.innerText;

    if (selectedText === 'Sign Out') {
      this.handleSignOut();
    }
  };

  handleSignOut = () => {
    firebase
      .auth()
      .signOut()
      .then(() => {
        this.props.clearUser();
      });
  };

  render() {
    const { user } = this.state;

    const trigger = (
      <span>
        <Image src={user.photoURL} spaced="right" avatar />
        {user.displayName}
      </span>
    );

    const options = [
      {
        key: 'user',
        text: (
          <span>
            Signed in as <strong>{user.displayName}</strong>
          </span>
        ),
        disabled: true
      },
      {
        key: 'changeAvatar',
        text: 'Change Avatar'
      },
      {
        key: 'signOut',
        text: 'Sign Out'
      }
    ];

    return (
      <Grid>
        <Grid.Column>
          <Grid.Row>
            <Header inverted floated="left" as="h2">
              <Icon name="slack hash" />
              <Header.Content>Slackr</Header.Content>
            </Header>

            <Header inverted as="h4">
              <Dropdown
                trigger={trigger}
                options={options}
                onChange={this.onChange}
              />
            </Header>
          </Grid.Row>
        </Grid.Column>
      </Grid>
    );
  }
}

export default connect(
  null,
  { clearUser }
)(UserPanel);
