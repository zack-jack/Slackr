import React from 'react';
import { Loader, Dimmer } from 'semantic-ui-react';

const MessagesSpinner = () => (
  <Dimmer active inverted>
    <Loader size="huge" content={'Loading Messages...'} />
  </Dimmer>
);

export default MessagesSpinner;
