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
    button.style.width = width + "%";
    div.appendChild(button);
  }
}

window.onload = function() {
  renderItems({
    "question": "Question",
    "choices": [
      "Yes",
      "No",
      "Choice #3",
      "Choice #4",
      "Choice #5"
    ]
  });
  if ( ! localStorage.getItem("uid") ) {
    localStorage.setItem("uid",Math.floor(Math.random() * 1e14));
  }
}
