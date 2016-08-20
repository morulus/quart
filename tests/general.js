require('./stub/chrome.js');
var BackgroundScript = require('./../index.js').BackgroundScript;
var ContentScript = require('./../index.js').ContentScript;
var test = require('ava');

var Background = new BackgroundScript();
var Content = new ContentScript();

Content.methods({
    testMyFit: function(leftPart) {
        return leftPart+'World';
    }
});

test("Call remote method", function(t) {
    t.plan(1);
    Background.call('testMyFit', ['Hello, '], function(err, result) {
        t.truthy(result==='Hello, World');
    });
});


