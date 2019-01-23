import React, { Component } from 'react';
import { Segment, Comment, Icon } from 'semantic-ui-react';

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
    messagesLoading: true,
    numUniqueUsers: '',
    progressBar: false
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

      // Sum active users in current channel
      this.countUniqueUsers(loadedMessages);
    });
  };

  isProgressBarVisible = percent => {
    if (percent > 0) {
      this.setState({ progressBar: true });
    }
  };

  countUniqueUsers = messages => {
    const uniqueUsers = messages.reduce((accumulator, message) => {
      // If the message owner (user) isn't already in the accumulator
      // then add it to the accumulator
      if (!accumulator.includes(message.user.name)) {
        accumulator.push(message.user.name);
      }

      return accumulator;
    }, []);

    const plural = uniqueUsers.length > 1 || uniqueUsers.length === 0;

    const numUniqueUsers = `${uniqueUsers.length} user${plural ? 's' : ''}`;

    this.setState({ numUniqueUsers });
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

  displayCurrentChannelName = channel => {
    return channel ? (
      <>
        <Icon name="slack hash" color="black" />
        {channel.name}
      </>
    ) : (
      ''
    );
  };

  render() {
    const {
      messagesRef,
      messages,
      channel,
      user,
      numUniqueUsers,
      progressBar
    } = this.state;

    return (
      <>
        <MessagesHeader
          channelName={this.displayCurrentChannelName(channel)}
          numUniqueUsers={numUniqueUsers}
        />

        <Segment>
          <Comment.Group
            className={progressBar ? 'messages__progress' : 'messages'}
          >
            {this.renderMessages(messages)}
          </Comment.Group>
        </Segment>

        <MessageForm
          messagesRef={messagesRef}
          currentChannel={channel}
          currentUser={user}
          isProgressBarVisible={this.isProgressBarVisible}
        />
      </>
    );
  }
}

export default Messages;
