// Resolving namespace conflicts
if (typeof majascan == "undefined") var majascan = {};

// xssTest module (example module). Searches in the response source 
// for usual XSS test alerts like alert("xss");


// add Components.classes, interfaces, etc.
const {Cc,Ci,Cr,components} = require("chrome");

majascan.xssTest =
{
	incomingResponse: function(context, url, source) {
		var searchResult = source.search(/alert\(("|')(.+)?xss(.+)?("|')\);/i);
		if (searchResult != -1) {
			var response = new require("./../moduleResponse").getmoduleResponse();
			response.setScore(100);
			response.setMessage("Typical XSS test code was found in the source of "+url);
			response.setVerboseMessage("JavaScript code indicating that "+
				"this website is vulnerable to XSS was found. The code was "+
				"found in the source of '"+url+"'");
			return response;
		}
		return null;
	}
}

majascan.getModule = function () {
	return majascan.xssTest;
}
// make gettabController accessible for other modules
exports.getModule = majascan.getModule;