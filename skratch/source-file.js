'use strict';

function SourceFile(str) {
  let source = str;
  let lines = str.split('\n');
  let cursor = { X: 0, Y: 0 };

  function moveCursorForward() {
    if (cursor.X < lines[cursor.Y].length) {
      cursor.X++;
    } else {
      if (cursor.Y + 1 < lines.length) {
        cursor.Y++;
        cursor.X = 0;
      }
    }
  }
  function moveCursorBack() {
    if (cursor.X == 0) {
      if (cursor.Y > 0) { 
        cursor.Y--; 
        cursor.X = lines[cursor.Y].length;
      }
    } else {
      cursor.X--;
    }
  }
  function moveCursorBOL() {
    cursor.X = 0;
  }

  function moveCursorEOL() {
    cursor.X = lines[cursor.Y].length;
  }

  function moveCursorUpline() {
    if (cursor.Y > 0) {
      cursor.Y--;
      if (cursor.X > lines[cursor.Y].length) {
        cursor.X = lines[cursor.Y].length;
      }
    }
  }

  function moveCursorDownline() {
    if (cursor.Y + 1 < lines.length) {
      cursor.Y++;
      if (cursor.X > lines[cursor.Y].length) {
        cursor.X = lines[cursor.Y].length;
      }
    }
  }

  function moveCursorBOF() {
    cursor.X = 0; cursor.Y = 0;
  }

  function moveCursorEOF() {
    cursor.Y = lines.length - 1;
    cursor.X = lines[lines.length - 1].length;
  }

  function deleteCharsBack() {
    if (cursor.X > 0) {
      moveCursorBack();
      lines[cursor.Y] = lines[cursor.Y].removeCharAtIndex(cursor.X);
    } else {
      if (cursor.Y == 0) { return; }
      let tmp = lines[cursor.Y];
      lines.remove(cursor.Y);
      cursor.Y--;
      cursor.X = lines[cursor.Y].length;
      lines[cursor.Y] += tmp;
    }
  }

  function deleteCharsForward() {
    if (cursor.X < lines[cursor.Y].length) {
      lines[cursor.Y] = lines[cursor.Y].removeCharAtIndex(cursor.X);
    } else {
      if (cursor.Y + 1 == lines.length) { return; }
      lines[cursor.Y] += lines[cursor.Y + 1];
      lines.remove(cursor.Y + 1);
    }
  }

  function deleteToBOL() {
    while (cursor.X > 0) {
      deleteCharsBack();
    }
  }

  function deleteToEOL() {
    while (cursor.X < lines[cursor.Y].length) {
      deleteCharsForward();
    }
  }

  function deleteLine() {
    if (lines.length == 1) {
      lines[0] = '';
      return;
    }

    lines.remove(cursor.Y);
    if (cursor.X > lines[cursor.Y].length) {
      cursor.X = lines[cursor.Y].length;
    }
  }

  function clearFile() {
    source = '';
    lines = [''];
    cursor.X = 0; cursor.Y = 0;
  }

  function insertNewLine() {
    let restOfLine = lines[cursor.Y].substr(cursor.X);
    lines[cursor.Y] = lines[cursor.Y].substr(0, cursor.X);
    cursor.Y++;
    lines.splice(cursor.Y, 0, restOfLine);
    cursor.X = 0;
  }

  function insertStr(str) {
    // Replace <, >, & with symbol codes
    //    TODO: This will need to be changed for reading+writing files
    // let cleanStr = str.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
    lines[cursor.Y] = lines[cursor.Y].insert(cursor.X, str);
    for (let i = 0; i < str.length; i++) { moveCursorForward(); }
  }

  function insertRawStr(str) {
    
  }

  return {
    getText: function() { return lines.join('\n'); },
    getLines: function() { return lines; },
    getCursor: function() { return cursor; },

    // Cursor Movement
    moveCursorForward: moveCursorForward,
    moveCursorBack: moveCursorBack,
    moveCursorBOL: moveCursorBOL,
    moveCursorEOL: moveCursorEOL,
    moveCursorDownline: moveCursorDownline,
    moveCursorUpline: moveCursorUpline,
    moveCursorBOF: moveCursorBOF,
    moveCursorEOF: moveCursorEOF,

    // Text Deletion
    deleteCharsBack: deleteCharsBack,
    deleteCharsForward: deleteCharsForward,
    deleteToBOL: deleteToBOL,
    deleteToEOL: deleteToEOL,
    deleteLine: deleteLine,
    clearFile: clearFile,

    // Text Modification
    insertNewLine: insertNewLine,
    insertStr: insertStr,
    insertRawStr: insertRawStr
  };
}