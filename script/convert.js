function httpGet(theUrl) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", theUrl, false ); // false for synchronous request
    xmlHttp.send( null );
    if (xmlHttp.status >= 300 || xmlHttp.status < 200) {
        str = "_An error occurred while opening [this file](" + theUrl + "). "
            + "Code: " + ("" + xmlHttp.status) + "-" + xmlHttp.statusText + "\n";
        return str;
    }
    return xmlHttp.responseText;
}

converter = new showdown.Converter({
//  extensions: [ 'showdown-katex' ],
  extensions: [ 'katexlatex' ],
  literalMidWordUnderscores: true,
  parseImgDimensions: true,
  strikethrough: true,
  tables: true,
  tasklists: true,
})

function isInArray(value, array) {
  return array.indexOf(value) > -1;
}

function convert(name) {
    is_special = isInArray(name, [
        "brain", "facepalm", "ftr", "hate", "longago", "nya", "vp"
    ]);

    if (name === "ftr") name = "foot";  // That ugly hack, again.
    
    text = httpGet("/md/" + name + (is_special?".txt":".md"));
    html = converter.makeHtml(text);

    e = document.createElement('div');
    e.innerHTML = html;

    _body = document.getElementById("body");
    while (e.firstChild) {
        _body.appendChild(e.firstChild);
    }
}
