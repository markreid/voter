/**
 * store.js
 * redux store, actions, dispatchers and socket listeners
 */

import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';

import socket from './socket';
window.socket = socket; // cheeky, remove.

const EMIT_JOIN_POLL = 'EMIT_JOIN_POLL';
const RECEIVE_JOIN_POLL = 'RECEIVE_JOIN_POLL';
const EMIT_WHOAMI = 'EMIT_WHOAMI';
const RECEIVE_WHOAMI = 'RECEIVE_WHOAMI';
const EMIT_VOTE = 'EMIT_VOTE';
const RECEIVE_POLL_UPDATE = 'RECEIVE_POLL_UPDATE';
const EMIT_CREATE_POLL = 'EMIT_CREATE_POLL';
const RECEIVE_CREATE_POLL = 'RECEIVE_CREATE_POLL';

const initialState = {
  poll: {
  },
  user: {
    fetching: false,
    fetched: false,
    error: false,
    data: null,
  },
};

function reducer(prevState = initialState, action) {
  // shallow-clone the state
  const state = Object.assign({}, prevState);

  switch (action.type) {

    case EMIT_JOIN_POLL:
      // getting a new poll
      if (state.poll.id !== action.payload) {
        state.poll = {
          id: action.payload,
          fetching: true,
        };
      } else {
        state.poll = Object.assign(state.poll, {
          fetching: true,
        });
      }
      return state;

    case RECEIVE_JOIN_POLL:
      document.location.hash = action.payload.id;
      state.poll = action.payload;
      return state;

    case EMIT_WHOAMI:
      state.user = {
        fetching: true,
        fetched: false,
        error: false,
        data: null,
      };
      return state;

    case RECEIVE_WHOAMI:
      if (action.error) {
        state.user = {
          fetching: false,
          fetched: false,
          error: action.error,
          data: null,
        };
      } else {
        state.user = {
          fetching: false,
          fetched: true,
          error: false,
          data: action.payload,
        };
      }
      return state;

    case RECEIVE_POLL_UPDATE:
      // todo - check that it's the same as the poll we're currently watching!
      state.poll = Object.assign({}, state.poll, action.payload);
      return state;

    case EMIT_CREATE_POLL:
      return state;

    case RECEIVE_CREATE_POLL:
      state.poll = action.payload;
      document.location.hash = action.payload.id;
      return state;

    default:
      return prevState;
  }
}

// emit and receive a joinPoll
export function joinPoll(pollId) {
  return (dispatch => {
    dispatch({
      type: EMIT_JOIN_POLL,
      payload: pollId,
    });
    socket.emit('joinPoll', pollId)
    .then(payload => {
      dispatch({
        type: RECEIVE_JOIN_POLL,
        payload,
      });
    })
    .catch(error => {
      dispatch({
        type: RECEIVE_JOIN_POLL,
        error,
      });
    });
  });
}

// emit and receive a whoami
export function whoami() {
  return (dispatch => {
    dispatch({
      type: EMIT_WHOAMI,
    });
    socket.emit('whoami')
    .then(payload => {
      dispatch({
        type: RECEIVE_WHOAMI,
        payload,
      });
    })
    .catch(error => {
      dispatch({
        type: RECEIVE_WHOAMI,
        error,
      });
    });
  });
}

// emit and receive a vote
export function vote(pollId, value) {
  return (dispatch => {
    socket.emit('vote', {
      pollId,
      value,
    }).then(success => {
      dispatch({
        type: EMIT_VOTE,
      });
    }).catch(error => {
      dispatch({
        type: EMIT_VOTE,
        error,
      });
    });
  });
}

// receive a pollUpdate
function pollUpdate(payload) {
  return (dispatch => {
    dispatch({
      type: RECEIVE_POLL_UPDATE,
      payload,
    });
  });
}

// emit and receive a createPoll
export function createPoll(topic) {
  return (dispatch => {
    dispatch({
      type: EMIT_CREATE_POLL,
      payload: topic,
    });
    socket.emit('createPoll', topic)
    .then(payload => {
      dispatch({
        type: RECEIVE_CREATE_POLL,
        payload,
      });
    }).catch(error => {
      dispatch({
        type: RECEIVE_CREATE_POLL,
        error,
      });
    });
  });
}


const middleware = applyMiddleware(thunk);
const devTools = window.devToolsExtension ? window.devToolsExtension() : f => f;
const storeCreator = compose(middleware, devTools)(createStore);

const store = storeCreator(reducer, initialState);

// socket listeners
socket.on('pollUpdate', (payload) => store.dispatch(pollUpdate(payload)));

export default store;
