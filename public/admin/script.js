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

window.onload = function() {
  addChoice();
  addChoice();
}
