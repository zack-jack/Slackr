import React, { Component } from 'react';
import { Segment, Comment } from 'semantic-ui-react';

import firebase from '../../../firebase/firebase';

import MessagesHeader from './MessagesHeader';
import MessageForm from './MessageForm';
import Message from './Message';

class Messages extends Component {
  state = {
    messages: [],
    messagesRef: firebase.database().ref('messages'),
    channel: this.props.currentChannel,
    user: this.props.currentUser,
    messagesLoading: true
  };

  componentDidMount() {
    const { channel, user } = this.state;

    // Check that the current channel and current user
    // exist in component state
    if (channel && user) {
      // Pass current channel id to listener functions
      this.addListeners(channel.id);
    }
  }

  addListeners = channelId => {
    this.addMessageListener(channelId);
  };

  addMessageListener = channelId => {
    let loadedMessages = [];
    const { messagesRef } = this.state;

    // Listen for new messages being added to firebase for this
    // channel id
    messagesRef.child(channelId).on('child_added', snap => {
      // Add new message value to loaded messages
      loadedMessages.push(snap.val());

      // Set loaded messages to component state
      this.setState({
        messages: loadedMessages,
        messagesLoading: false
      });
    });
  };

  renderMessages = messages => {
    const { user } = this.state;

    // Check that at least 1 message exists
    if (messages.length > 0) {
      // Loop through messages and map each message
      return messages.map(message => (
        <Message key={message.timestamp} message={message} user={user} />
      ));
    }
  };

  render() {
    const { messagesRef, messages, channel, user } = this.state;

    return (
      <>
        <MessagesHeader />

        <Segment>
          <Comment.Group>{this.renderMessages(messages)}</Comment.Group>
        </Segment>

        <MessageForm
          messagesRef={messagesRef}
          currentChannel={channel}
          currentUser={user}
        />
      </>
    );
  }
}

export default Messages;
