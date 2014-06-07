// Resolving namespace conflicts
if (typeof majascan == "undefined") {var majascan = {};}

// httpDownStreamListener is called by the httpActionObserver if a request response
// is detected. It reads the incoming data stream and inserts it into the
// intelligence modules. Then it passes the data to the original FF listener.

const {Cc,Ci,Cr,components} = require("chrome");
majascan.httpDownStreamListener = function () {}

majascan.httpDownStreamListener.prototype =
{
	requestController: null,
    httpChannelHelper: null,
	originalListener: null,
	receivedData: null,
	browser: null,

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
		
		// call original listener
        this.originalListener.onDataAvailable(request, context, storageStream.newInputStream(0), offset, count);
    },

	// empties receivedData array, passes request to original listener,
	//	get external classes
    onStartRequest: function(request, context) {
		this.receivedData = [];
		// call original listener
		this.originalListener.onStartRequest(request, context);
		
		// initialize external classes
		this.requestController = require('./requestController').getrequestController();
		this.httpChannelHelper = require('./httpChannelHelper').gethttpChannelHelper();
    },
	
	// collect stream data, get environment variables, call requestController
    onStopRequest: function(request, context, statusCode)
    {
		var responseSource = this.receivedData.join();
		var httpChannel = request.QueryInterface(components.interfaces.nsIHttpChannel);
		var context =  this.httpChannelHelper.getRequestContextVariables(httpChannel);
		if (context != null) {
			console.log("Response: "+request.name);
			this.requestController.incomingResponse(context, request.name, responseSource);
		}
		// call original listener
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

// function to export instance to httpActionObserver
majascan.gethttpDownStreamListener = function () {
	return new majascan.httpDownStreamListener;
}

// make gethttpDownStreamListener accessible for other modules
exports.gethttpDownStreamListener = majascan.gethttpDownStreamListener;