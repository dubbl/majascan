// Resolving namespace conflicts
if (typeof majascan == "undefined") var majascan = {};

// Startup function
exports.main = function (options, callbacks) {

	// init moduleLoader
	majascan.moduleLoader = require('./moduleLoader.js').getmoduleLoader();
	majascan.moduleLoader.init();
	
	// load "user interface"-interface userInterface
	majascan.userInterface = require('./userInterface.js').getuserInterface();
	
	// load requestController and transmit moduleLoader and userInterface
	majascan.requestController = require('./requestController').getrequestController();
	majascan.requestController.init(majascan.moduleLoader, majascan.userInterface);
	
	// load httpActionObserver and start observing HTTP requests/responses
	majascan.httpActionObserver = require('./httpActionObserver').gethttpActionObserver();
	majascan.httpActionObserver.register();
};

// Destroying listeners to avoid memory leaks
exports.onUnload = function (reason) {
	majascan.httpActionObserver.unregister();
	majascan.moduleLoader.deinit();
};