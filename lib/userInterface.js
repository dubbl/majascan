// Resolving namespace conflicts
if (typeof majascan == "undefined") var majascan = {};

// User Interface. Receives information and presents it to the user 


// add Components.classes, interfaces, etc.
const {Cc,Ci,Cr,components} = require("chrome");

majascan.userInterface =
{
	sidebar: null,
	sidebarworker: null,
	sendNotification: function(message, verboseMessage) {
		var notifications = require("sdk/notifications");
		notifications.notify({
			title: "majascan has deactivated JavaScript in this tab for security reasons",
			text: message+"\nClick here for more information",
			data: verboseMessage,
			onClick: function (verboseMessage) {
				if (majascan.userInterface.sidebar) {
					majascan.userInterface.sidebarworker.port.emit("report",verboseMessage);
				} else {
					majascan.userInterface.sidebar = require("sdk/ui").Sidebar({
						id: 'majascan-sidebar',
						title: 'Majascan Incident Report',
						//icon: './icon.png',
						url: require("sdk/self").data.url('sidebar.html'),
						onReady: function (worker) {
							if (majascan.userInterface.sidebarworker) {
								worker.destroy();
							} else {
								majascan.userInterface.sidebarworker = worker;
							}
							majascan.userInterface.sidebarworker.port.emit("report",verboseMessage);
						}
					});
				}
				majascan.userInterface.sidebar.show();
			}
		});
	}
};


majascan.getuserInterface = function () {
	return majascan.userInterface;
}
// make getuserInterface accessible for other modules
exports.getuserInterface = majascan.getuserInterface;