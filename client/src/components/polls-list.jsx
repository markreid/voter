import React from 'react';
import autobind from 'autobind-decorator';

import store, { fetchPublicPolls } from '../store';

@autobind
export default class Component extends React.Component {
  static propTypes() {
    return {
      polls: React.PropTypes.array.required,
    };
  }

  componentWillMount() {
    this.fetch();
  }

  fetch() {
    store.dispatch(fetchPublicPolls());
  }

  render() {
    const activeId = document.location.hash.substr(1);

    return (
      <div id="polls-list">
        <span onClick={this.fetch} style={{ margin: '0 0 2em', display: 'block' }}>refresh</span>

        {this.props.polls.map(poll => (
          <div
            className={`polls-list-item ${activeId === poll.id && 'active'}`}
            key={poll.id}
          >
            <a href={`/#${poll.id}`}>{poll.title}</a>
          </div>
        ))}
      </div>
    );
  }
}
