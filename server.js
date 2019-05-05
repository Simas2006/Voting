var express = require("express");
var app = express();
var server = require("http").createServer(app);
var io = require("socket.io")(server);
var PORT = process.argv[2] || 8000;

var voterRoom = io.of("/voter");
var adminRoom = io.of("/admin");
var currentPoll = null;
var totalVoters = 0;
var activeUIDs = [];
var lockedUIDs = {};

app.use("/public",express.static(__dirname + "/public"));

function setAll(state) {
  for ( var i = 0; i < activeUIDs.length; i++ ) {
    lockedUIDs[activeUIDs[i]] = state;
  }
}

voterRoom.on("connection",function(socket) {
  var uid;
  socket.on("check-uid",function(paramuid) {
    if ( activeUIDs.indexOf(paramuid) > -1 ) {
      socket.emit("check-uid",false);
      return;
    }
    socket.emit("check-uid",true);
    activeUIDs.push(paramuid);
    lockedUIDs[paramuid] = false;
    uid = paramuid;
    totalVoters++;
    adminRoom.emit("update-total",totalVoters);
    if ( currentPoll ) {
      socket.emit("poll-post",{
        "question": currentPoll.question,
        "choices": currentPoll.choices
      });
    }
  });
  socket.on("vote",function(choice) {
    if ( ! uid || lockedUIDs[uid] ) return;
    lockedUIDs[uid] = true;
    currentPoll.votes[choice]++;
    socket.emit("vote-recorded");
    adminRoom.emit("recalculate-votes",currentPoll);
  });
  socket.on("disconnect",function() {
    if ( ! uid ) return;
    totalVoters--;
    activeUIDs = activeUIDs.filter(item => item != uid);
    delete lockedUIDs[uid];
    console.log(lockedUIDs)
    adminRoom.emit("update-total",totalVoters);
  })
});

adminRoom.on("connection",function(socket) {
  if ( currentPoll ) {
    socket.emit("poll-post",{
      "question": currentPoll.question,
      "choices": currentPoll.choices,
      "votes": currentPoll.votes
    });
  }
  socket.emit("update-total",totalVoters);
  socket.on("poll-post",function(obj) {
    currentPoll = obj;
    currentPoll.votes = obj.choices.map(item => 0);
    setAll(false);
    voterRoom.emit("poll-post",{
      "question": currentPoll.question,
      "choices": currentPoll.choices
    });
    adminRoom.emit("poll-post",currentPoll);
  });
  socket.on("release-votes",function() {
    setAll(true);
    voterRoom.emit("release-votes",{
      "choices": currentPoll.choices,
      "votes": currentPoll.votes
    });
  });
  socket.on("clear-poll",function() {
    currentPoll = null;
    setAll(false);
    voterRoom.emit("clear-poll");
    adminRoom.emit("clear-poll");
  });
});

server.listen(PORT,function() {
  console.log(`Listening on port ${PORT}`);
});
