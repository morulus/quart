var _tabId = Symbol();
global.CustomEvent = function CustomEvent(eventName, data) {
	this.eventName = eventName;
    this.data = data;
}
global.chrome = {
	listeners: [],
	tabs: {
		query: function(options, callback) {
			callback([_tabId]);
		},
		sendMessage: function(tabId, data, callback) {
			chrome.runtime._listeners.forEach(function(fn) {
				fn(data, {}, callback);
			});
		}
	},
	runtime: {
		_listeners: [],
		onMessage: {
			addListener: function(fn) {
                chrome.runtime._listeners.push(fn);
			}
		},
		sendMessage: function(data, callback) {
			chrome.runtime._listeners.forEach(function(fn) {
				fn(data, {}, callback);
			});
		}
	}
}

global.window = {
	_listeners: {
	},
	addEventListener: function(eventName, fn) {
		if ("object"!==typeof this._listeners[eventName]) this._listeners[eventName] = [];
		this._listeners[eventName].push(fn);
	},
	emit: function(eventName, data) {
		if ("object"!==typeof this._listeners[eventName]) return;
		this._listeners[eventName].forEach(function(fn) {
			if ("function"==typeof fn) fn(data);
		});
	},
    dispatchEvent: function(eventObject) {
        global.window.emit(eventObject.eventName, eventObject.data);
    }
}

global.document = {
    createElement: function() {
        return Object.create(null, {
            textContent: {
                writable: true,
                value: null
            },
            parentNode: {
                value:  {
                    removeChild: function(el) {
                        el.textContent = null;
                    }
                }
            }
        })
    },
    documentElement: {
        appendChild: function(el) {
            eval(el.textContent);
        }
    }
}