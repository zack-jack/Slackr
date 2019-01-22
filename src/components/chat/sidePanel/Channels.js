import React, { Component } from 'react';
import { connect } from 'react-redux';
import firebase from '../../../firebase/firebase';
import { Menu, Icon, Modal, Form, Input, Button } from 'semantic-ui-react';

import { setCurrentChannel } from '../../../actions/channel';

class Channels extends Component {
  state = {
    user: this.props.currentUser,
    activeChannel: '',
    channels: [],
    channelName: '',
    channelDetails: '',
    channelsRef: firebase.database().ref('channels'),
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
    });
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
    }

    this.setState({ initialLoad: false });
  };

  displayChannels = channels => {
    // If channels array is not empty, map each channel
    channels.length > 0 &&
      channels.map(channel => (
        <Menu.Item
          key={channel.id}
          name={channel.name}
          active={channel.id === this.state.activeChannel}
          onClick={() => this.selectChannel()}
        >
          <Icon name="slack hash" />
          {channel.name}
        </Menu.Item>
      ));
  };

  selectChannel = channel => {
    // Set active state
    this.setActiveChannel(channel);

    // Add selected channel to redux store
    this.props.setCurrentChannel(channel);
  };

  setActiveChannel = channel => {
    this.setState({ activeChannel: channel.id });
  };

  render() {
    const { channels, modalOpen } = this.state;

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

          {this.displayChannels(this.state.channels)}
        </Menu.Menu>

        <Modal basic open={modalOpen} onClose={this.closeModal}>
          <Modal.Header>Add a channel</Modal.Header>

          <Modal.Content>
            <Form onSubmit={this.handleSubmit}>
              <Form.Field>
                <Input fluid label="Channel Name" name="channelName" />
              </Form.Field>

              <Form.Field>
                <Input fluid label="About the Channel" name="channelDetails" />
              </Form.Field>
            </Form>
          </Modal.Content>

          <Modal.Actions>
            <Button color="teal" inverted onClick={this.handleSubmit}>
              <Icon name="checkmark" /> Add
            </Button>

            <Button color="red" inverted onClick={this.closeModal}>
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
  { setCurrentChannel }
)(Channels);
