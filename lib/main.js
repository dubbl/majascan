// Resolving namespace conflicts
if (typeof majascan == "undefined") var majascan = {};

// Startup function, registering HTTP Request Observer
exports.main = function (options, callbacks) {
	majascan.httpRequestObserver = require('./httpRequestObserver').gethttpRequestObserver();
	majascan.httpRequestObserver.register();
};

// Destroying HTTP Request Observer to avoid memory leaks
exports.onUnload = function (reason) {
	majascan.httpRequestObserver.unregister();
};