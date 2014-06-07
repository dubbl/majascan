// Resolving namespace conflicts
if (typeof majascan == "undefined") {var majascan = {};}

// helper class to extract the context variables of the httpChannel
// based largely on code by nmaier and Noitidart

const {Cc,Ci,Cr,components} = require("chrome");

majascan.httpChannelHelper = 
{
	// to determine which tab started the request
	getRequestContext: function(httpChannel) {
		var requestContext;
		try {
			if(httpChannel.notificationCallbacks) 
				var notificationCallbacks = httpChannel.notificationCallbacks;
			else 
				var notificationCallbacks = aRequest.loadGroup.notificationCallbacks;
				
			var interfaceRequestor = notificationCallbacks.QueryInterface(Ci.nsIInterfaceRequestor);
			try {
				requestContext = interfaceRequestor.getInterface(Ci.nsILoadContext);
				return requestContext;
			} catch (ex) {
				try {
					requestContext = subject.loadGroup.notificationCallbacks.getInterface(Ci.nsILoadContext);
					return requestContext;
				} catch (ex2) { return null; }
			}
		} catch (ex0) { return null; }
	},
	
	// to determine which tab started the request
	// Authors: nmaier and Noitidart
	getRequestContextVariables: function(httpChannel) {
		var requestContext;
		requestContext = this.getRequestContext(httpChannel);
		
		if (!requestContext) {
			// TODO: ajax call?
			return null;
		} else {
			var contentWindow = requestContext.associatedWindow;
			if (!contentWindow) {
				// TODO: ajax call?
				return null;
			} else {
				var aDOMWindow = contentWindow.top.QueryInterface(Ci.nsIInterfaceRequestor)
					.getInterface(Ci.nsIWebNavigation)
					.QueryInterface(Ci.nsIDocShellTreeItem)
					.rootTreeItem
					.QueryInterface(Ci.nsIInterfaceRequestor)
					.getInterface(Ci.nsIDOMWindow);
				var gBrowser = aDOMWindow.gBrowser;
				var aTab = gBrowser._getTabForContentWindow(contentWindow.top);
				var browser = null
				if (aTab) { var browser = aTab.linkedBrowser;}
				return {
					aDOMWindow: aDOMWindow,
					gBrowser: gBrowser,
					aTab: aTab,
					browser: browser,
					contentWindow: contentWindow
				};
			}
		}
	}
};

// function to export instance to httpChannelHelper
majascan.gethttpChannelHelper = function () {
	return majascan.httpChannelHelper;
}

// make gethttpChannelHelper accessible for other modules
exports.gethttpChannelHelper = majascan.gethttpChannelHelper;