import React from 'react';
import moment from 'moment';
import { Comment, Image } from 'semantic-ui-react';

// Checks if the current user is the one who sent the message
const isMessageOwner = (message, user) => {
  return message.user.id === user.uid ? 'message__self' : '';
};

const timeFromNow = timestamp => {
  /**  The timestamp from firebase could potentially be off sync by a few seconds
       the subtract method resolves the issue of the client side rendering a 
       future timestamp for a new message
    */
  return moment(timestamp)
    .subtract(5, 's')
    .fromNow();
};

const isImage = message => {
  return message.hasOwnProperty('image') && !message.hasOwnProperty('content');
};

const Message = ({ message, user }) => (
  <Comment>
    <Comment.Avatar src={message.user.avatar} />

    <Comment.Content className={isMessageOwner(message, user)}>
      <Comment.Author as="a">{message.user.name}</Comment.Author>
      <Comment.Metadata>{timeFromNow(message.timestamp)}</Comment.Metadata>

      {isImage(message) ? (
        <Image src={message.image} className="message__image" />
      ) : (
        <Comment.Text>{message.content}</Comment.Text>
      )}
    </Comment.Content>
  </Comment>
);

export default Message;
