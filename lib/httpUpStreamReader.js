// Resolving namespace conflicts
if (typeof majascan == "undefined") {var majascan = {};}

// httpUpStreamReader is called by the httpActionObserver if a http request
// is detected. It reads the outcoming data stream and inserts it into the
// intelligence modules.

const {Cc,CC,Ci,Cr,components} = require("chrome");
const ScriptableInputStream = CC("@mozilla.org/scriptableinputstream;1","nsIScriptableInputStream","init");


majascan.httpUpStreamReader = function () {}

majascan.httpUpStreamReader.prototype =
{
	outgoingRequest: function(subject, topic, data) {
		let post = null;
		
		if (!(subject instanceof Ci.nsIHttpChannel) ||
			!(subject instanceof Ci.nsIUploadChannel)) {
			return null;
		}
		// if type is not post abort - optional todo: check before class is loaded
		if (subject.requestMethod !== 'POST') {
			return null;
		}

		try {
			let us = subject.uploadStream;
			if (!us) {
				return post;
			}
			if (us instanceof Ci.nsIMultiplexInputStream) {
				// Seeking in a nsIMultiplexInputStream effectively breaks the stream.
				return post;
			}
			if (!(us instanceof Ci.nsISeekableStream)) {
				// Cannot seek within the stream :(
				return post;
			}

			let oldpos = us.tell();
			us.seek(0, 0);

			try {
				let is = new ScriptableInputStream(us);

				// we'll read max 64k
				let available = Math.min(is.available(), 1 << 16);
				if (available) {
					post = is.read(available);
				}
			}
			finally {
				// Always restore the stream position!
				us.seek(0, oldpos);
			}
		} catch (ex) {}
		return post;
	}
}

// function to export instance to httpUpStreamReader
majascan.gethttpUpStreamReader = function () {
	return new majascan.httpUpStreamReader;
}

// make gethttpUpStreamReader accessible for other modules
exports.gethttpUpStreamReader = majascan.gethttpUpStreamReader;