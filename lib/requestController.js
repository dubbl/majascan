// Resolving namespace conflicts
if (typeof majascan == "undefined") var majascan = {};

// requestController 


// add Components.classes, interfaces, etc.
const {Cc,Ci,Cr,components} = require("chrome");

majascan.requestController =
{
	tabs : [],
	moduleLoader: null,
	userInterface: null,
	// initializes the class and provides static module loader
	init : function(moduleLoader, userInterface) {
		this.moduleLoader = moduleLoader;
		this.userInterface = userInterface;
	},
	// determines reaction to findings
	determineReaction: function(context, score, message, verboseMessage) {
		if (score > 50) {
			// disable JavaScript in tab
			var docShell = context.browser.docShell;
			docShell.allowJavascript = false;
			// notify user
			this.userInterface.sendNotification(message, verboseMessage);
		}
	},
	// outgoing HTTP request was sent by user
	outgoingRequest: function (context, url, postdata) {
		var response = null;
		var score = 0;
		var message = "";
		var verboseMessage = "";
		for (var x=0;x < this.moduleLoader.module.length; x++) {
			if (typeof(this.moduleLoader.module[x].outgoingRequest) === "function") {
				response = this.moduleLoader.module[x].outgoingRequest(context, url, postdata);
				if (response) {
					score += response.getScore();
					message += response.getMessage()+"\n";
					verboseMessage += response.getVerboseMessage()+"<hr/>";
				}
			}
		}
		if (score != 0)
			this.determineReaction(context, score, message, verboseMessage);
	},
	// HTTP response to HTTP request is incoming
	incomingResponse: function(context, url, source) {
		var response = null;
		var score = 0;
		var message = "";
		var verboseMessage = "";
		for (var x=0;x < this.moduleLoader.module.length; x++) {
			if (typeof(this.moduleLoader.module[x].incomingResponse) === "function") {
				response = this.moduleLoader.module[x].incomingResponse(context, url, source);
				if (response) {
					score += response.getScore();
					message += response.getMessage()+"\n";
					verboseMessage += response.getVerboseMessage()+"<hr/>";
				}
			}
		}
		if (score != 0)
			this.determineReaction(context, score, message, verboseMessage);
	}
}

majascan.getrequestController = function () {
	return majascan.requestController;
}
// make getrequestController accessible for other modules
exports.getrequestController = majascan.getrequestController;