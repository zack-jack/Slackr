import React, { Component } from 'react';
import { Segment, Button, Input, Divider } from 'semantic-ui-react';

import firebase from '../../../firebase/firebase';

class MessageForm extends Component {
  state = {
    message: '',
    channel: this.props.currentChannel,
    user: this.props.currentUser,
    isSending: false,
    errors: []
  };

  handleChange = e => {
    const { name, value } = e.target;
    this.setState({ [name]: value });
  };

  createMessage = () => {
    const timestamp = firebase.database.ServerValue.TIMESTAMP;
    const { message, user } = this.state;

    // Populate message properties
    const messageObj = {
      timestamp,
      user: {
        id: user.uid,
        name: user.displayName,
        avatar: user.photoURL
      },
      content: message
    };

    return messageObj;
  };

  sendMessage = () => {
    const { messagesRef } = this.props;
    const { message, channel } = this.state;

    if (message) {
      this.setState({ isSending: true });

      // Set message in firebase ref for this channel
      messagesRef
        .child(channel.id)
        .push()
        .set(this.createMessage)
        .then(() => {
          // Reset component state after it's sent to firebase
          this.setState({ isSending: false, message: '', errors: [] });
        })
        .catch(err => {
          let error;
          let errors = [];
          console.log(err);

          error = { message: err };
          errors = [...this.state.errors, error];

          this.setState({ isSending: false, errors });
        });
    } else {
      let error;
      let errors = [];

      // Set error message
      error = { message: 'Add a message' };
      errors = [...this.state.errors, error];

      // Set error state
      this.setState({
        errors
      });
    }
  };

  render() {
    const { errors, message, isSending } = this.state;

    return (
      <Segment>
        <Input
          fluid
          name="message"
          label={<Button icon="add" />}
          labelPosition="left"
          placeholder="Message..."
          className={
            errors.some(error => error.message.includes('message'))
              ? 'error'
              : ''
          }
          value={message}
          onChange={this.handleChange}
        />

        <Button.Group icon widths="2">
          <Button
            color="orange"
            disabled={isSending}
            content="Send Message"
            labelPosition="left"
            icon="edit"
            onClick={this.sendMessage}
          />

          <Button
            color="teal"
            content="Upload Media"
            labelPosition="right"
            icon="image outline"
          />
        </Button.Group>
      </Segment>
    );
  }
}

export default MessageForm;
