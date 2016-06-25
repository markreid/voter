// voter.js
// client application

console.log('Thunderbirds are GO.');


const socket = io();

    const config = {};

    $('#js-new-topic').focus();

    $('#new-vote').addEventListener('submit', (evt) => {
      evt.preventDefault();
      const topic = $('#js-new-topic').value;
      socket.emit('createPoll', topic, (err, vote) => {
        $('#js-new-topic').classList.add('hide');
        render(vote);
        config.id = vote.id;
        document.location.hash = config.id;
      });
    });

    $('#js-vote-up').addEventListener('click', function() {
      socket.emit('vote', {
        pollId: config.id,
        value: 1
      }, (err, success) => {
        if (err) {
          console.error(err);
        }
      });
    });

    $('#js-vote-down').addEventListener('click', () => {
      socket.emit('vote', {
        pollId: config.id,
        value: -1
      }, (err, success) => {
        if (err) {
          console.error(err);
        }
      });
    });

    $('#js-vote-none').addEventListener('click', () => {
      socket.emit('vote', {
        pollId: config.id,
        value: 0
      }, (err, success) => {
        if (err) {
          console.error(err);
        }
      });
    });

    $('#js-show-new').addEventListener('click', () => {
      $('#js-new-topic').classList.remove('hide');
    });

    function boot() {
      if(config.id) {
        socket.emit('leavePoll', config.id, (err, success) => {
          if (err) {
            console.error(err);
          }
        });
      }

      if (document.location.hash) {
        join(document.location.hash.substr(1));
      }

      socket.emit('whoami', (err, data) => {
        if (data) {
          document.body.classList.remove('unauthed');
          document.body.classList.add('authed');
        } else {
          document.body.classList.remove('authed');
          document.body.classList.add('unauthed');
        }
      });
    }

    socket.on('connect', boot);
    window.addEventListener('hashchange', boot)

    socket.on('pollUpdate', render);

    function render(poll) {
      if (poll.id !== config.id ) return false;
      const { title, score, votes } = poll;
      $('#topic').textContent = title;
      $('#score').textContent = score;
      $('#votes').textContent = votes;
      $('#vote').classList.remove('hide');
      document.title = `voter [${score}]`;
    }

    function join(id) {
      socket.emit('joinPoll', id, (err, vote) => {
        if (err) {
          console.log(`bad id ${id}`);
          return false;
        }

        config.id = vote.id;
        render(vote);
        document.location.hash = id;
      })
    }

    function $(selector) {
      return document.querySelector(selector);
    }
