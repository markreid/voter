/**
 * Voter.
 * Conduct anonymous votes in realtime.
 * Yiewwwww.
 */


const config = require('./config');

const express = require('express');
const session = require('express-session');
const passport = require('passport');
const cookie = require('cookie');
const path = require('path');
const RedisStore = require('connect-redis')(session);
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const log = require('./lib/logger');

const db = require('./db');
const polls = require('./lib/poll');

// instantiate an express app
const app = express();
const redisStore = new RedisStore({
  db: config.REDIS_DB,
  logErrors: log.error,
});

app.use(session({
  secret: config.SESSION_SECRET,
  store: redisStore,
  resave: false,
  saveUninitialized: true,
}));


// provide an http server for our app, and bind socket.io to it
const http = require('http').Server(app);
const io = require('socket.io')(http);


// all we care about is the ID
passport.serializeUser((userObject, done) => {
  done(null, userObject.id);
});

// as above
passport.deserializeUser((userId, done) => {
  done(null, userId);
});


// add passport middleware to app
app.use(passport.initialize());
app.use(passport.session());


// configure passport strategies

// Google OAuth2
passport.use(new GoogleStrategy({
  clientID: config.GOOGLE_CLIENT_ID,
  clientSecret: config.GOOGLE_CLIENT_SECRET,
  callbackURL: config.GOOGLE_AUTH_CALLBACK_URL,
}, (accessToken, refreshToken, googleProfile, callback) => (
    callback(null, {
      id: googleProfile.id,
    })
  )
));

// add the route for signing in via Google
app.get('/auth/google', passport.authenticate('google', {
  scope: ['email'], // request specific scope/permissions from Google
}));

// callback route that Google will redirect to after a successful login
app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    // the user's now successfully authenticated.
    // their user object is now available on each subsequent request:
    res.redirect('/');
  }
);

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});


// serve the app
app.get('/', (req, res) => {
  res.sendFile(`${__dirname}/views/vote.html`);
});

// static files
app.use('/static', express.static(path.join(__dirname, 'client/build')));


// middleware ensures we can get a session from the socket request
io.use((socket, next) => {
  const parsedCookie = cookie.parse(socket.request.headers.cookie);
  const sessionId = parsedCookie['connect.sid'];

  const shortId = sessionId.substr(2, 32);
  redisStore.load(shortId, (err, foundSession) => {
    if (!foundSession) {
      // we don't let a user connect without a session.
      // the client should catch this and ask them to reload.
      return next('No session found in socket request');
    }

    // if they're authenticated, store the userid here for quick access.
    // if they're not, they'll need to authenticate and reconnect their
    // socket before they can create polls and vote.
    if (foundSession.passport && foundSession.passport.user) {
      socket.request.userid = foundSession.passport.user;
    }
    return next();
  });
});


function noop() {}

io.on('connection', (socket) => {
  log.info('socket connected');

  const owner = socket.request.userid;

  // create a new poll
  socket.on('createPoll', ({ title, hidden }, callback = noop) => {
    // must be authenticated
    if (!owner) {
      return callback(403);
    }

    return polls.createPoll({
      title,
      hidden,
      owner,
    }).then(poll => {
      socket.join(poll.id);
      callback(null, poll);
    }).catch(err => {
      log.error(err);
      callback(err);
    });
  });


  // join an existing poll
  socket.on('joinPoll', (id, callback) => {
    log.debug(`joinPoll ${id}`);

    return polls.getPollSummary(id, owner)
    .then(poll => {
      if (!poll) {
        log.debug(`poll ${id} doesn't exist`);
        return callback(404);
      }
      socket.join(id);
      return callback(null, poll);
    }).catch(err => {
      log.error(err);
      return callback(err);
    });
  });


  // leave a poll
  socket.on('leavePoll', (id, callback = noop) => {
    socket.leave(id);
    return callback(null, true);
  });


  // vote. the best part of all.
  socket.on('vote', ({ pollId, value }, callback = noop) => {
    // must be authenticated
    const userid = socket.request.userid;
    if (!userid) {
      return callback(403);
    }

    return polls.vote({
      pollId,
      userid,
      value,
    })
    .then(vote => {
      log.info(`Registered a vote for ${value} on ${pollId}`);
      return callback(null, true);
    })
    .then(() => {
      // the votes have changed, so tell everybody else
      // who's listening what the new scores are.
      polls.getPollSummary(pollId)
      .then(poll => io.to(pollId).emit('pollUpdate', poll));
    })
    .catch(err => {
      log.error(err);
      return callback(err);
    });
  });

  socket.on('reset', (id, callback = noop) => {
    log.info(`reset ${id}`);

    return polls.resetPoll(id, owner)
    .then(response => {
      callback(null, response);
      io.to(id).emit('pollUpdate', response); // tell everybody else
    })
    .catch(err => {
      callback(err);
    });
  });

  socket.on('destroy', (id, callback = noop) => {
    log.info(`destroy ${id}`);

    return polls.destroyPoll(id, owner)
    .then(response => {
      callback(null, response);
      io.to(id).emit('pollDestroyed', id); // tell everybody else
    })
    .catch(err => {
      callback(err);
    });
  });

  // get a list
  socket.on('getPolls', (callback = noop) => {
    polls.getPollSummaries()
    .then(summaries => {
      callback(null, summaries);
    })
    .catch(err => {
      log.error(err);
      callback(err);
    });
  });

  socket.on('whoami', (callback = noop) => {
    callback(null, socket.request.userid);
  });
});


// start the http server
http.listen(config.PORT, () => {
  log.info(`Running on ${config.PORT}`);
});

