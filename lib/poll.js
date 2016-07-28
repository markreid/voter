/**
 * lib/poll.js
 * poll-related stuff.
 * this is where we do all the db meddling.
 */

const db = require('../db');
const log = require('./logger');
const Promise = require('bluebird');
const bcrypt = Promise.promisifyAll(require('bcrypt'));


const BCRYPT_ROUNDS = 6;

// fetch a poll by id, include associated votes
function getPollWithVotes(id) {
  return db.models.Poll.find({
    where: { id },
    include: [db.models.Vote],
  })
  .catch(err => {
    log.error(err);
    throw err;
  });
}

// does a user own a poll?
// returns the poll if true
// throws a 403 if no
function ownsPoll(id, owner) {
  return db.models.Poll.findOne({
    where: {
      id,
    },
  })
  .then(poll => bcrypt.compareAsync(owner, poll.owner)
    .then(result => {
      if (!result) {
        throw new Error(403);
      }
      return poll;
    })
  );
}

// convert a poll db row into an object we can send users
function createPollSummary(pollWithVotes) {
  const { title, id, hidden, owner } = pollWithVotes;
  const score = pollWithVotes.votes.reduce((acc, obj) => acc + obj.value, 0);
  const votes = pollWithVotes.votes.length;

  return {
    title,
    id,
    score,
    votes,
    hidden,
    owner,
  };
}

// get a poll by ID and run it through createPollSummary
function getPollSummary(id) {
  return getPollWithVotes(id)
  .then(poll => {
    if (poll) {
      return createPollSummary(poll);
    }
    return null;
  });
}

// creates a poll in the db
// returns it as a user-friendly summary
function createPoll(props) {
  return Promise.resolve().then(() => {
    const { title, id, hidden } = props;

    return bcrypt.hashAsync(props.owner, BCRYPT_ROUNDS)
      .then(owner => db.models.Poll.create({
        title,
        id,
        hidden,
        owner,
      }));
  })
  .then(poll => {
    log.info(`Created poll "${poll.get('title')}" [${poll.get('id')}]`);
    return getPollSummary(poll.id);
  })
  .catch(err => {
    log.error('Error in polls.createPoll()');
    log.error(err);
    throw err;
  });
}

// destroys a poll
function destroyPoll(id, owner) {
  return ownsPoll(id, owner)
  .then(poll => db.models.Poll.destroy({
    where: {
      id: poll.id,
    },
  }))
  .then(destroyCount => !!destroyCount)
  .catch(err => {
    log.error('Error in polls.destroyPoll()');
    log.error(err);
    throw err;
  });
}

// resets a poll; removes all the votes
function resetPoll(id, owner) {
  return ownsPoll(id, owner)
  .then(poll => {
    // destroy all the votes
    return db.models.Vote.destroy({
      where: {
        pollId: id,
      },
    }).then(destroyCount => createPollSummary(poll));
  }).catch(err => {
    log.error('Error in polls.resetPoll()');
    log.error(err);
    throw err;
  });
}

// vote on a poll.
function vote({ pollId, value, userid }) {
  const owner = userid;

  // find out if the user's already voted
  // on this poll...
  return db.models.Vote.find({
    where: {
      pollId,
      owner,
    },
  })
  .then(data => {
    // they have, change their vote
    if (data) {
      const { id } = data;
      return db.models.Vote.update({
        value,
      }, {
        where: {
          id,
        },
      });
    }
    // they haven't, add a new one
    return db.models.Vote.create({
      pollId,
      value,
      owner,
    });
  });
}

// fetch a list of all public polls in summary form
function getPollSummaries() {
  return db.models.Poll.findAll({
    where: {
      hidden: false,
    },
    include: [db.models.Vote],
  })
  .map(poll => createPollSummary(poll));
}


module.exports = {
  getPollWithVotes,
  createPollSummary,
  getPollSummary,
  getPollSummaries,
  createPoll,
  vote,
  resetPoll,
  destroyPoll,
};
