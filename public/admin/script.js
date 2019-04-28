var socket;
var totalCount = 0;

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
    if ( obj.setTotalCount ) totalCount = obj.setTotalCount;
    var choices = document.getElementById("chart-choices");
    var bars = document.getElementById("chart-bars");
    while ( choices.firstChild ) {
      choices.removeChild(choices.firstChild);
    }
    while ( bars.firstChild ) {
      bars.removeChild(bars.firstChild);
    }
    var voteCount = obj.votes.reduce((a,b) => a + b);
    for ( var i = 0; i < obj.choices.length; i++ ) {
      var text = document.createElement("td");
      text.innerText = obj.choices[i];
      choices.appendChild(text);
      var container = document.createElement("td");
      container.style.width = Math.floor(100 / obj.choices.length) + "%";
      var div = document.createElement("div");
      div.className = "chart-column";
      div.style.height = (obj.votes[i] / voteCount) * 100 + "%";
      div.innerText = `${obj.votes[i]}\n(${Math.round(obj.votes[i] / voteCount * 100) + "%"})`;
      container.appendChild(div);
      bars.appendChild(container);
    }
  });
  socket.on("recalculate-votes",function(obj) {
    var voteCount = obj.votes.reduce((a,b) => a + b);
    var bars = document.getElementById("chart-bars");
    for ( var i = 0; i < obj.choices.length; i++ ) {
      bars.children[i].firstChild.style.height = (obj.votes[i] / voteCount * 100) + "%";
      bars.children[i].firstChild.innerText = `${obj.votes[i]}\n(${Math.round(obj.votes[i] / voteCount) * 100 + "%"})`;
    }
  });
  socket.on("update-total",function(count) {
    totalCount = count;
    document.getElementById("total-100").innerText = `Total: ${totalCount}`;
    document.getElementById("total-50").innerText = `Simple Majority (1/2): ${Math.ceil(totalCount * 0.5)}`;
    document.getElementById("total-60").innerText = `Qualified Majority (3/5): ${Math.ceil(totalCount * 0.6)}`;
  });
}

window.onload = function() {
  setupSocket();
  addChoice();
  addChoice();
  document.getElementById("choices").children[0].firstChild.value = "Yes";
  document.getElementById("choices").children[1].firstChild.value = "No";
}
