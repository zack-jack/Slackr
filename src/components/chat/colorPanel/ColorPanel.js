import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  Sidebar,
  Menu,
  Divider,
  Button,
  Modal,
  Segment,
  Icon,
  Label,
  Confirm
} from 'semantic-ui-react';
import { CirclePicker } from 'react-color';

import firebase from '../../../firebase/firebase';
import { setColors } from '../../../actions/colors';

class ColorPanel extends Component {
  state = {
    isModalOpen: false,
    isAlertOpen: false,
    primaryColor: '',
    secondaryColor: '',
    user: this.props.currentUser,
    userColors: [
      {
        primaryColor: '#4c3c4c',
        secondaryColor: '#eeeeee'
      }
    ],
    usersRef: firebase.database().ref('users')
  };

  componentDidMount() {
    const { user, userColors } = this.state;

    // Check that user obj is in state
    if (user) {
      // Add listeners on the user
      this.addListeners(user.uid);
    }

    // Initialize firebase with default colors
    this.setDefaultColors();
  }

  addListeners = userId => {
    let userColors = [];
    const { usersRef } = this.state;

    // Listen on the user for colors
    usersRef.child(`${userId}/colors`).on('child_added', snap => {
      // Update colors array with new colors at the beginning
      userColors.unshift(snap.val());

      this.setState({ userColors });
    });
  };

  openModal = () => {
    this.setState({ isModalOpen: true });
  };

  closeModal = () => {
    this.setState({ isModalOpen: false });
  };

  openAlert = () => {
    this.setState({ isAlertOpen: true });
  };

  closeAlert = () => {
    this.setState({ isAlertOpen: false });
  };

  handleChangePrimary = color => {
    this.setState({ primaryColor: color.hex });
  };

  handleChangeSecondary = color => {
    this.setState({ secondaryColor: color.hex });
  };

  setDefaultColors = () => {
    const { userColors } = this.state;
    const primary = userColors[0].primaryColor;
    const secondary = userColors[0].secondaryColor;

    if (primary && secondary) {
      this.setState({ primaryColor: primary, secondaryColor: secondary });

      // Save default colors to firebase
      this.saveColors(primary, secondary);
    }
  };

  handleSaveColors = () => {
    // Check that values exist for both colors
    if (this.state.primaryColor && this.state.secondaryColor) {
      // Save to Firebase
      this.saveColors(this.state.primaryColor, this.state.secondaryColor);
    }
  };

  saveColors = (primary, secondary) => {
    const { user, usersRef } = this.state;

    // Check if the color combination already exists
    usersRef.child(`${user.uid}/colors`).once('value', snap => {
      if (snap.exists()) {
        const colors = snap.val();

        // Converts to an array of objects
        const colorSets = Object.values(colors);

        // Check if any colorSets exist that match the current
        const exists = colorSets.some(colorSet => {
          return (
            colorSet.primary === primary && colorSet.secondary === secondary
          );
        });

        // If the color combination is not already saved in firebase
        if (!exists) {
          // Update firebase database with the colors for the auth user
          usersRef
            .child(`${user.uid}/colors`)
            .push()
            .update({
              primary,
              secondary
            })
            .then(() => {
              this.closeModal();
            })
            .catch(err => {
              console.log(err);
            });
        } else {
          const { userColors } = this.state;
          const i = userColors.length - 1;

          if (
            primary !== userColors[i].primary &&
            secondary !== userColors[i].secondary
          )
            this.openAlert();
        }
      } else {
        // Default case when nothing else exists yet
        // Update firebase database with the colors for the auth user
        usersRef
          .child(`${user.uid}/colors`)
          .push()
          .update({
            primary,
            secondary
          })
          .then(() => {
            this.closeModal();
          })
          .catch(err => {
            console.log(err);
          });
      }
    });
  };

  renderUserColors = colors => {
    // Check that colors exist
    if (colors.length > 0) {
      // Loop through the colors and render them
      return colors.map((color, i) => (
        <div key={i}>
          <Divider />

          <div
            className="color__container"
            onClick={() => this.props.setColors(color.primary, color.secondary)}
          >
            <div
              className="color__square"
              style={{ background: color.primary }}
            >
              <div
                className="color__overlay"
                style={{ background: color.secondary }}
              />
            </div>
          </div>
        </div>
      ));
    }
  };

  render() {
    const {
      isModalOpen,
      primaryColor,
      secondaryColor,
      userColors
    } = this.state;

    return (
      <Sidebar
        as={Menu}
        icon="labeled"
        inverted
        vertical
        visible
        width="very thin"
        style={{ background: '#211a21' }}
        className="color-panel"
      >
        <Button icon="add" size="small" color="teal" onClick={this.openModal} />
        {this.renderUserColors(userColors)}
        <Modal open={isModalOpen} onClose={this.closeModal}>
          <Modal.Header>Choose App Color Theme</Modal.Header>

          <Modal.Content>
            <Segment>
              <Label content="Primary Color" style={{ marginBottom: '1rem' }} />
              <CirclePicker
                color={primaryColor}
                onChange={this.handleChangePrimary}
              />
            </Segment>

            <Segment>
              <Label
                content="Secondary Color"
                style={{ marginBottom: '1rem' }}
              />
              <CirclePicker
                color={secondaryColor}
                onChange={this.handleChangeSecondary}
              />
            </Segment>
          </Modal.Content>

          <Modal.Actions>
            <Button color="teal" onClick={this.handleSaveColors}>
              <Icon name="checkmark" /> Save
            </Button>

            <Button color="red" onClick={this.closeModal}>
              <Icon name="remove" /> Cancel
            </Button>
          </Modal.Actions>
        </Modal>

        <Confirm
          content="This color combination has already been saved. Variety is the spice of life, so why not try something new?"
          open={this.state.isAlertOpen}
          onCancel={this.closeAlert}
          onConfirm={this.closeAlert}
        />
      </Sidebar>
    );
  }
}

export default connect(
  null,
  { setColors }
)(ColorPanel);
