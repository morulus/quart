var BackgroundScript = require('./lib/BackgroundScript.js');
var ContentScript = require('./lib/ContentScript.js');

module.ContentScript = ContentScript;
module.BackgroundScript = BackgroundScript;
module.exports = {
	ContentScript: ContentScript,
	BackgroundScript: BackgroundScript
}

