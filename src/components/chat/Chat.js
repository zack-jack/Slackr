import React from 'react';
import { connect } from 'react-redux';
import { Grid } from 'semantic-ui-react';

import ColorPanel from './colorPanel/ColorPanel';
import SidePanel from './sidePanel/SidePanel';
import Messages from './messages/Messages';
import MetaPanel from './metaPanel/MetaPanel';

const Chat = ({
  currentUser,
  currentChannel,
  isPrivateChannel,
  userMessages,
  primaryColor,
  secondaryColor
}) => {
  return (
    <Grid
      columns="equal"
      className="app"
      style={{ background: secondaryColor }}
    >
      <Grid.Column width={3}>
        <ColorPanel
          key={currentUser && currentUser.name}
          currentUser={currentUser}
        />
        <SidePanel
          key={currentUser && currentUser.id}
          currentUser={currentUser}
          currentChannel={currentChannel}
          primaryColor={primaryColor}
        />
      </Grid.Column>

      <Grid.Column>
        <Messages
          key={currentChannel && currentChannel.id}
          currentChannel={currentChannel}
          currentUser={currentUser}
          isPrivateChannel={isPrivateChannel}
        />
      </Grid.Column>

      <Grid.Column width={4}>
        <MetaPanel
          key={currentChannel && currentChannel.name}
          userMessages={userMessages}
          currentChannel={currentChannel}
          isPrivateChannel={isPrivateChannel}
        />
      </Grid.Column>
    </Grid>
  );
};

const mapStateToProps = state => ({
  currentUser: state.user.currentUser,
  currentChannel: state.channel.currentChannel,
  isPrivateChannel: state.channel.isPrivateChannel,
  userMessages: state.channel.userMessages,
  primaryColor: state.colors.primaryColor,
  secondaryColor: state.colors.secondaryColor
});

export default connect(mapStateToProps)(Chat);
