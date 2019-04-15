var express = require("express");
var app = express();
var server = require("http").createServer(app);
var io = require("socket.io")(server);
var PORT = process.argv[2] | 8000;

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
  socket.emit("poll-post",{
    "questions": currentPoll.questions,
    "choices": currentPoll.choices
  });
});

server.listen(PORT,function() {
  console.log(`Listening on port ${PORT}`);
});
