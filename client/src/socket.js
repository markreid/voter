import io from 'socket.io-client';
import bluebird from 'bluebird';

const socket = io(window.location.origin);

socket.emit = bluebird.promisify(socket.emit, {
  context: socket,
});

export default socket;
