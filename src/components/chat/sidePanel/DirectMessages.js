import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Menu, Icon } from 'semantic-ui-react';

import firebase from '../../../firebase/firebase';
import { setCurrentChannel, setPrivateChannel } from '../../../actions/channel';

class DirectMessages extends Component {
  state = {
    activeChannel: '',
    currentUser: this.props.currentUser,
    users: [],
    usersRef: firebase.database().ref('users'),
    connectedRef: firebase.database().ref('.info/connected'),
    presenceRef: firebase.database().ref('presence')
  };

  componentDidMount() {
    if (this.state.currentUser) {
      this.addListeners(this.state.currentUser.uid);
    }
  }

  componentWillUnmount() {
    this.removeListeners();
  }

  addListeners = currentUserUid => {
    let loadedUsers = [];

    // Listen for new user add
    this.state.usersRef.on('child_added', snap => {
      // Exclude the current user
      if (currentUserUid !== snap.key) {
        let user = snap.val();

        // Set user properties
        user['uid'] = snap.key;
        user['status'] = 'offline';

        // Add user to loaded users
        loadedUsers.push(user);

        // Update state with new users
        this.setState({ users: loadedUsers });
      }
    });

    // Listen for user online status
    this.state.connectedRef.on('value', snap => {
      // if user is online
      if (snap.val() === true) {
        const ref = this.state.presenceRef.child(currentUserUid);

        // Set online status
        ref.set(true);

        // If user disconnected, remove online status
        ref.onDisconnect().remove(err => {
          if (err !== null) {
            console.log(err);
          }
        });
      }
    });

    // Listen for user status change to online
    this.state.presenceRef.on('child_added', snap => {
      // Exclude current user
      if (currentUserUid !== snap.key) {
        // Update user with online status
        this.addUserStatus(snap.key);
      }
    });

    // Listen for user status change to offline
    this.state.presenceRef.on('child_removed', snap => {
      // Exclude current user
      if (currentUserUid !== snap.key) {
        // Update user with online status
        this.addUserStatus(snap.key, false);
      }
    });
  };

  removeListeners = () => {
    this.state.usersRef.off();
    this.state.presenceRef.off();
    this.state.connectedRef.off();
  };

  addUserStatus = (userId, connected = true) => {
    const { users } = this.state;

    // Loop through users and add online status
    const updatedUsers = users.reduce((accumulator, user) => {
      if (user.uid === userId) {
        // Update user status property with connected status
        user['status'] = `${connected ? 'online' : 'offline'}`;
      }

      return accumulator.concat(user);
    }, []);

    // Update state with updated users array
    this.setState({ users: updatedUsers });
  };

  isUserOnline = user => {
    return user.status === 'online';
  };

  changeChannel = user => {
    const channelId = this.getChannelId(user.uid);
    const channelData = {
      id: channelId,
      name: user.name
    };

    // Set channel with redux
    this.props.setCurrentChannel(channelData);

    // Set channel to private with redux
    this.props.setPrivateChannel(true);

    // Set active channel
    this.setActiveChannel(user.uid);
  };

  getChannelId = userId => {
    const currentUserId = this.state.currentUser.uid;

    // Create unique path for direct message channel
    return `${currentUserId}/${userId}`;
  };

  setActiveChannel = userId => {
    this.setState({ activeChannel: userId });
  };

  renderUsers = (users, activeChannel) => {
    return users.map(user => (
      <Menu.Item
        key={user.uid}
        active={user.uid === activeChannel}
        style={{ opacity: 0.6, fontStyle: 'italic' }}
        onClick={() => this.changeChannel(user)}
      >
        <Icon name="circle" color={this.isUserOnline(user) ? 'green' : 'red'} />
        @ {user.name}
      </Menu.Item>
    ));
  };

  render() {
    const { users, activeChannel } = this.state;

    return (
      <Menu.Menu className="menu">
        <Menu.Item>
          <span>
            <Icon name="mail" />
            Direct Messages
          </span>
          ({users.length})
        </Menu.Item>
        {this.renderUsers(users, activeChannel)}
      </Menu.Menu>
    );
  }
}

export default connect(
  null,
  { setCurrentChannel, setPrivateChannel }
)(DirectMessages);
