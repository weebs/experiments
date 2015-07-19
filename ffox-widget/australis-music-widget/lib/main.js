var indexedDB = require('indexed-db').indexedDB;

var Widgets = require('sdk/widget');

var AustralisWidget = require("./xul-manager/australis-widget.js").AustralisWidget;
var MusicWidget = require("./test-widget.js").MusicWidget;

let db = null;

function initAddon() {
  var musicWidget = new MusicWidget();
  var australisWidget = new AustralisWidget(musicWidget);
}

let useButtonLoader = false;

if(useButtonLoader) {
     var widgetLoader = Widgets.Widget({
       id: "msu-music-loader",
       label: "Music Loader",
       contentURL: "http://mozilla.org/favicon.ico",
       onClick: function() {
         initAddon();
       }
     });
} else {
     initAddon();
}

