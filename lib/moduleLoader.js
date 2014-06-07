// Resolving namespace conflicts
if (typeof majascan == "undefined") var majascan = {};

// moduleLoader


// add Components.classes, interfaces, etc.
const {Cc,Ci,Cr,components} = require("chrome");

// Never call this function. Required files are not resolved dynamically at run-
// time but have to be included statically at least once.
majascan.modules =
{
	dummy: function() {
		try {require("./modules/xssTest");}catch(e){}
		try {require("./modules/xssReflectiveGET");}catch(e){}
		try {require("./modules/xssReflectivePOST");}catch(e){}
	},
	list: [
		'xssTest',
		'xssReflectiveGET',
		'xssReflectivePOST'
	]
}

majascan.moduleLoader =
{
	module: [],
	init: function() {
		// iterating through possible modules defined in module list
		this.module.length = 0;
		var modulePref = null;
		var moduleFile = null;

		for (var x=0; majascan.modules.list.length > x; x++) {
			modulePref = require('sdk/simple-prefs').prefs[majascan.modules.list[x]];
			
			// load module if it is activated in the settings
			if (modulePref == 1) {
				try {
					this.module.push(require('./modules/'+majascan.modules.list[x]).getModule());
					console.log("Module "+majascan.modules.list[x]+" loaded");
				} catch (e) {
					console.log("Error: Could not load module "+majascan.modules.list[x]);
				}					
			}
		}
		
		// reinitialize moduleLoader if changed to the settings are detected
		
		function reload() {
			majascan.moduleLoader.init();
		}
		require("sdk/simple-prefs").on("", reload);
	},
	deinit: function() {
		require("sdk/simple-prefs").removeListener("", this.init);
	}
}

majascan.getmoduleLoader = function () {
	return majascan.moduleLoader;
}
// make gettabController accessible for other modules
exports.getmoduleLoader = majascan.getmoduleLoader;