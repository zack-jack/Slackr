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
    const { primaryColor } = this.props;

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
      <Grid style={{ background: primaryColor }}>
        <Grid.Column>
          <Grid.Row style={{ padding: '1rem 0 1rem 1rem', margin: 0 }}>
            <Header
              inverted
              floated="left"
              as="h2"
              style={{ marginBottom: '2rem' }}
            >
              <Icon name="slack hash" />
              <Header.Content>Slackr</Header.Content>
            </Header>

            <Header inverted as="h4" style={{ padding: '0.2rem' }}>
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
