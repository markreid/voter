// voter.js
// client application


import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

import socket from './socket';
import store from './store';
import Voter from './components/voter.jsx';


ReactDOM.render((
  <Provider store={store}>
    <Voter />
  </Provider>
), document.getElementById('container'));
