import React, { Component } from 'react';
import { Menu, Icon, Modal, Form, Input, Button } from 'semantic-ui-react';

class Channels extends Component {
  state = {
    channels: [],
    channelName: '',
    channelDetails: '',
    modalOpen: false
  };

  openModal = () => {
    this.setState({ modalOpen: true });
  };

  closeModal = () => {
    this.setState({ modalOpen: false });
  };

  handleChange = e => {
    const { name, value } = e.target;
    console.log(e.target, name, value);

    this.setState({ [name]: value });
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
        </Menu.Menu>

        <Modal basic open={modalOpen} onClose={this.closeModal}>
          <Modal.Header>Add a channel</Modal.Header>

          <Modal.Content>
            <Form>
              <Form.Field>
                <Input fluid label="Channel Name" name="channelName" />
              </Form.Field>

              <Form.Field>
                <Input fluid label="About the Channel" name="channelDetails" />
              </Form.Field>
            </Form>
          </Modal.Content>

          <Modal.Actions>
            <Button color="teal" inverted>
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

export default Channels;
