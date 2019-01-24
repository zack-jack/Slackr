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
    isPrivateChannel: this.props.isPrivateChannel,
    privateMessagesRef: firebase.database().ref('privateMessages'),
    user: this.props.currentUser,
    usersRef: firebase.database().ref('users'),
    isChannelFavorited: false,
    messagesLoading: true,
    numUniqueUsers: '',
    searchTerm: '',
    searchResults: [],
    searchLoading: false,
    progressBar: false
  };

  componentDidMount() {
    const { channel, user } = this.state;

    // Check that the current channel and current user
    // exist in component state
    if (channel && user) {
      // Pass current channel id and current user id to listener functions
      this.addListeners(channel.id, user.uid);
    }
  }

  componentWillUnmount() {
    // Remove listeners
    this.removeListeners();
  }

  addListeners = (channelId, userId) => {
    this.addMessageListener(channelId);
    this.addUserFavoritesListener(channelId, userId);
  };

  addMessageListener = channelId => {
    let loadedMessages = [];
    const ref = this.getMessagesRef();

    // Listen for new messages being added to firebase for this
    // channel id
    ref.child(channelId).on('child_added', snap => {
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

  addUserFavoritesListener = (channelId, userId) => {
    const { usersRef } = this.state;

    usersRef
      .child(userId)
      .child('favorited')
      .once('value')
      .then(data => {
        if (data.val() !== null) {
          // Grab channel keys
          const channelIds = Object.keys(data.val());

          // Find the channel id in favorites
          const prevFavorited = channelIds.includes(channelId);

          // Set favorited state
          this.setState({ isChannelFavorited: prevFavorited });
        }
      });
  };

  removeListeners = () => {
    // Stop listening to firebase changes to messages ref
    this.state.messagesRef.off();
    this.state.privateMessagesRef.off();
  };

  getMessagesRef = () => {
    const { messagesRef, privateMessagesRef, isPrivateChannel } = this.state;

    return isPrivateChannel ? privateMessagesRef : messagesRef;
  };

  handleFavorite = () => {
    // Toggle channel favorited state
    this.setState(
      prevState => ({
        isChannelFavorited: !prevState.isChannelFavorited
      }),
      () => {
        this.favoriteChannel();
      }
    );
  };

  favoriteChannel = () => {
    const { isChannelFavorited, channel, user, usersRef } = this.state;

    if (isChannelFavorited) {
      // Update firebase user with favorited channel object
      usersRef.child(`${user.uid}/favorited`).update({
        // Populate the favorite channel object
        [channel.id]: {
          name: channel.name,
          details: channel.details,
          createdBy: {
            name: channel.createdBy.name,
            avatar: channel.createdBy.avatar
          }
        }
      });
    } else {
      // Update firebase user to remove favorited channel from database
      usersRef
        .child(`${user.uid}/favorited`)
        .child(channel.id)
        .remove(err => {
          if (err !== null) {
            console.log(err);
          }
        });
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

  handleSearchChange = e => {
    this.setState(
      {
        searchTerm: e.target.value,
        searchLoading: true
      },
      () => {
        // Filter through messages array with search term
        this.handleSearchMessages();
      }
    );
  };

  handleSearchMessages = () => {
    const { messages, searchTerm } = this.state;
    const channelMessages = [...messages];
    const regex = new RegExp(searchTerm, 'gi');

    // Loop through messages for the channel and compare search terms
    const searchResults = channelMessages.reduce((accumulator, message) => {
      // Check that message is text not image
      // Match message content against regex
      if (
        (message.content && message.content.match(regex)) ||
        message.user.name.match(regex)
      ) {
        // Message matches searchterm
        // Add message to accumulator
        accumulator.push(message);
      }

      return accumulator;
    }, []);

    this.setState({ searchResults });
    setTimeout(() => this.setState({ searchLoading: false }), 1000);
  };

  isProgressBarVisible = percent => {
    if (percent > 0) {
      this.setState({ progressBar: true });
    }
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
    if (channel) {
      const { isPrivateChannel } = this.state;

      if (isPrivateChannel) {
        return (
          <>
            <Icon name="at" color="black" />
            {channel.name}
          </>
        );
      } else {
        return (
          <>
            <Icon name="slack hash" color="black" />
            {channel.name}
          </>
        );
      }
    } else {
      return '';
    }
  };

  render() {
    const {
      messagesRef,
      messages,
      channel,
      isPrivateChannel,
      user,
      numUniqueUsers,
      isChannelFavorited,
      searchTerm,
      searchResults,
      searchLoading,
      progressBar
    } = this.state;

    return (
      <>
        <MessagesHeader
          channelName={this.displayCurrentChannelName(channel)}
          isPrivateChannel={isPrivateChannel}
          numUniqueUsers={numUniqueUsers}
          handleSearchChange={this.handleSearchChange}
          searchLoading={searchLoading}
          handleFavorite={this.handleFavorite}
          isChannelFavorited={isChannelFavorited}
        />

        <Segment>
          <Comment.Group
            className={progressBar ? 'messages__progress' : 'messages'}
          >
            {searchTerm
              ? this.renderMessages(searchResults)
              : this.renderMessages(messages)}
          </Comment.Group>
        </Segment>

        <MessageForm
          messagesRef={messagesRef}
          getMessagesRef={this.getMessagesRef}
          currentChannel={channel}
          isPrivateChannel={isPrivateChannel}
          currentUser={user}
          isProgressBarVisible={this.isProgressBarVisible}
        />
      </>
    );
  }
}

export default Messages;
