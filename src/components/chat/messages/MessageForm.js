import React, { Component } from 'react';
import uuidv4 from 'uuid/v4';
import { Segment, Form, Input, Button } from 'semantic-ui-react';

import firebase from '../../../firebase/firebase';

import MediaModal from './MediaModal';
import ProgressBar from './ProgressBar';

class MessageForm extends Component {
  state = {
    message: '',
    channel: this.props.currentChannel,
    user: this.props.currentUser,
    isSending: false,
    modalOpen: false,
    uploadState: '',
    uploadTask: null,
    percentUploaded: 0,
    storageRef: firebase.storage().ref(),
    errors: []
  };

  openModal = () => {
    this.setState({ modalOpen: true });
  };

  closeModal = () => {
    this.setState({ modalOpen: false });
  };

  handleChange = e => {
    const { name, value } = e.target;
    this.setState({ [name]: value });
  };

  createMessage = (fileUrl = null) => {
    const timestamp = firebase.database.ServerValue.TIMESTAMP;
    const { message, user } = this.state;

    // Populate message properties
    const messageObj = {
      timestamp,
      user: {
        id: user.uid,
        name: user.displayName,
        avatar: user.photoURL
      }
    };

    if (fileUrl !== null) {
      messageObj['image'] = fileUrl;
    } else {
      messageObj['content'] = message;
    }

    return messageObj;
  };

  sendMessage = () => {
    const { getMessagesRef } = this.props;
    const { message, channel } = this.state;
    const ref = getMessagesRef();

    if (message) {
      this.setState({ isSending: true });

      // Set message in firebase ref for this channel
      ref
        .child(channel.id)
        .push()
        .set(this.createMessage())
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

  getFilePath = () => {
    if (this.props.isPrivateChannel) {
      return `chat/private-${this.state.channel.id}`;
    } else {
      return `chat/public`;
    }
  };

  uploadFile = (file, metadata) => {
    const { storageRef } = this.state;
    const pathToUpload = this.state.channel.id;
    const ref = this.props.getMessagesRef();
    const extension = file.type.split('/')[1];
    const filePath = `${this.getFilePath()}/${uuidv4()}.${extension}`;

    this.setState(
      {
        uploadState: 'uploading',
        uploadTask: storageRef.child(filePath).put(file, metadata)
      },
      () => {
        // Calculate upload percentage for progress indication
        this.state.uploadTask.on(
          'state_changed',
          snap => {
            const percentUploaded = Math.round(
              (snap.bytesTransferred / snap.totalBytes) * 100
            );

            // Execute progressbar visible if percent > 0
            this.props.isProgressBarVisible(percentUploaded);

            // Set state with upload progress percentage
            this.setState({ percentUploaded });
          },
          err => {
            console.log(err);

            this.setState({
              errors: [...this.state.errors, err],
              uploadState: 'error',
              uploadTask: null
            });
          },
          () => {
            // get the image URL from firebase to send message
            this.state.uploadTask.snapshot.ref
              .getDownloadURL()
              .then(downloadURL => {
                this.sendFile(downloadURL, ref, pathToUpload);
              })
              .catch(err => {
                console.log(err);

                this.setState({
                  errors: [...this.state.errors, err],
                  uploadState: 'error',
                  uploadTask: null
                });
              });
          }
        );
      }
    );
  };

  sendFile = (fileUrl, ref, pathToUpload) => {
    ref
      .child(pathToUpload)
      .push()
      .set(this.createMessage(fileUrl))
      .then(() => {
        this.setState({ uploadState: 'done' });
      })
      .catch(err => {
        console.log(err);

        this.setState({
          errors: [...this.state.errors, err],
          uploadState: 'error',
          uploadTask: null
        });
      });
  };

  render() {
    const {
      errors,
      message,
      isSending,
      modalOpen,
      uploadState,
      percentUploaded
    } = this.state;

    return (
      <Segment>
        <Form onSubmit={this.sendMessage}>
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
        </Form>

        <Button.Group icon widths={2}>
          <Button
            disabled={uploadState === 'uploading'}
            content="Upload Media"
            labelPosition="right"
            icon="image outline"
            onClick={this.openModal}
          />

          <Button
            color="teal"
            disabled={isSending}
            content="Send Message"
            labelPosition="right"
            icon="edit"
            onClick={this.sendMessage}
          />
        </Button.Group>

        <MediaModal
          modalOpen={modalOpen}
          closeModal={this.closeModal}
          uploadFile={this.uploadFile}
        />

        <ProgressBar
          uploadState={uploadState}
          percentUploaded={percentUploaded}
        />
      </Segment>
    );
  }
}

export default MessageForm;
