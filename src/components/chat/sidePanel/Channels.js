import React, { Component } from 'react';
import { Menu, Icon } from 'semantic-ui-react';

class Channels extends Component {
  state = {
    channels: []
  };

  render() {
    const { channels } = this.state;

    return (
      <Menu.Menu>
        <Menu.Item>
          <span>
            <Icon name="exchange" />
            Channels
          </span>
          ({channels.length}) <Icon name="add" />
        </Menu.Item>
      </Menu.Menu>
    );
  }
}

export default Channels;
