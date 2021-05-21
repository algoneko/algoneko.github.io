function httpGet(theUrl) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", theUrl, false ); // false for synchronous request
    xmlHttp.send( null );
    return xmlHttp.responseText;
}

converter = new showdown.Converter({
  extensions: [ 'showdown-katex' ],
  literalMidWordUnderscores: true,
  parseImgDimensions: true,
  strikethrough: true,
  tables: true,
  tasklists: true,
})

_body = document.getElementById("body");

function convert(name) {
    text = httpGet("/md/" + name + ".txt");
    html = converter.makeHtml(text);

    e = document.createElement('div');
    e.innerHTML = html;

    while (e.firstChild) {
        _body.appendChild(e.firstChild);
    }
}