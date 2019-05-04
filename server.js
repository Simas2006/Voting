var express = require("express");
var app = express();
var server = require("http").createServer(app);
var io = require("socket.io")(server);
var PORT = process.argv[2] || 8000;

var voterRoom = io.of("/voter");
var adminRoom = io.of("/admin");
var currentPoll = null;
var totalVoters = 0;

app.use("/public",express.static(__dirname + "/public"));

voterRoom.on("connection",function(socket) {
  totalVoters++;
  adminRoom.emit("update-total",totalVoters);
  if ( currentPoll ) {
    socket.emit("poll-post",{
      "question": currentPoll.question,
      "choices": currentPoll.choices
    });
  }
  socket.on("vote",function(choice) {
    if ( ! choice instanceof Number ) return;
    currentPoll.votes[choice]++;
    socket.emit("single-lock");
    console.log(currentPoll.votes,choice);
    adminRoom.emit("recalculate-votes",currentPoll);
  });
  socket.on("disconnect",function() {
    totalVoters--;
    adminRoom.emit("update-total",totalVoters);
  })
});

adminRoom.on("connection",function(socket) {
  if ( currentPoll ) {
    socket.emit("poll-post",{
      "question": currentPoll.question,
      "choices": currentPoll.choices,
      "votes": currentPoll.votes,
      "setTotalCount": totalVoters
    });
  }
  socket.on("poll-post",function(obj) {
    currentPoll = obj;
    currentPoll.votes = obj.choices.map(item => 0);
    voterRoom.emit("poll-post",{
      "question": currentPoll.question,
      "choices": currentPoll.choices
    });
    adminRoom.emit("poll-post",currentPoll);
  });
  socket.on("release-votes",function() {
    voterRoom.emit("release-votes",{
      "choices": currentPoll.choices,
      "votes": currentPoll.votes
    });
  });
  socket.on("clear-poll",function() {
    currentPoll = null;
    voterRoom.emit("clear-poll");
  })
});

server.listen(PORT,function() {
  console.log(`Listening on port ${PORT}`);
});
