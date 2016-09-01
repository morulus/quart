require('./../stub/chrome.js');
var BackgroundScript = require('./../../index.js').BackgroundScript;
var ContentScript = require('./../../index.js').ContentScript;

var Background = new BackgroundScript();
var Content = new ContentScript();

Content.methods({
    testMyFit: function(leftPart) {
        return leftPart+'World';
    }
});

Background.call('testMyFit', ['Hello, '], function(err, result) {
    debugger;
});
