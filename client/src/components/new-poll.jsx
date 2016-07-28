import React from 'react';
import autobind from 'autobind-decorator';

import store, { createPoll } from '../store';

const placeholders = [
  'We should give cats tiny cars so they can drive themselves around',
  'I reckon this is a dumb idea',
  'Who cares, let\'s go surfing',
  'All in favour raise their hand',
];

const getInitialState = () => ({
  hidden: true,
  placeholder: placeholders[Math.floor(Math.random())],
});

@autobind
export default class Component extends React.Component {
  constructor() {
    super();
    this.state = getInitialState();
  }

  setHiddenFalse() {
    this.setState({
      hidden: false,
    });
  }

  setHiddenTrue() {
    this.setState({
      hidden: true,
    });
  }

  submitHandler(evt) {
    evt.preventDefault();

    if (!this.refs.title.value) return false;

    store.dispatch(createPoll({
      title: this.refs.title.value,
      hidden: this.state.hidden,
    }));

    // reset
    this.setState(getInitialState());
    this.refs.title.value = '';

    return true;
  }

  render() {
    const { placeholder, hidden, title } = this.state;

    return (
      <form id="new-vote" onSubmit={this.submitHandler}>
        <input className="new-vote--title" ref="title" placeholder={placeholder} />

        <div className="new-vote--hidden">
          <div onClick={this.setHiddenTrue} className={hidden ? 'selected' : ''}>
            Only people who know the URL can see this vote
          </div>
          <div onClick={this.setHiddenFalse} className={hidden ? '' : 'selected'}>
            Anyone can see this vote
          </div>
        </div>
        <div onClick={this.submitHandler} className="new-vote--submit">LET'S VOTE</div>

      </form>
    );
  }
}
