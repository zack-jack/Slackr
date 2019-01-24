import React, { Component } from 'react';
import { Modal, Input, Button, Icon, Label } from 'semantic-ui-react';

class MediaModal extends Component {
  state = {
    file: null,
    errors: []
  };

  validateFileType = file => {
    let error;

    // Check that file type is correct
    if (
      file.type === 'image/jpg' ||
      file.type === 'image/jpeg' ||
      file.type === 'image/png'
    ) {
      return true;
    } else {
      // Set error message
      error = { message: 'Invalid file type' };

      // Update state errors array
      this.setState({ errors: [...this.state.errors, error] });

      return false;
    }
  };

  addFile = e => {
    const file = e.target.files[0];

    // Check that the file type is correct
    if (this.validateFileType(file)) {
      this.setState({ file });
    }
  };

  sendFile = () => {
    let error;
    const { file } = this.state;
    const { uploadFile, closeModal } = this.props;

    if (file === null) {
      error = { message: 'Please choose an image file' };

      this.setState({ errors: [...this.state.errors, error] });
    }

    if (file !== null) {
      const metadata = { contentType: file.type };

      // Upload the file to firebase database
      uploadFile(file, metadata);

      closeModal();

      // Remove the file from component state
      this.clearFile();
    }
  };

  clearFile = () => {
    this.setState({ file: null });
  };

  render() {
    const { modalOpen, closeModal } = this.props;
    const { errors } = this.state;

    return (
      <Modal open={modalOpen} onClose={closeModal}>
        <Modal.Header>Select an Image File</Modal.Header>

        <Modal.Content>
          <Label
            content="File type: .jpeg or .png"
            style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}
          />
          <Input
            fluid
            name="file"
            type="file"
            className={errors.length > 0 ? 'error' : ''}
            onChange={this.addFile}
          />
          {errors.length > 0 ? errors.map(error => error.message) : ''}
        </Modal.Content>

        <Modal.Actions>
          <Button color="teal" onClick={this.sendFile}>
            <Icon name="checkmark" /> Send File
          </Button>

          <Button color="red" onClick={closeModal}>
            <Icon name="remove" /> Cancel
          </Button>
        </Modal.Actions>
      </Modal>
    );
  }
}

export default MediaModal;
