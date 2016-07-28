import React from 'react';
import autobind from 'autobind-decorator';
import bcrypt from 'bcryptjs';
window.bcrypt = bcrypt;

import store, { vote, reset, destroy } from '../store';

@autobind
export default class Component extends React.Component {
  static propTypes() {
    return {
      id: React.PropTypes.string,
      user: React.PropTypes.object,
      title: React.PropTypes.string,
      score: React.PropTypes.number,
      votes: React.PropTypes.number,
      hidden: React.PropTypes.boolean,
      owner: React.PropTypes.string,
      error: React.PropTypes.object,
    };
  }

  voteUp() {
    store.dispatch(vote(this.props.id, 1));
  }

  voteNone() {
    store.dispatch(vote(this.props.id, 0));
  }

  voteDown() {
    store.dispatch(vote(this.props.id, -1));
  }

  reset() {
    store.dispatch(reset(this.props.id));
  }

  destroy() {
    store.dispatch(destroy(this.props.id));
  }

  renderVoteControls() {
    if (this.props.user) {
      return (
        <div>
          <button onClick={this.voteUp}>+1</button>
          <button onClick={this.voteNone}>0</button>
          <button onClick={this.voteDown}>-1</button>
        </div>
      );
    }

    return (
      <div>
        <p>Homes you gotta be logged in to vote.</p>
      </div>
    );
  }

  renderError(error) {
    if (error.message === '404') {
      return this.renderNotFound();
    }

    return (
      <div id="poll">
        {error.message}
      </div>
    );
  }

  renderNotFound() {
    return (
      <div id="poll">
        <p>
          Can't find a vote with that url. It may have been removed.
        </p>
      </div>
    );
  }

  render() {
    const { title, score, votes, hidden, owner, error } = this.props;
    const { user } = this.props;

    // todo - this is expensive, don't do it so often.
    const mine = owner && user && user.data && bcrypt.compareSync(user.data, owner);

    if (error) return this.renderError(error);

    return (
      <div id="poll">
        <h2 id="topic">{title}</h2>
        <h3 id="score">{score}</h3>
        <p><span id="votes">{votes}</span> total votes.</p>
        {hidden ?
          <p>This vote is only visible to people with the URL</p> :
          <p>This vote is visible to everybody.</p>
        }
        {mine &&
          <div className="owner-controls">
            <button onClick={this.reset}>Reset</button>
            <button onClick={this.destroy}>Destroy</button>
          </div>
        }

        {this.renderVoteControls()}
      </div>
    );
  }
}
