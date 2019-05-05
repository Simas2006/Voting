var socket;
var singleLock = false;

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
      if ( singleLock ) return;
      singleLock = true;
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
  socket.on("poll-post",function(obj) {
    singleLock = false;
    renderItems(obj);
  });
  socket.on("single-lock",function() {
    setTimeout(function() {
      var buttons = document.getElementById("choices").childNodes;
      for ( var i = 0; i < buttons.length; i++ ) {
        buttons[i].disabled = "disabled";
      }
    },50);
  });
  socket.on("release-votes",function(obj) {
    var voteCount = obj.votes.reduce((a,b) => a + b);
    var div = document.getElementById("choices");
    for ( var i = 0; i < obj.choices.length; i++ ) {
      div.children[i].innerText = `${obj.choices[i]}\n\n${obj.votes[i]} votes\n(${Math.round(obj.votes[i] / voteCount * 100) + "%"})`;
      div.children[i].disabled = "disabled";
    }
    singleLock = true;
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
}

window.onload = function() {
  setupSocket();
}
