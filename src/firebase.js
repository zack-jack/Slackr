import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';
import 'firebase/storage';

// Initialize Firebase
const config = {
  apiKey: 'AIzaSyA3KCNQUKfsl-NJsLk7VT9kLUkpnBaV7T0',
  authDomain: 'slackr-f6e92.firebaseapp.com',
  databaseURL: 'https://slackr-f6e92.firebaseio.com',
  projectId: 'slackr-f6e92',
  storageBucket: 'slackr-f6e92.appspot.com',
  messagingSenderId: '700775276850'
};

firebase.initializeApp(config);

export default firebase;
