// Voter component
// wrapper for the whole thing

import React from 'react';
import { connect } from 'react-redux';

import store, { whoami, joinPoll } from '../store';

import LoginBox from './login-box.jsx';
import LoginBoxBig from './login-box-big.jsx';
import Poll from './poll.jsx';
import PollsList from './polls-list.jsx';
import NewPoll from './new-poll.jsx';
import Spinner from './spinner.jsx';


class Voter extends React.Component {
  static propTypes() {
    return {
      user: React.PropTypes.string,
      poll: React.PropTypes.string,
      polls: React.PropTypes.array,
      location: React.PropTypes.object,
    };
  }

  constructor() {
    super();
    this.state = {
      showSidebar: false,
    };

    this.toggleSidebar = this.toggleSidebar.bind(this);
  }

  componentWillMount() {
    store.dispatch(whoami());
    const pollId = document.location.hash.substr(1);
    if (pollId) {
      store.dispatch(joinPoll(pollId));
    }
  }

  toggleSidebar() {
    this.setState({
      showSidebar: !this.state.showSidebar,
    });
  }

  render() {
    const { user, poll, polls } = this.props;
    const wrapperClassName = `sidebar-wrapper ${this.state.showSidebar ? 'show' : ''}`;
    return (
      <div id="voter">
        <header className="header">
          <span onClick={this.toggleSidebar} style={{ cursor:'pointer' }}>See all Votes</span>
          <LoginBox {...user} />
        </header>

        <div className={wrapperClassName}>
          <div className="sidebar">
            <PollsList polls={polls} />
          </div>
          <div className="content">
            {poll.fetched && <Poll user={user} {...poll} />}
            {poll.fetching && <Spinner />}
            {user.data && <NewPoll user={user} />}
          </div>
        </div>

      </div>
    );
  }
}

// just export the whole thing
export default connect(state => ({
  poll: state.poll,
  polls: state.polls,
  user: state.user,
  location: state.location,
}))(Voter);
