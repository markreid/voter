import React from 'react';

export default class Component extends React.Component {
  render() {
    const { fetching, fetched, error, data } = this.props;

    if (!fetched) {
      return null;
    }

    return (
      <div className="login-box">
        { data &&
          <a id="logout" href="/logout">Logout</a>
        }

        { !data &&
          <a href="/auth/google">Login with Google</a>
        }
      </div>
    );
  }
}
