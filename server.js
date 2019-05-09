var express = require("express");
var app = express();
var server = require("http").createServer(app);
var io = require("socket.io")(server);
var PORT = process.argv[2] || 8000;

var voterRoom = io.of("/voter");
var adminRoom = io.of("/admin");
var currentPoll = null;
var activeUIDs = [];
var lockedUIDs = {};
var votesReleased = false;

app.use("/public",express.static(__dirname + "/public"));

app.get("/",function(req,res) {
  res.redirect("/public/voting");
});

function setAll(state) {
  for ( var i = 0; i < activeUIDs.length; i++ ) {
    lockedUIDs[activeUIDs[i]] = state;
  }
  var keys = Object.keys(lockedUIDs);
  for ( var i = 0; i < keys.length; i++ ) {
    if ( activeUIDs.indexOf(keys[i]) <= -1 ) delete lockedUIDs[keys[i]];
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
    if ( ! lockedUIDs[paramuid] ) lockedUIDs[paramuid] = false;
    uid = paramuid;
    adminRoom.emit("update-total",activeUIDs.length);
    if ( currentPoll ) {
      socket.emit("poll-post",{
        "question": currentPoll.question,
        "choices": currentPoll.choices,
        "setLock": lockedUIDs[uid]
      });
      if ( votesReleased ) socket.emit("release-votes",{
        "choices": currentPoll.choices,
        "votes": currentPoll.votes
      });
    }
  });
  socket.on("vote",function(choice) {
    if ( ! uid || lockedUIDs[uid] ) return;
    lockedUIDs[uid] = true;
    console.log(lockedUIDs,uid)
    currentPoll.votes[choice]++;
    socket.emit("vote-recorded");
    adminRoom.emit("recalculate-votes",currentPoll);
  });
  socket.on("disconnect",function() {
    if ( ! uid ) return;
    activeUIDs = activeUIDs.filter(item => item != uid);
    adminRoom.emit("update-total",activeUIDs.length);
  });
});

adminRoom.on("connection",function(socket) {
  if ( currentPoll ) {
    socket.emit("poll-post",{
      "question": currentPoll.question,
      "choices": currentPoll.choices,
      "votes": currentPoll.votes
    });
  }
  socket.emit("update-total",activeUIDs.length);
  socket.on("poll-post",function(obj) {
    currentPoll = obj;
    currentPoll.votes = obj.choices.map(item => 0);
    setAll(false);
    votesReleased = false;
    voterRoom.emit("poll-post",{
      "question": currentPoll.question,
      "choices": currentPoll.choices
    });
    adminRoom.emit("poll-post",currentPoll);
  });
  socket.on("release-votes",function() {
    setAll(true);
    votesReleased = true;
    voterRoom.emit("release-votes",{
      "choices": currentPoll.choices,
      "votes": currentPoll.votes
    });
  });
  socket.on("clear-poll",function() {
    currentPoll = null;
    setAll(false);
    votesReleased = false;
    voterRoom.emit("clear-poll");
    adminRoom.emit("clear-poll");
  });
});

server.listen(PORT,function() {
  console.log(`Listening on port ${PORT}`);
});
