// Resolving namespace conflicts
if (typeof majascan == "undefined") var majascan = {};

// xssReflectiveGET module (example module). Searches for JavaScript in URL


// add Components.classes, interfaces, etc.
const {Cc,Ci,Cr,components} = require("chrome");

majascan.xssReflectiveGET =
{
	outgoingRequest: function(context, url, postdata) {
		if (url != null) {
			// searching for (encoded) instances of <script> 
			var searchResult = url.search(/(<|%3c|\&#x3c|\\x3c)(script|%73%63%72%69%70%74|\&#x73;\&#x63;\&#x72;\&#x69;\&#x70;\&#x74;|\\x73\\x63\\x72\\x69\\x70\\x74)/i);
			if (searchResult != -1) {
				var response = new require("./../moduleResponse").getmoduleResponse();
				response.setScore(100);
				response.setMessage("JavaScript code was found in the HTTP request");
				response.setVerboseMessage("A JavaScript &lt;script&gt; tag indicating that "+
					"the site you are visiting can be compromised was found. The tag was "+
					"found in the URL '"+url+"'");
				return response;
			}
			// searching for js event handlers in an html tag context
			var searchResult = url.search(/('|"|%22|%27|\\x22|\\x27)+( |%20|\\x20)*(\w|%\w\w|\\x\w\w)+(=|%3D|\\x3D)/i);
			if (searchResult != -1) {
				var response = new require("./../moduleResponse").getmoduleResponse();
				response.setScore(90);
				response.setMessage("JavaScript code was found in the HTTP request");
				response.setVerboseMessage("A JavaScript event handler indicating that "+
					"the site you are visiting can be compromised was found. The code was "+
					"found in the URL '"+url+"'");
				return response;
			}
			// searching for js event handlers in an html tag context
			var searchResult = url.search(/javascript:/i);
			if (searchResult != -1) {
				var response = new require("./../moduleResponse").getmoduleResponse();
				response.setScore(60);
				response.setMessage("Potential JavaScript code was found in the HTTP request");
				response.setVerboseMessage("Potential JavaScript command indicating that "+
					"the site you are visiting can be compromised was found. The code was "+
					"found in the URL '"+url+"'");
				return response;
			}
		}
		return null;
	}
}

majascan.getModule = function () {
	return majascan.xssReflectiveGET;
}
// make gettabController accessible for other modules
exports.getModule = majascan.getModule;