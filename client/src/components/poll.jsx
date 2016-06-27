import React from 'react';
import autobind from 'autobind-decorator';

import store from '../store';
import { vote } from '../store';

@autobind
export default class Component extends React.Component {

  voteUp() {
    store.dispatch(vote(this.props.id, 1));
  }

  voteNone() {
    store.dispatch(vote(this.props.id, 0));
  }

  voteDown() {
    store.dispatch(vote(this.props.id, -1));
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

  render() {
    const { title, score, votes, joining } = this.props;
    const { user } = this.props;
    return (
      <div id="poll">
        <h2 id="topic">{ title }</h2>
        <h3 id="score">{ score }</h3>
        <p><span id="votes">{ votes }</span> total votes.</p>

        { this.renderVoteControls() }
      </div>
    );
  }
}
