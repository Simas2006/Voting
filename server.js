var express = require("express");
var app = express();
var server = require("http").createServer(app);
var io = require("socket.io")(server);
var PORT = process.argv[2] || 8000;

var voterRoom = io.of("/voter");
var adminRoom = io.of("/admin");
var currentPoll = {
  "question": "The question!!!",
  "choices": [
    "Yes",
    "No"
  ],
  "votes": [0,0]
}

app.use("/public",express.static(__dirname + "/public"));

voterRoom.on("connection",function(socket) {
  var singleLock = false;
  socket.emit("poll-post",{
    "question": currentPoll.question,
    "choices": currentPoll.choices
  });
  socket.on("vote",function(choice) {
    if ( ! choice instanceof Number ) return;
    currentPoll.votes[choice]++;
    console.log(currentPoll.votes,choice);
    singleLock = true;
    socket.emit("single-lock");
  });
});

server.listen(PORT,function() {
  console.log(`Listening on port ${PORT}`);
});
