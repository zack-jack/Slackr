import React, { Component } from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import {
  Grid,
  Header,
  Icon,
  Dropdown,
  Image,
  Modal,
  Input,
  Button
} from 'semantic-ui-react';
import AvatarEditor from 'react-avatar-editor';

import firebase from 'firebase';
import { setUser, clearUser } from '../../../actions/user';

class UserPanel extends Component {
  state = {
    user: this.props.currentUser,
    isModalOpen: false,
    previewImage: '',
    croppedImage: '',
    uploadedCroppedImage: '',
    blob: '',
    metadata: {
      contentType: 'image/jpeg'
    },
    storageRef: firebase.storage().ref(),
    usersRef: firebase.database().ref('users'),
    userRef: firebase.auth().currentUser
  };

  onChange = e => {
    const selectedText = e.target.innerText;

    if (selectedText === 'Sign Out') {
      this.handleSignOut();
    }
  };

  handleSignOut = () => {
    firebase
      .auth()
      .signOut()
      .then(() => {
        this.props.history.push('/');

        this.props.clearUser();
      });
  };

  openModal = () => {
    this.setState({ isModalOpen: true });
  };

  closeModal = () => {
    this.setState({ isModalOpen: false });
  };

  handleChange = e => {
    const file = e.target.files[0];
    const reader = new FileReader();

    if (file) {
      // Load in file as a data url
      reader.readAsDataURL(file);

      // Listen for file
      reader.addEventListener('load', () => {
        this.setState({ previewImage: reader.result });
      });
    }
  };

  handleCropImage = () => {
    // If avatar editor is available
    if (this.avatarEditor) {
      // Take the cropped image from canvas and create blob
      this.avatarEditor.getImageScaledToCanvas().toBlob(blob => {
        // Create object URL from blob
        let imageUrl = URL.createObjectURL(blob);

        // Set component state with the cropped image
        this.setState({
          croppedImage: imageUrl,
          blob
        });
      });
    }
  };

  uploadCroppedImage = () => {
    const { storageRef, userRef, blob, metadata } = this.state;

    // Upload the blob and metadata to firebase ref
    storageRef
      .child(`avatars/users/${userRef.id}`)
      .put(blob, metadata)
      .then(snap => {
        // Get image url from firebase storage
        snap.ref.getDownloadURL().then(downloadURL => {
          // Set component state with download URL
          this.setState({ uploadedCroppedImage: downloadURL }, () =>
            // Update the avatar for the user
            this.changeAvatar()
          );
        });
      });
  };

  changeAvatar = () => {
    const { userRef, usersRef, uploadedCroppedImage } = this.state;

    // Check that uploaded/cropped image is in component state
    if (uploadedCroppedImage) {
      // Update the user profile with the new avatar in Firebase
      userRef
        .updateProfile({
          photoURL: this.state.uploadCroppedImage
        })
        .then(() => {
          console.log('PhotoURL updated');
          this.closeModal();
        })
        .catch(err => {
          console.log(err);
        });

      // Update the users collection in firebase
      usersRef
        .child(userRef.uid)
        .update({ avatar: this.state.uploadedCroppedImage })
        .then(() => {
          // Get the new user data from firebase with updated avatar
          usersRef.child(userRef.uid).once('value', snap => {
            const updatedUser = snap.val();

            // Update user profile in firebase auth
            firebase
              .auth()
              .currentUser.updateProfile({
                photoURL: updatedUser.avatar
              })
              .then(() => {
                // Set updated user data in redux store
                this.props.setUser(updatedUser);

                if (this.state.currentUser !== updatedUser) {
                  // Set updated user data in component state
                  this.setState({ user: this.props.currentUser });
                }
              })
              .catch(err => {
                console.log(err);
              });
          });
        })
        .catch(err => {
          console.log(err);
        });
    }
  };

  render() {
    const { isModalOpen, previewImage, croppedImage } = this.state;
    const { primaryColor } = this.props;

    const trigger = (
      <span>
        <Image src={this.state.user.photoURL} spaced="right" avatar />
        {this.state.user.displayName}
      </span>
    );

    const options = [
      {
        key: 'user',
        text: (
          <span>
            Signed in as <strong>{this.state.user.displayName}</strong>
          </span>
        ),
        disabled: true
      },
      {
        key: 'changeAvatar',
        text: <span onClick={this.openModal}>Change Avatar</span>
      },
      {
        key: 'signOut',
        text: 'Sign Out'
      }
    ];

    return (
      <Grid style={{ background: primaryColor }} className="user-panel">
        <Grid.Column>
          <Grid.Row
            style={{ padding: '1rem 0 1rem 1rem', margin: 0 }}
            className="user-panel__heading"
          >
            <Header inverted as="h2" style={{ marginBottom: '2rem' }}>
              <Icon name="slack hash" />
              <Header.Content>Slackr</Header.Content>
            </Header>

            <Header inverted as="h4" style={{ padding: '0.2rem' }}>
              <Dropdown
                trigger={trigger}
                options={options}
                onChange={this.onChange}
                className="user-panel__dropdown"
              />
            </Header>
          </Grid.Row>

          <Modal open={isModalOpen} onClose={this.closeModal}>
            <Modal.Header>Change Avatar</Modal.Header>
            <Modal.Content>
              <Input
                fluid
                type="file"
                label="New Avatar"
                name="previewImage"
                onChange={this.handleChange}
              />

              <Grid centered stackable columns={2}>
                <Grid.Row centered>
                  <Grid.Column className="ui center aligned grid">
                    {previewImage && (
                      <AvatarEditor
                        ref={node => (this.avatarEditor = node)}
                        image={previewImage}
                        width={120}
                        height={120}
                        border={50}
                        scale={1.2}
                      />
                    )}
                  </Grid.Column>

                  <Grid.Column>
                    {croppedImage && (
                      <Image
                        style={{ margin: '3.5rem auto' }}
                        width={100}
                        height={100}
                        src={croppedImage}
                      />
                    )}
                  </Grid.Column>
                </Grid.Row>
              </Grid>
            </Modal.Content>

            <Modal.Actions>
              {croppedImage && (
                <Button color="teal" onClick={this.uploadCroppedImage}>
                  <Icon name="save" /> Change Avatar
                </Button>
              )}

              <Button onClick={this.handleCropImage}>
                <Icon name="image" /> Preview
              </Button>

              <Button color="red" onClick={this.closeModal}>
                <Icon name="remove" /> Cancel
              </Button>
            </Modal.Actions>
          </Modal>
        </Grid.Column>
      </Grid>
    );
  }
}

export default compose(
  connect(
    null,
    { setUser, clearUser }
  ),
  withRouter
)(UserPanel);
