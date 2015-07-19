'use strict';
// Setup view objects
let editorPanel = document.getElementById('editorPanel');
let statusPanel = document.getElementById('statusPanel');
let watchPanel = document.getElementById('watchPanel');
let btnRawSource = document.getElementById('btnRawSource');
let btnStyledSource = document.getElementById('btnStyledSource');

let initialText = 'The quick brown fox\nJumps over the lazy dog\nHe had an adventerous day.\n\n';
initialText += 'function FooBar(x, y) {\n\tlet i = 0;\n\tvar isSomething = false;\n\tlet obj = null;\n\treturn 0;\n}';

var skratcher = new Skratcher(initialText, editorPanel);
skratcher.draw();
document.body.addEventListener('keydown', skratcher.keyDown);
btnRawSource.onclick = skratcher.drawRaw;
btnStyledSource.onclick = skratcher.draw;