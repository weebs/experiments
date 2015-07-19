'use strict';

function SourceView(sourceFile, panel) {
  let srcFile = sourceFile;
  let viewPanel = panel;

  function getFormattedText() {
    let lines = srcFile.getLines();
    let cursor = srcFile.getCursor();

    let highlightWords = ['brown', 'function', 'false', 'var', 'null'];

    if (Debug.Cursor) { console.log('Cursor'); console.log(cursor); }

    let s = '';
    for (let i = 0; i < lines.length; i++) {
      let line = '';

      if (i == cursor.Y) {
        line += 'Line ' + i + ': ' + lines[i].insert(cursor.X, '|');
        if (Debug.LineEndings) { line += ' \\n'; }
      } else {
        line += 'Line ' + i + ': ' + lines[i];
        if (Debug.LineEndings) { line += ' \\n'; }
      }
      line += ' \n';

      let lineSplit = line.split(' ');
      for (let j = 0; j < lineSplit.length; j++) {
        let word = lineSplit[j];
        if (word == '|KCURALOGO|') {
          s += ' ' + String.HTMLElement('img', { src: Globals.RelativityIconDataURI });
        }
        else {
          let cleanWord = word.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
          
          let charsToStrip = [ '|', ';', '\t' ];
          if (highlightWords.indexOf(cleanWord.stripChars(charsToStrip)) >= 0) {
            s += ' ' + '<span style="color: red;">' + cleanWord + '</span>';
          } else {
            s += ' ' + cleanWord;
          }
        }
      }
    }
    return s;
  }

  function getRawText() {
    return srcFile.getText();
  }

  function draw() {
    if (Settings.TabsToSpaces) { viewPanel.innerHTML = getFormattedText().replaceAll('\t', Settings.TabString); }
    else { viewPanel.innerHTML = getFormattedText(); }
  }

  function drawRaw() {
    if (Settings.TabsToSpaces) { viewPanel.innerHTML = getRawText().replaceAll('\t', Settings.TabString); }
    else { viewPanel.innerHTML = getRawText(); }
  }

  return {
    getFormattedText: getFormattedText,
    getRawText: getRawText,
    draw: draw,
    drawRaw: drawRaw
  };
}