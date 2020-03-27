import socketio from "socket.io-client";

const socket = socketio("http://192.168.0.105:3333", {
  autoConnect: false
});

function subscribeToNewDevs(subscribeFunction) {
  socket.on("new-dev", subscribeFunction);
}

function connect(latitude, longitude, techs) {
  // sending to the server
  socket.io.opts.query = {
    latitude,
    longitude,
    techs
  };

  socket.connect();
}

function disconnect() {
  if (socket.disconnect) {
    socket.disconnect();
  }
}

export { connect, disconnect, subscribeToNewDevs };
