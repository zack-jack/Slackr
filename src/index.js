import React from 'react';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';

// Semantic UI styles
import 'semantic-ui-css/semantic.min.css';

import App from './App';

import rootReducer from './reducers/index';

const store = createStore(rootReducer, composeWithDevTools());

ReactDOM.render(
  <Provider store={store}>
    <Router>
      <App />
    </Router>
  </Provider>,
  document.getElementById('root')
);
