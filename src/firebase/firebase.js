import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';
import 'firebase/storage';

// Initialize Firebase
const config = {
  apiKey: 'AIzaSyCu752QU_-sZMImYyV2H-ff8UUoOiAWsv8',
  authDomain: 'slackr-cb2a2.firebaseapp.com',
  databaseURL: 'https://slackr-cb2a2.firebaseio.com',
  projectId: 'slackr-cb2a2',
  storageBucket: 'slackr-cb2a2.appspot.com',
  messagingSenderId: '424072241461'
};

firebase.initializeApp(config);

export default firebase;
