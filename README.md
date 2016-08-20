Quart
--

# Getting started
Quart - is an API, that helping to connect chrome extension's background script and page script via remote methods.

Both scripts should to pre-build through webpack or another bundler.

## On content script
```js
var Quart = require('quartirant').ContentScript;
Quart.methods({
	sayHello: function(name) {
		return 'Hello, '+name;
	}
})
```

## On background script
```
var Quart = require('quartirant').BackgroundScript;
Quart.call('sayHello', ['Quart'], function(err, result) {
	console.log('result'); // Hello, Quart
});
```

## License
MIT, 2016

## Attention! Early development stage.
**The code of library is very young. Minimum tests and practical usage. I'm not sure You should to use it in your extensions now.**

## Author
Vladimir Kalmykov <vladimirmorulus@gmail.com> (http://github.com/morulus)
