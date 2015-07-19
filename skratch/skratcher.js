'use strict';

function keyEventToChar(e) {
  if (e.shiftKey) {

  }
}

function Skratcher(initialText, panel) {
  let srcFile = new SourceFile(initialText);
  let srcView = new SourceView(srcFile, panel);

  function draw() {
    srcView.draw();
  }

  function drawRaw() {
    srcView.drawRaw();
  }

	return {
    keyDown: function(e) {
      if (Debug.KeyCode) { console.log('KeyCode: ' + e.keyCode); console.log(e); }

      if (e.ctrlKey) {
        // Allow Ctrl+Shift+I to enable Chrome Dev Tools
        if (!(e.shiftKey && e.keyCode == Keycode.I)) {
          e.preventDefault();
        }

        if (e.altKey && e.keyCode == Keycode.X) {
          srcFile.clearFile();
          draw();
          return;
        }

        if (e.keyCode == Keycode.X) {
          srcFile.deleteLine();
        }
        else if (e.keyCode == Keycode.E) {
          srcFile.deleteToEOL();
        }
        else if (e.keyCode == Keycode.B) {
          srcFile.deleteToBOL();
        }
        else if (e.keyCode == Keycode.R) {
          location.reload();
        }
        else if (e.keyCode == Keycode.I) {
          // srcFile.insertStr(String.HTMLElement('img', { src: Globals.RelativityIconDataURI }));
          // srcFile.insertRawStr(String.HTMLElement('img', { src: Globals.RelativityIconDataURI }));
          srcFile.insertStr(' |KCURALOGO| ');
        }

        draw();
        return;
      }

      if (e.keyCode == Keycode.Left) {
        e.shiftKey ? srcFile.moveCursorBOL() : srcFile.moveCursorBack();
      }
      else if (e.keyCode == Keycode.Right) {
        e.shiftKey ? srcFile.moveCursorEOL() : srcFile.moveCursorForward();
      }
      else if (e.keyCode == Keycode.Up) {
        e.preventDefault();
        e.shiftKey ? srcFile.moveCursorBOF() : srcFile.moveCursorUpline();
      }
      else if (e.keyCode == Keycode.Down) {
        e.preventDefault();
        e.shiftKey ? srcFile.moveCursorEOF() : srcFile.moveCursorDownline();
      }
      else if (e.keyCode == Keycode.Enter) {
        srcFile.insertNewLine();
      }
      else if (e.keyCode == Keycode.Spacebar) {
        e.preventDefault();
        srcFile.insertStr(' ');
      }
      else if (e.keyCode == Keycode.Backspace) {
        e.preventDefault();
        srcFile.deleteCharsBack();
      }
      else if (e.keyCode == Keycode.Delete) {
        srcFile.deleteCharsForward();
      }
      else if (e.keyCode == Keycode.Tab) {
        srcFile.insertStr('\t');
      }
      else {
        let c = e.shiftKey ? ASCIIShifted[e.keyCode] : ASCII[e.keyCode];
        if (!(typeof(c) == 'undefined')) { srcFile.insertStr(c); }
      }
      
      draw();
    },
    draw: draw,
    drawRaw: drawRaw
  };
}