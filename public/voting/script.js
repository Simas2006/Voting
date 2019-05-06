var socket;
var voteLock = false;

function renderItems(obj) {
  document.getElementById("question").innerText = obj.question;
  document.getElementById("vote-cast-text").style.display = "none";
  var width = Math.floor(100 / obj.choices.length);
  var div = document.getElementById("choices");
  while ( div.firstChild ) {
    div.removeChild(div.firstChild);
  }
  for ( var i = 0; i < obj.choices.length; i++ ) {
    var button = document.createElement("button");
    button.innerText = obj.choices[i];
    button["data-index"] = i;
    button.onclick = function() {
      if ( voteLock ) return;
      voteLock = true;
      document.getElementById("vote-cast-text").style.display = "block";
      socket.emit("vote",parseInt(this["data-index"]));
    }
    button.style.width = width + "%";
    div.appendChild(button);
  }
}

function setupSocket() {
  socket = io("/voter");
  socket.on("connect",function() {
    console.log("Connection successful");
  });
  socket.on("check-uid",function(valid) {
    if ( ! valid ) {
      socket.disconnect();
      alert("Using more than one voting window is not allowed.\nIf you need to use this window, please close the other open window and reload this page.");
      document.getElementById("question").innerText = "";
    }
  });
  socket.on("poll-post",function(obj) {
    voteLock = false;
    renderItems(obj);
  });
  socket.on("vote-recorded",function() {
    setTimeout(function() {
      var buttons = document.getElementById("choices").childNodes;
      for ( var i = 0; i < buttons.length; i++ ) {
        buttons[i].disabled = "disabled";
      }
    },50);
  });
  socket.on("release-votes",function(obj) {
    var voteCount = obj.votes.reduce((a,b) => a + b);
    var max = obj.votes.reduce((a,b) => Math.max(a,b));
    var div = document.getElementById("choices");
    for ( var i = 0; i < obj.choices.length; i++ ) {
      div.children[i].innerText = `${obj.choices[i]}\n\n${obj.votes[i]} vote${obj.votes[i] != 1 ? "s" : ""}\n(${(Math.round(obj.votes[i] / voteCount * 100) || 0) + "%"})`;
      div.children[i].disabled = "disabled";
    }
    voteLock = true;
    document.getElementById("vote-cast-text").style.display = "none";
  });
  socket.on("clear-poll",function() {
    document.getElementById("question").innerText = "No question posted";
    document.getElementById("vote-cast-text").style.display = "none";
    var div = document.getElementById("choices");
    while ( div.firstChild ) {
      div.removeChild(div.firstChild);
    }
  });
  socket.emit("check-uid",localStorage.getItem("uid"));
}

window.onload = function() {
  if ( ! localStorage.getItem("uid") || localStorage.getItem("bypassMultiLock") ) localStorage.setItem("uid",Math.floor(Math.random() * 1e14).toString());
  setupSocket();
}
