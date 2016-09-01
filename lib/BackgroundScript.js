var transportToContentMethodPrefix = require('./const.js').transportToContentMethodPrefix;
var transportToBackgroundMethodPrefix = require('./const.js').transportToBackgroundMethodPrefix;
var transportToContentMethodNameSignRegExpr = require('./const.js').transportToContentMethodNameSignRegExpr;
var transportToBackgroundMethodNameSignRegExpr = require('./const.js').transportToBackgroundMethodNameSignRegExpr;
/**
 * Background implementation of Chrominate
 */
function BackgroundScript() {
	/**
	 * List of executable methods
	 * @type {Object}
	 */
	this._methods = {};

	chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  		if (!transportToBackgroundMethodNameSignRegExpr.test(request.method)) return;
		var RestoreMethodName = request.method.replace(transportToBackgroundMethodNameSignRegExpr, '');
		if (this._methods.hasOwnProperty(RestoreMethodName)) {
			try {
				var result = this._methods[RestoreMethodName].apply(this, request.args);
				sendResponse({err: null, value: result});
			} catch(e) {
				sendResponse({err: e.message, value: null});
			}
		} else {
			sendResponse({err: 'Remote method `'+RestoreMethodName+'` is undefined', value: null});
		}
    }.bind(this));
}

BackgroundScript.prototype = {
	constructor: BackgroundScript,
	/**
	 * Adds hash of methods
	 * @param  {object<Function>}
	 * @return {[type]}
	 */
	methods: function(decl) {
		this._methods = Object.assign({}, this._methods, decl);
	},
	/**
	 * Call content method
	 * @param  {Function} methodName
	 * @param  {array} args
	 * @param  {function} callback
	 */
	call: function(methodName) {
		var callback = Array.from(arguments).pop();
		var args;
		if (arguments.length===3) {
			args = arguments[1];
		} else if (arguments.length>3) {
			args = Array.from(arguments).splice(1, arguments.length-2);
		}
		var compiledMethodName = transportToContentMethodPrefix+methodName;

		chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
			chrome.tabs.sendMessage(tabs[0].id, {method: compiledMethodName, args: args}, function(response) {
				if (!response||"object"!==typeof response||response.err) {
					callback("object"!==typeof response || response==null ? new Error('Invalid response') : new Error(response.err), null);
				} else {
					callback(null, response.value);
				}
			});
		});
	}
}

module.exports = BackgroundScript;