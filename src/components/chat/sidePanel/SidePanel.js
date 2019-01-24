import React, { Component } from 'react';
import { Menu } from 'semantic-ui-react';

import UserPanel from './UserPanel';
import Favorites from './Favorites';
import Channels from './Channels';
import DirectMessages from './DirectMessages';

class SidePanel extends Component {
  render() {
    const { currentUser, currentChannel } = this.props;

    return (
      <Menu size="large" inverted fixed="left" vertical>
        <UserPanel currentUser={currentUser} />
        <Favorites />
        <Channels currentUser={currentUser} currentChannel={currentChannel} />
        <DirectMessages
          currentUser={currentUser}
          currentChannel={currentChannel}
        />
      </Menu>
    );
  }
}

export default SidePanel;
