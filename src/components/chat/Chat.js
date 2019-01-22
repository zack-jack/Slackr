import React from 'react';
import { connect } from 'react-redux';
import { Grid } from 'semantic-ui-react';

import ColorPanel from './colorPanel/ColorPanel';
import SidePanel from './sidePanel/SidePanel';
import Messages from './messages/Messages';
import MetaPanel from './metaPanel/MetaPanel';

const Chat = ({ currentUser }) => {
  return (
    <Grid columns="equal" className="app">
      <ColorPanel />
      <SidePanel currentUser={currentUser} />

      <Grid.Column>
        <Messages />
      </Grid.Column>

      <Grid.Column width={4}>
        <MetaPanel />
      </Grid.Column>
    </Grid>
  );
};

const mapStateToProps = state => ({
  currentUser: state.user.currentUser
});

export default connect(mapStateToProps)(Chat);
