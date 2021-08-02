function is_dark_mode() {
  return document.cookie.indexOf("d=1") !== -1;
}
function clear_dark_mode() {
  document.cookie.replace("d=1","");
}
function set_dark_mode() {
  document.cookie = "d=1";
}

function apply_dark_mode() {
  if (is_dark_mode()) {
    document.body.style["color"] = "#ccc";
    document.body.style["background-color"] = "#000";
  } else {
    document.body.style["color"] = "";
    document.body.style["background-color"] = "";
  }
}

document.addEventListener("DOMContentLoaded", function(event) {
  apply_dark_mode();

  var button = document.createElement("Button");
  button.innerHTML = "Toggle dark mode";
  button.style = "top: 1em; right: 1em; position: absolute; z-index: 9999";
  button.addEventListener("click", function() {
    if(is_dark_mode()) clear_dark_mode();
    else set_dark_mode();
    apply_dark_mode();
  });
  
  document.body.appendChild(button);
});
