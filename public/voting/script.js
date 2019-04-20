var socket;
var tempLock = false;

function renderItems(obj) {
  document.getElementById("question").innerText = obj.question;
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
      if ( tempLock ) return;
      tempLock = true;
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
  socket.on("poll-post",renderItems);
  socket.on("single-lock",function() {
    setTimeout(function() {
      var buttons = document.getElementById("choices").childNodes;
      for ( var i = 0; i < buttons.length; i++ ) {
        buttons[i].disabled = "disabled";
      }
    },50);
  });
}

window.onload = function() {
  setupSocket();
}
