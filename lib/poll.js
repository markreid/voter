/**
 * lib/poll.js
 * poll-related stuff.
 * this is where we do all the db meddling.
 */

const db = require('../db');
const log = require('./logger');


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

// convert a poll db row into an object we can send users
function createPollSummary(pollWithVotes) {
  const { title, id, public } = pollWithVotes;
  const score = pollWithVotes.votes.reduce((acc, vote) => {
    return acc + vote.value;
  }, 0);
  const votes = pollWithVotes.votes.length;

  return {
    title,
    id,
    score,
    votes,
    public,
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
  return db.models.Poll.create(props)
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
  .then(vote => {
    // they have, change their vote
    if (vote) {
      const { id } = vote;
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

// fetch a list of all the polls in summary form
function getPollSummaries() {
  return db.models.Poll.findAll({
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
};
