// Resolving namespace conflicts
if (typeof majascan == "undefined") var majascan = {};

// httpActionObserver is listening to outgoing and incoming HTTP request.
// HTTP responses are passed on to the httpStreamListener.


// add Components.classes, interfaces, etc.
const {Cc,Ci,Cr,components} = require("chrome");

majascan.httpActionObserver =
{
	requestController: null,
	httpChannelHelper: null,
	observe: function(subject, topic, data) {
		// intercept incoming http responses with custom Listener
		if (topic == "http-on-examine-response" ||
			topic == "http-on-examine-cached-response" ||
			topic == "http-on-examine-merged-response")
		{
			majascan.httpDownStreamListener = require('./httpDownStreamListener');
			var newListener = majascan.httpDownStreamListener.gethttpDownStreamListener();
			subject.QueryInterface(Ci.nsITraceableChannel);
			newListener.originalListener = subject.setNewListener(newListener);
		} else if (topic == "http-on-modify-request") {
			// intercept outgoing http requests without custom listener
			
			subject.QueryInterface(Ci.nsITraceableChannel);
			majascan.httpUpStreamReader = require('./httpUpStreamReader');
			
			// get http channel and context vars
			var httpChannel = subject.QueryInterface(components.interfaces.nsIHttpChannel);
			var context =  this.httpChannelHelper.getRequestContextVariables(httpChannel);
			
			// initialize upstream reader and reading potential POST payload
			var streamReader = majascan.httpUpStreamReader.gethttpUpStreamReader(); 
			var post = streamReader.outgoingRequest(subject, topic, data);
			
			// get URL of request
			var url = httpChannel.name;
			
			if (this.requestController || context != null) {
				console.log("Request: "+url);
				this.requestController.outgoingRequest(context, url, post);
			} else {
				this.requestController = require('./requestController').getrequestController();
				this.requestController.outgoingRequest(url, post);
			}
		} 
	},

	get observerService() {
		return Cc["@mozilla.org/observer-service;1"].getService(Ci.nsIObserverService);
	},
	// register observer to http actions, initialize environment
	register: function() {
		this.observerService.addObserver(this, "http-on-examine-response", false);
		this.observerService.addObserver(this, "http-on-examine-cached-response", false);
		this.observerService.addObserver(this, "http-on-examine-merged-response", false);
		this.observerService.addObserver(this, "http-on-modify-request", false);
		this.requestController = require('./requestController').getrequestController();
		this.httpChannelHelper = require('./httpChannelHelper').gethttpChannelHelper();
	},
	
	// clean up on exit
	unregister: function() {
		this.observerService.removeObserver(this, "http-on-examine-response");
		this.observerService.removeObserver(this, "http-on-examine-cached-response", false);
		this.observerService.removeObserver(this, "http-on-examine-merged-response", false);
		this.observerService.removeObserver(this, "http-on-modify-request", false);
	}
};

majascan.gethttpActionObserver = function () {
	return majascan.httpActionObserver;
}
// make gethttpActionObserver accessible for other modules
exports.gethttpActionObserver = majascan.gethttpActionObserver;