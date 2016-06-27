import React from 'react';
import autobind from 'autobind-decorator';

import store from '../store';
import { createPoll } from '../store';

const placeholders = [
  'We should give cats tiny cars so they can drive themselves around',
  'I reckon this is a dumb idea',
  'Who cares, let\'s go surfing',
  'All in favour raise their hand',
];

@autobind
export default class Component extends React.Component {
  render() {

    const placeholder = placeholders[Math.floor(Math.random() * placeholders.length)];

    return (
      <form id="new-vote" onSubmit={this.submitHandler}>
        <button id="js-show-new" type="button">Start a new Vote</button>
        <input id="js-new-topic" ref="topic" placeholder={placeholder} />
      </form>
    );
  }

  submitHandler(evt) {
    evt.preventDefault();
    store.dispatch(createPoll(this.refs.topic.value));
  }
}
