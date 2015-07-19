'use strict';

// Taken from John Resig of jQuery
// Also works with negative indexes
Array.prototype.remove = function(from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};

String.prototype.charCode = function() {
  return this.charCodeAt(0);
};

String.prototype.charCodes = function() {
  let xs = [];
    for (let i = 0; i < this.length; i++) {
      xs.push(this[i].charCodeAt(0));
    }
  return xs;
}

String.prototype.replaceAll = function(oldChar, newChar) {
  let s = '';
  for (let i = 0; i < this.length; i++) {
    if (this[i] == oldChar)
      s += newChar;
    else
      s += this[i];
  }
  return s;
}

String.prototype.insert = function(index, str) {
  if (index > 0)
    return this.substring(0, index) + str + this.substring(index, this.length);
  else
    return str + this;
};

String.prototype.stripChar = function(c) {
  let s = '';
  for (let i = 0; i < this.length; i++) {
    if (this[i] != c)
      s += this[i];
  }
  return s;
};

// chars can be either a string or an array of characters
String.prototype.stripChars = function(chars) {
  let s = '';
  for (let i = 0; i < this.length; i++)
    if (chars.indexOf(this[i]) < 0)
      s += this[i];
  return s;
}

String.prototype.removeCharAtIndex = function(index) {
  if (index == 0) { return this.substr(1); }
  return this.substr(0, index) + this.substr(index + 1);
};

String.HTMLElement = function(elem, attrs, innerHTML) {
  let s = '<' + elem;
  attrs = attrs || {};
  innerHTML = innerHTML || null;

  for (let key in attrs) {
    console.log(key);
    s += ' ' + key + '="' + attrs[key] + '"';
  }

  if (innerHTML) {
    s += '>' + innerHTML + '</' + elem + '>';
    return s;
  }

  s += ' />';
  return s;
};