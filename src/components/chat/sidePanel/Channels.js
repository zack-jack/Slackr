import React, { Component } from 'react';
import { connect } from 'react-redux';
import firebase from '../../../firebase/firebase';
import {
  Menu,
  Icon,
  Modal,
  Form,
  Input,
  Button,
  Label
} from 'semantic-ui-react';

import { setCurrentChannel, setPrivateChannel } from '../../../actions/channel';

class Channels extends Component {
  state = {
    user: this.props.currentUser,
    activeChannel: '',
    channel: null,
    channels: [],
    channelName: '',
    channelDetails: '',
    channelsRef: firebase.database().ref('channels'),
    messagesRef: firebase.database().ref('messages'),
    notifications: [],
    modalOpen: false,
    initialLoad: true,
    errors: []
  };

  componentDidMount() {
    this.addListeners();
  }

  componentWillUnmount() {
    this.removeListeners();
  }

  openModal = () => {
    this.setState({ modalOpen: true });
  };

  closeModal = () => {
    this.setState({ modalOpen: false });
  };

  isFormValid = ({ channelName, channelDetails }) => {
    let error;

    // Check if either field is empty
    if (!channelName || !channelDetails) {
      error = { message: 'Please fill out all required fields' };
      this.setState({ errors: [...this.state.errors, error] });
    }

    if (channelName && channelDetails) {
      return true;
    }
  };

  handleChange = e => {
    const { name, value } = e.target;

    this.setState({ [name]: value });
  };

  handleSubmit = e => {
    e.preventDefault();

    if (this.isFormValid(this.state)) {
      this.addChannel();
    }
  };

  addListeners = () => {
    let loadedChannels = [];

    // Firebase listens for child added
    // Callback function adds new channel
    this.state.channelsRef.on('child_added', snap => {
      loadedChannels.push(snap.val());

      // Set component state to the updated channels array
      this.setState({ channels: loadedChannels }, () => {
        this.setInitialChannel();
      });

      // Listens for new messages to trigger notification
      this.addNotificationListener(snap.key);
    });
  };

  addNotificationListener = channelId => {
    const { messagesRef, channel, notifications } = this.state;

    // Listen for new messages
    messagesRef.child(channelId).on('value', snap => {
      if (channel) {
        this.handleNotifications(channelId, channel.id, notifications, snap);
      }
    });
  };

  handleNotifications = (channelId, currentChannelId, notifications, snap) => {
    let prevTotal = 0;

    // Find notifications for given channel
    let index = notifications.findIndex(
      notification => notifications.id === channelId
    );

    if (index !== -1) {
      // Exclude changes in current channel id
      if (channelId !== currentChannelId) {
        prevTotal = notifications[index].total;

        // Check if notification count incremented
        if (snap.numChildren() - prevTotal > 0) {
          // Update notifications with the number of new messages
          // for the given channel
          notifications[index].count = snap.numChildren() - prevTotal;
        }
      }
    } else {
      notifications.push({
        id: channelId,
        total: snap.numChildren(),
        prevTotal: snap.numChildren(),
        count: 0
      });
    }

    this.setState({ notifications });
  };

  clearNotifications = () => {
    const { notifications, channel } = this.state;

    let index = notifications.findIndex(
      notification => notification.id === channel.id
    );

    if (index !== -1) {
      // Bring in existing notifications from all other channels
      let updatedNotifications = [...notifications];

      // Change total and count back to reset
      updatedNotifications[index].total = notifications[index].prevTotal;
      updatedNotifications[index].count = 0;

      // Set state with the channel's notifications reset
      this.setState({ notifications: updatedNotifications });
    }
  };

  getNotificationCount = channel => {
    let count = 0;
    const { notifications } = this.state;

    notifications.forEach(notification => {
      if (notification.id === channel.id) {
        count = notification.count;
      }
    });

    if (count > 0) {
      return count;
    }
  };

  removeListeners = () => {
    // Stop listening to firebase changes to channels ref
    this.state.channelsRef.off();
  };

  addChannel = () => {
    const { user, channelName, channelDetails, channelsRef } = this.state;
    const key = channelsRef.push().key;

    // New channel data obj
    const newChannel = {
      id: key,
      name: channelName,
      details: channelDetails,
      createdBy: {
        name: user.displayName,
        avatar: user.photoURL
      }
    };

    // Update firebase database with new channel object
    channelsRef
      .child(key)
      .update(newChannel)
      .then(() => {
        this.setState({ channelName: '', channelDetails: '' });
        this.closeModal();
      })
      .catch(err => {
        let error;
        console.log(err);

        error = { message: err };

        this.setState({ errors: [...this.state.errors, error] });
      });
  };

  setInitialChannel = () => {
    const { channels, initialLoad } = this.state;
    const initialChannel = channels[0];

    // First page load and at least 1 channel exists
    if (initialLoad && channels.length > 0) {
      this.props.setCurrentChannel(initialChannel);
      this.setActiveChannel(initialChannel);
      this.setState({ channel: initialChannel });
    }

    this.setState({ initialLoad: false });
  };

  selectChannel = channel => {
    // Set active state
    this.setActiveChannel(channel);

    // Clear the notifications upon entering the channel
    this.clearNotifications();

    // Add selected channel to redux store
    this.props.setCurrentChannel(channel);

    // Set private channel to false in redux
    this.props.setPrivateChannel(false);

    // Set channel state
    this.setState({ channel });
  };

  setActiveChannel = channel => {
    this.setState({ activeChannel: channel.id });
  };

  renderChannels = channels => {
    // If channels array is not empty, map each channel
    if (channels.length > 0) {
      return channels.map(channel => {
        return (
          <Menu.Item
            key={channel.id}
            name={channel.name}
            active={channel.id === this.state.activeChannel}
            onClick={() => this.selectChannel(channel)}
          >
            {this.getNotificationCount(channel) && (
              <Label color="red">{this.getNotificationCount(channel)}</Label>
            )}
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
    const { channels, channelName, channelDetails, modalOpen } = this.state;

    return (
      <>
        <Menu.Menu>
          <Menu.Item>
            <span>
              <Icon name="exchange" />
              Channels
            </span>
            ({channels.length}) <Icon name="add" onClick={this.openModal} />
          </Menu.Item>

          {this.renderChannels(this.state.channels)}
        </Menu.Menu>

        <Modal open={modalOpen} onClose={this.closeModal}>
          <Modal.Header>Add a channel</Modal.Header>

          <Modal.Content>
            <Form onSubmit={this.handleSubmit}>
              <Form.Field>
                <Input
                  fluid
                  label="Channel Name"
                  name="channelName"
                  value={channelName}
                  onChange={this.handleChange}
                />
              </Form.Field>

              <Form.Field>
                <Input
                  fluid
                  label="About the Channel"
                  name="channelDetails"
                  value={channelDetails}
                  onChange={this.handleChange}
                />
              </Form.Field>
            </Form>
          </Modal.Content>

          <Modal.Actions>
            <Button color="teal" onClick={this.handleSubmit}>
              <Icon name="checkmark" /> Add
            </Button>

            <Button color="red" onClick={this.closeModal}>
              <Icon name="remove" /> Cancel
            </Button>
          </Modal.Actions>
        </Modal>
      </>
    );
  }
}

export default connect(
  null,
  { setCurrentChannel, setPrivateChannel }
)(Channels);
