import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Segment, Comment, Icon } from 'semantic-ui-react';

import firebase from '../../../firebase/firebase';
import { setUserMessages } from '../../../actions/channel';

import MessagesHeader from './MessagesHeader';
import MessageForm from './MessageForm';
import Message from './Message';
import MessagesSpinner from '../../common/MessagesSpinner';
import Typing from './Typing';

class Messages extends Component {
  state = {
    messages: [],
    user: this.props.currentUser,
    channel: this.props.currentChannel,
    isPrivateChannel: this.props.isPrivateChannel,
    privateMessagesRef: firebase.database().ref('privateMessages'),
    messagesRef: firebase.database().ref('messages'),
    usersRef: firebase.database().ref('users'),
    typingRef: firebase.database().ref('typing'),
    connectedRef: firebase.database().ref('.info/connected'),
    typingUsers: [],
    isChannelFavorited: false,
    messagesLoading: true,
    numUniqueUsers: '',
    searchTerm: '',
    searchResults: [],
    searchLoading: false,
    progressBar: false,
    listeners: []
  };

  componentDidMount() {
    const { channel, user, listeners } = this.state;

    // Check that the current channel and current user
    // exist in component state
    if (channel && user) {
      this.removeListeners(listeners);

      // Pass current channel id and current user id to listener functions
      this.addListeners(channel.id, user.uid);
    }
  }

  componentDidUpdate(prevProps, prevState) {
    // Check if end of messages list
    if (this.messagesEnd) {
      this.scrollToBottom();
    }
  }

  componentWillUnmount() {
    // Remove listeners
    this.removeListeners(this.state.listeners);

    // Remove connected ref listener
    this.state.connectedRef.off();
  }

  scrollToBottom = () => {
    this.messagesEnd.scrollIntoView({ behavior: 'smooth' });
  };

  addListeners = (channelId, userId) => {
    this.addMessageListener(channelId);
    this.addTypingListener(channelId);
    this.addUserFavoritesListener(channelId, userId);
  };

  removeListeners = listeners => {
    listeners.forEach(listener => {
      listener.ref.child(listener.id).off(listener.e);
    });
  };

  addListenerToState = (id, ref, e) => {
    // Check if the passed in values match a listener in state
    const i = this.state.listeners.findIndex(listener => {
      return listener.id === id && listener.ref === ref && listener.e === e;
    });

    // If not already in state
    if (i === -1) {
      const newListener = { id, ref, e };

      this.setState({ listeners: [...this.state.listeners, newListener] });
    }
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

      // Total number of messages sent by a user
      this.countUserMessages(loadedMessages);
    });

    this.addListenerToState(channelId, this.state.messagesRef, 'child_added');
  };

  addTypingListener = channelId => {
    let typingUsers = [];

    // Listen to typing ref for user typing added in this channel
    this.state.typingRef.child(channelId).on('child_added', snap => {
      // Exclude current user
      if (snap.key !== this.state.user.uid) {
        const typingUser = {
          id: snap.key,
          name: snap.val()
        };

        // Add user that is typing to typing users array
        typingUsers = [...typingUsers, typingUser];

        // Update typing users in state
        this.setState({ typingUsers });
      }
    });

    this.addListenerToState(channelId, this.state.typingRef, 'child_added');

    // Listen to typing ref for user stopped typing in this channel
    this.state.typingRef.child(channelId).on('child_removed', snap => {
      const i = typingUsers.findIndex(user => user.id === snap.key);

      // Check that user was found
      if (i !== -1) {
        // Filter the typing users to make sure the user does not
        // match the snap
        typingUsers = typingUsers.filter(user => user.id !== snap.key);

        // Update the state to remove the user who is no longer typing
        this.setState({ typingUsers });
      }
    });

    this.addListenerToState(channelId, this.state.typingRef, 'child_removed');

    // Listen for connected
    this.state.connectedRef.on('value', snap => {
      if (snap.val() === true) {
        // Listen for user disconnect
        this.state.typingRef
          .child(channelId)
          .child(this.state.user.uid)
          .onDisconnect()
          .remove(err => {
            if (err !== null) {
              console.log(err);
            }
          });
      }
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

  countUserMessages = messages => {
    const userMessages = messages.reduce((accumulator, message) => {
      // Check if the accumulator already has the message owner's
      // username in it
      if (message.user.name in accumulator) {
        // Increment count for that user
        accumulator[message.user.name].count += 1;
      } else {
        // User does not already exist in accumulator
        // Create object for user in accumulator
        accumulator[message.user.name] = {
          avatar: message.user.avatar,
          count: 1
        };
      }

      return accumulator;
    }, {});

    this.props.setUserMessages(userMessages);
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

  renderCurrentChannelName = channel => {
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

  renderTypingUsers = users => {
    if (users.length > 0) {
      return users.map(user => (
        <div
          key={user.id}
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '0.2rem'
          }}
        >
          <span className="typing__user">{user.name} is typing...</span>{' '}
          <Typing />
        </div>
      ));
    }
  };

  render() {
    const {
      messagesRef,
      messagesLoading,
      channel,
      isPrivateChannel,
      user,
      numUniqueUsers,
      isChannelFavorited,
      searchTerm,
      searchResults,
      searchLoading,
      progressBar,
      typingUsers
    } = this.state;

    return (
      <>
        <MessagesHeader
          channelName={this.renderCurrentChannelName(channel)}
          isPrivateChannel={isPrivateChannel}
          numUniqueUsers={numUniqueUsers}
          handleSearchChange={this.handleSearchChange}
          searchLoading={searchLoading}
          handleFavorite={this.handleFavorite}
          isChannelFavorited={isChannelFavorited}
        />

        <Segment>
          <Comment.Group
            style={{ maxWidth: '100%' }}
            className={progressBar ? 'loading messages' : 'messages'}
          >
            {messagesLoading ? <MessagesSpinner /> : null}
            {searchTerm
              ? this.renderMessages(searchResults)
              : this.renderMessages(this.state.messages)}
            {this.renderTypingUsers(typingUsers)}
            <div ref={node => (this.messagesEnd = node)} />
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

export default connect(
  null,
  { setUserMessages }
)(Messages);
