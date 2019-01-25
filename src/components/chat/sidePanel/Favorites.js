import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Menu, Icon } from 'semantic-ui-react';

import firebase from '../../../firebase/firebase';
import { setCurrentChannel, setPrivateChannel } from '../../../actions/channel';

class Favorites extends Component {
  state = {
    user: this.props.currentUser,
    usersRef: firebase.database().ref('users'),
    activeChannel: '',
    favoritedChannels: []
  };

  componentDidMount() {
    const { user } = this.state;

    // If current user exists
    // pass user id to listeners
    if (user) {
      this.addListeners(user.uid);
    }
  }

  componentWillUnmount() {
    // Remove listeners
    this.removeListeners();
  }

  addListeners = userId => {
    const { usersRef } = this.state;

    // Listen to current user favoriting channel
    usersRef
      .child(userId)
      .child('favorited')
      .on('child_added', snap => {
        // Create a new object with the newly favorited channel
        const favoritedChannel = { id: snap.key, ...snap.val() };

        // Update state with new favorited channel
        this.setState({
          favoritedChannels: [...this.state.favoritedChannels, favoritedChannel]
        });
      });

    // Listen to current user UNfavoriting channel
    usersRef
      .child(userId)
      .child('favorited')
      .on('child_removed', snap => {
        const { favoritedChannels } = this.state;
        // Create object with the data for the favorited channel to remove
        const channelToRemove = { id: snap.key, ...snap.val() };

        // Loop through favorite channels and filter out the channel to remove
        const filteredChannels = favoritedChannels.filter(channel => {
          return channel.id !== channelToRemove.id;
        });

        // Update state new array that filtered out removed channel
        this.setState({
          favoritedChannels: filteredChannels
        });
      });
  };

  removeListeners = () => {
    // Stop listening to firebase changes to users ref
    this.state.usersRef.off();
  };

  selectChannel = channel => {
    // Set active state
    this.setActiveChannel(channel);

    // Add selected channel to redux store
    this.props.setCurrentChannel(channel);

    // Set private channel to false in redux
    this.props.setPrivateChannel(false);
  };

  setActiveChannel = channel => {
    this.setState({ activeChannel: channel.id });
  };

  renderFavoritedChannels = favoritedChannels => {
    if (favoritedChannels.length > 0) {
      return favoritedChannels.map(channel => {
        return (
          <Menu.Item
            key={channel.id}
            name={channel.name}
            active={channel.id === this.state.activeChannel}
            style={{ opacity: 0.6 }}
            onClick={() => this.selectChannel(channel)}
          >
            <span>
              <Icon name="slack hash" />
            </span>
            {channel.name}
          </Menu.Item>
        );
      });
    }
  };

  render() {
    const { favoritedChannels } = this.state;

    return (
      <Menu.Menu>
        <Menu.Item>
          <span>
            <Icon name="star" /> Favorites
          </span>
          ({favoritedChannels.length})
        </Menu.Item>

        {this.renderFavoritedChannels(favoritedChannels)}
      </Menu.Menu>
    );
  }
}

export default connect(
  null,
  { setCurrentChannel, setPrivateChannel }
)(Favorites);
