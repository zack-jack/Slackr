import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Menu, Icon } from 'semantic-ui-react';

import { setCurrentChannel, setPrivateChannel } from '../../../actions/channel';

class Favorites extends Component {
  state = {
    activeChannel: '',
    favoriteChannels: []
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

  renderFavoriteChannels = favoriteChannels => {
    if (favoriteChannels.length > 0) {
      return favoriteChannels.map(channel => {
        return (
          <Menu.Item
            key={channel.id}
            name={channel.name}
            active={channel.id === this.state.activeChannel}
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
    const { favoriteChannels } = this.state;

    return (
      <Menu.Menu>
        <Menu.Item>
          <span>
            <Icon name="star" /> Favorites
          </span>
          ({favoriteChannels.length})
        </Menu.Item>

        {this.renderFavoriteChannels(favoriteChannels)}
      </Menu.Menu>
    );
  }
}

export default connect(
  null,
  setCurrentChannel,
  setPrivateChannel
)(Favorites);
