// Resolving namespace conflicts
if (typeof majascan == "undefined") var majascan = {};

// httpRequestObserver is listening to outgoing and incoming HTTP request.
// HTTP responses are passed on to the httpStreamListener.


// add Components.classes, interfaces, etc.
const {Cc,Ci,Cr,components} = require("chrome");

majascan.httpRequestObserver =
{
	observe: function(subject, topic, data) {
		if (topic == "http-on-examine-response") {
			majascan.httpStreamListener = require('./httpStreamListener');
			var newListener = majascan.httpStreamListener.gethttpStreamListener();
			subject.QueryInterface(Ci.nsITraceableChannel);
			newListener.originalListener = subject.setNewListener(newListener);
		}
	},

	get observerService() {
		return Cc["@mozilla.org/observer-service;1"].getService(Ci.nsIObserverService);
	},

	register: function() {
		this.observerService.addObserver(this, "http-on-examine-response", false);
		console.log("start");
	},

	unregister: function() {
		this.observerService.removeObserver(this, "http-on-examine-response");
	}
};

majascan.gethttpRequestObserver = function () {
	return majascan.httpRequestObserver;
}
// make gethttpRequestObserver accessible for other modules
exports.gethttpRequestObserver = majascan.gethttpRequestObserver;