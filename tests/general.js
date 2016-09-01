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

test("Call remote content method", function(t) {
    t.plan(1);
    Background.call('testMyFit', ['Hello, '], function(err, result) {
        t.truthy(result==='Hello, World');
    });
});

Background.methods({
	testMyBack: function(leftPart) {
		return leftPart+'Universe';
	}
});

test("Call remote background method", function(t) {
    t.plan(1);
    Content.call('testMyBack', ['Hello, '], function(err, result) {
        t.truthy(result==='Hello, Universe');
    });
});


