// Resolving namespace conflicts
if (typeof majascan == "undefined") var majascan = {};

// moduleResponse is the standardized return result of the intelligence modules


// add Components.classes, interfaces, etc.
const {Cc,Ci,Cr,components} = require("chrome");

majascan.moduleResponse =
{
	score: 0,
	message: "No message given.",
	verboseMessage: "No explaination given.",
	setScore: function(score) {
		this.score = score;
	},
	setMessage: function(message) {
		this.message = message;
	},
	setVerboseMessage: function(verboseMessage) {
		this.verboseMessage = verboseMessage;
	},
	getScore: function() {
		return this.score;
	},
	getMessage: function() {
		return this.message;
	},
	getVerboseMessage: function() {
		return this.verboseMessage;
	}
};

majascan.getmoduleResponse = function () {
	return majascan.moduleResponse;
}
// make getmoduleResponse accessible for other modules
exports.getmoduleResponse = majascan.getmoduleResponse;