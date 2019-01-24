import React, { Component } from 'react';
import { Menu } from 'semantic-ui-react';

import UserPanel from './UserPanel';
import Favorites from './Favorites';
import Channels from './Channels';
import DirectMessages from './DirectMessages';

class SidePanel extends Component {
  render() {
    const { currentUser, currentChannel, primaryColor } = this.props;

    return (
      <Menu
        size="large"
        inverted
        fixed="left"
        vertical
        style={{ background: primaryColor, fontSize: '1.2rem' }}
        className="side-panel"
      >
        <UserPanel currentUser={currentUser} primaryColor={primaryColor} />
        <Favorites currentUser={currentUser} />
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
