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
  var singleLock = false;
  socket.on("vote",function(choice) {
    if ( ! choice instanceof Number ) return;
    currentPoll.votes[choice]++;
    console.log(currentPoll.votes,choice);
    singleLock = true;
    socket.emit("single-lock");
  });
});

adminRoom.on("connection",function(socket) {
  socket.on("poll-post",function(obj) {
    currentPoll = obj;
    currentPoll.votes = obj.choices.map(item => 0);
    voterRoom.emit("poll-post",{
      "question": currentPoll.question,
      "choices": currentPoll.choices
    });
    socket.emit("confirm-post");
  });
});

server.listen(PORT,function() {
  console.log(`Listening on port ${PORT}`);
});
