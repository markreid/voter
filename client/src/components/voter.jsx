// Voter component
// wrapper for the whole thing

import React from 'react';
import { connect } from 'react-redux';

import store from '../store';
import { whoami, joinPoll } from '../store';

import LoginBox from './login-box.jsx';
import Poll from './poll.jsx';
import NewPoll from './new-poll.jsx';
import Spinner from './spinner.jsx';


class Voter extends React.Component {

  componentWillMount() {
    store.dispatch(whoami());
    const pollId = document.location.hash.substr(1);
    if (pollId) {
      store.dispatch(joinPoll(pollId));
    }
  }

  render () {
    const { user, poll } = this.props;
    return (
      <div id="voter">
        <LoginBox {...user} />

        { poll.title && <Poll user={user} {...poll} /> }
        { poll.fetching && <Spinner /> }

        <NewPoll user={user} />
      </div>
    );
  }
}

// just export the whole thing
export default connect(state => ({
  poll: state.poll,
  user: state.user,
}))(Voter);
