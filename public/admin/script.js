var socket;
var totalCount = 12;

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
  socket.on("poll-post",function(obj) {
    document.getElementById("poll-info").innerText = `Question: ${obj.question}`;
    var choices = document.getElementById("chart-choices");
    var bars = document.getElementById("chart-bars");
    while ( choices.firstChild ) {
      choices.removeChild(choices.firstChild);
    }
    while ( bars.firstChild ) {
      bars.removeChild(bars.firstChild);
    }
    for ( var i = 0; i < obj.choices.length; i++ ) {
      var text = document.createElement("td");
      text.innerText = obj.choices[i];
      choices.appendChild(text);
      var container = document.createElement("td");
      var div = document.createElement("div");
      div.className = "chart-column";
      div.style.height = (obj.votes[i] / totalCount) * 100 + "%";
      container.appendChild(div);
      bars.appendChild(container);
    }
  });
}

window.onload = function() {
  setupSocket();
  addChoice();
  addChoice();
  document.getElementById("choices").children[0].firstChild.value = "Yes";
  document.getElementById("choices").children[1].firstChild.value = "No";
}
