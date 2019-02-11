import React from 'react';
import { connect } from 'react-redux';
import { Grid } from 'semantic-ui-react';

import ColorPanel from './colorPanel/ColorPanel';
import MobilePanel from './mobilePanel/MobilePanel';
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
    <>
      <ColorPanel
        key={currentUser && currentUser.name}
        currentUser={currentUser}
      />
      <MobilePanel primaryColor={primaryColor} />
      <SidePanel
        key={currentUser && currentUser.id}
        currentUser={currentUser}
        currentChannel={currentChannel}
        primaryColor={primaryColor}
        className="side-panel"
      />

      <Grid
        columns="equal"
        className="app"
        style={{
          background: secondaryColor,
          paddingTop: 0
        }}
      >
        <Grid.Column tablet={13} computer={7} className="messages__container">
          <Messages
            key={currentChannel && currentChannel.id}
            currentChannel={currentChannel}
            currentUser={currentUser}
            isPrivateChannel={isPrivateChannel}
          />
        </Grid.Column>

        <Grid.Column computer={4}>
          <MetaPanel
            key={currentChannel && currentChannel.name}
            userMessages={userMessages}
            currentChannel={currentChannel}
            isPrivateChannel={isPrivateChannel}
          />
        </Grid.Column>
      </Grid>
    </>
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
