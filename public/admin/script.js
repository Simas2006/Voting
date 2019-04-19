var socket;

function addChoice() {
  var li = document.createElement("li");
  var input = document.createElement("input");
  input.placeholder = "Choice";
  li.appendChild(input);
  var button = document.createElement("button");
  button.innerText = "X";
  button.className = "delete";
  button.onclick = function() {
    this.parentElement.parentElement.removeChild(this.parentElement);
  }
  li.appendChild(button);
  document.getElementById("choices").insertBefore(li,document.getElementById("add-button"));
}

function postPoll() {
  var choices = [];
  var div = document.getElementById("choices");
  for ( var i = 0; i < div.children.length - 1; i++ ) {
    choices.push(div.children[i].firstChild.value);
  }
  var obj = {
    "question": document.getElementById("question").value,
    "choices": choices
  }
  socket.emit("poll-post",obj);
}

function setupSocket() {
  socket = io("/admin");
  socket.on("connect",function() {
    console.log("Connection successful");
  });
}

window.onload = function() {
  setupSocket();
  addChoice();
  addChoice();
}
