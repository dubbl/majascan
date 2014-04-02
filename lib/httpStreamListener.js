// Resolving namespace conflicts
if (typeof majascan == "undefined") var majascan = {};

// httpStreamListener is called by the httpRequestObserver if a request response
// is detected. It reads the incoming data stream and inserts it into the
// intelligence modules. Then it passes the data to the original FF listener.


const {Cc,Ci,Cr,components} = require("chrome");
majascan.httpStreamListener = function () {}

majascan.httpStreamListener.prototype =
{
    originalListener: null,
	receivedData: null,

	// create storage stream, inserts incoming bytes
    onDataAvailable: function(request, context, inputStream, offset, count)
    {
		var binaryInputStream = components.classes["@mozilla.org/binaryinputstream;1"].createInstance(Ci["nsIBinaryInputStream"]);
        var storageStream = Cc["@mozilla.org/storagestream;1"].createInstance(Ci["nsIStorageStream"]);
        binaryInputStream.setInputStream(inputStream);
        storageStream.init(8192, count, null);

		var binaryOutputStream = Cc["@mozilla.org/binaryoutputstream;1"].createInstance(Ci["nsIBinaryOutputStream"]);

        binaryOutputStream.setOutputStream(storageStream.getOutputStream(0));

        // Copy received data as they come.
        var data = binaryInputStream.readBytes(count);

        this.receivedData.push(data);

        binaryOutputStream.writeBytes(data, count);
        this.originalListener.onDataAvailable(request, context,
				storageStream.newInputStream(0), offset, count);
    },

	// empties receivedData array, passes request to original listener
    onStartRequest: function(request, context) {
		this.receivedData = [];
		this.originalListener.onStartRequest(request, context);
    },

	// output data. TODO: pass data to intelligence modules
    onStopRequest: function(request, context, statusCode)
    {
		var responseSource = this.receivedData.join();
		console.log("\nResponse: " + responseSource + "\n");
		var httpChannel = request.QueryInterface(components.interfaces.nsIHttpChannel);  
		var origin = httpChannel.URI.asciiSpec;
		if(origin && origin.length > 0)
			origin = "Server: " + origin;  
		console.log(origin);
		
        this.originalListener.onStopRequest(request, context, statusCode);
    },

    QueryInterface: function (aIID) {
        if (aIID.equals(Ci.nsIStreamListener) ||
            aIID.equals(Ci.nsISupports)) {
            return this;
        }
        throw components.results.NS_NOINTERFACE;
    }
}
// function to export instance to httpResquestObserver
majascan.gethttpStreamListener = function () {
	return new majascan.httpStreamListener;
}

// make gethttpStreamListener accessible for other modules
exports.gethttpStreamListener = majascan.gethttpStreamListener;