var express = require("express");
var app = express();
var server = require("http").createServer(app);
var io = require("socket.io")(server);
var PORT = process.argv[2] || 8000;

var voterRoom = io.of("/voter");
var adminRoom = io.of("/admin");
var currentPoll = null;

app.use("/public",express.static(__dirname + "/public"));

voterRoom.on("connection",function(socket) {
  socket.on("vote",function(choice) {
    if ( ! choice instanceof Number ) return;
    currentPoll.votes[choice]++;
    socket.emit("single-lock");
    console.log(currentPoll.votes,choice);
    adminRoom.emit("recalculate-votes",currentPoll);
  });
});

adminRoom.on("connection",function(socket) {
  if ( currentPoll ) socket.emit("poll-post",currentPoll);
  socket.on("poll-post",function(obj) {
    currentPoll = obj;
    currentPoll.votes = obj.choices.map(item => 0);
    voterRoom.emit("poll-post",{
      "question": currentPoll.question,
      "choices": currentPoll.choices
    });
    adminRoom.emit("poll-post",currentPoll);
  });
});

server.listen(PORT,function() {
  console.log(`Listening on port ${PORT}`);
});
