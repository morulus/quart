require('./stub/chrome.js');
require('./stub/chrome.js');
var BackgroundScript = require('./../index.js').BackgroundScript;
var ContentScript = require('./../index.js').ContentScript;
var test = require('ava');

var Background = new BackgroundScript();
var Content = new ContentScript();

Content.methods({
    testMyFit: function(leftPart) {
        throw new Error("Oups");
    }
});

test("Call remote method", function(t) {
    t.plan(1);
    Background.call('testMyFit', ['Hello, '], function(err, result) {
        debugger;
       t.truthy(err.message==='Oups');
    });
});


