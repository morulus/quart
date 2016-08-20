const transportMethodNameSignRegExpr = /^QuartTransport__/;
/**
 * Background implementation of Chrominate
 */
function BackgroundScript() {

}

BackgroundScript.prototype = {
	constructor: BackgroundScript,
	call: function(methodName) {
		var callback = Array.from(arguments).pop();
		var args;
		if (arguments.length===3) {
			args = arguments[1];
		} else if (arguments.length>3) {
			args = Array.from(arguments).splice(1, arguments.length-2);
		}
		var compiledMethodName = 'QuartTransport__'+methodName;

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

/**
 * Compile to executable, returnable code
 * 
 * @param  {function} fn
 * @return {string}
 */
function toRemoteCode(fn, args) {
	if (!(args instanceof Array)) args = [];
	return 'return ('+fn.toString()+').apply(this, '+JSON.stringify(args)+');';
}

/**
 * Class ContentScript - special API for data transporting between content script and background script
 */
var ContentScript = function() {
	/**
	 * List of executable methods
	 * @type {Object}
	 */
	this._methods = {};
	/**
	 * Next execution id
	 * @type {Number}
	 */
	this.executorId = 0;
	/**
	 * List of awaiting objects
	 * @type {Object<Function>}
	 */
	this.awaits = {};
	/**
	 * Listen for runtime message coming up from background script
	 */
	chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
		if (!transportMethodNameSignRegExpr.test(request.method)) return;
		var RestoreMethodName = request.method.replace(transportMethodNameSignRegExpr, '');
		if (this._methods.hasOwnProperty(RestoreMethodName)) {
			this.execute(toRemoteCode(this._methods[RestoreMethodName], request.args), function(err, value) {
				sendResponse({err: err, value: value});
			});
		}
	}.bind(this));
	/*
	* Listen for tab events
	*/
	window.addEventListener("DTTClientResponse", (e) => {
	  if (e.detail.executingId && "function"===typeof this.awaits[e.detail.executingId]) {
	    this.awaits[e.detail.executingId](e.detail.response[0], e.detail.response[1]);
	  }
	});
}

ContentScript.prototype = {
	constructor: ContentScript,
	/**
	 * @param  {object<Function>}
	 * @return {[type]}
	 */
	methods: function(decl) {

		this._methods = Object.assign({}, this._methods, decl);
	},
	/**
	* Executes code on tab side
	*/
	execute: function(expression, callback) {
	    this.executorId++;
	    if ("function"===typeof callback) this.awaits[this.executorId] = function(executorId, err, value) {
	      this.awaits[executorId] = null;
	      callback(err, value);
	    }.bind(this, this.executorId);

	    var scr = document.createElement('script');
	    //appending text to a function to convert it's src to string only works in Chrome
	    scr.textContent = 'var expression'+this.executorId+'Result=[0, undefined];'+
	    'try { expression'+this.executorId+'Result[1] = (function() {'+expression+'})(); } '+
	    'catch(e) { expression'+this.executorId+'Result[0]=e.message; } (' + 
	    	(function (executorId, expressionResult) {
	    
	    var event = new CustomEvent("DTTClientResponse", {
	        detail: {
	          executingId: executorId,
	          response: expressionResult
	        }
	      });
	    window.dispatchEvent(event); }) + ')("'+this.executorId+'", expression'+this.executorId+'Result);';
	    
	    //cram that sucker in 
	    (document.head || document.documentElement).appendChild(scr);
	    //and then hide the evidence as much as possible.
	    scr.parentNode.removeChild(scr);
	}
}

module.ContentScript = ContentScript;
module.BackgroundScript = BackgroundScript;
module.exports = {
	ContentScript: ContentScript,
	BackgroundScript: BackgroundScript
}

