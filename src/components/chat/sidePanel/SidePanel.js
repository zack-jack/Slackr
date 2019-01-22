import React, { Component } from 'react';
import { Menu } from 'semantic-ui-react';

import UserPanel from './UserPanel';
import Channels from './Channels';

class SidePanel extends Component {
  render() {
    const { currentUser } = this.props;

    return (
      <Menu size="large" inverted fixed="left" vertical>
        <UserPanel currentUser={currentUser} />
        <Channels />
      </Menu>
    );
  }
}

export default SidePanel;
