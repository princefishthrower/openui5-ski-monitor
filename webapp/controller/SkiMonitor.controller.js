sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/format/DateFormat"
], function (Controller, JSONModel, DateFormat) {
	"use strict";

	return Controller.extend("openui5-ski-monitor.openui5-ski-monitor.controller.SkiMonitor", {
		onInit: function() {
			
			// set blank model to view
			var oModel = new JSONModel({
				EntryCollection: []
			});
			this.getView().setModel(oModel);

			// for chrome notifiations
			if (!sap.ui.Device.system.phone) {
				if (!Notification) {
				    alert("Desktop notifications not available in your browser. Try Chrome."); 
				    return;
				  }

				  if (Notification.permission !== "granted") {
				    Notification.requestPermission();
				}
			}

		},
		
		onAfterRendering: function() {
			// set an interval on get ski resort JSON
			var that = this; 
			
			setInterval(function() {
				that.getWeatherData(that);
			}, 60000); // call php file to get json only once every minute
			
			// after rendinger, load existing entries
			var oModel = this.getView().getModel();
			$.ajax({
			  url: "https://chrisfrew.in/api/skimonitor",
			  type: "GET",
			  success: function(data) {
			  	var oJSON = JSON.parse(data);
				var oJSONModel = new JSONModel(oJSON);
				sap.ui.getCore().setModel(oJSONModel, "oldEntries");
				var aOldEntries = [];
				for (var i = 0; i < oJSONModel.getData().length; i++) {
					// create an entry for each old entry
					var sText = "General Report: '" + oJSONModel.getData()[i].conditions + "'\n" 
					          + "The last storm on " + oJSONModel.getData()[i].lastsnow + " dropped " + oJSONModel.getData()[i].newsnow_cm + " cm (" + oJSONModel.getData()[i].newsnow_in + " in) of snow!\n"
					          + "Current snow depth on mountain: "  + oJSONModel.getData()[i].uppersnow_cm + " cm (" + oJSONModel.getData()[i].uppersnow_in + " in)\n"
					          + "Current snow at base: "  + oJSONModel.getData()[i].lowersnow_cm + " cm (" + oJSONModel.getData()[i].lowersnow_in + " in)\n";
					var oEntry = {
						Author: "Ski Monitor",
						Type: "Update Time",
						Date: oJSONModel.getData()[i].reportdate + " " + oJSONModel.getData()[i].reporttime,
						Text: sText
					};
					aOldEntries.unshift(oEntry); // every time, put the entry to the front of the list (since the newest will be at the bottom)
				}
				// set old entries to the view model
				oModel.setData({
					EntryCollection: aOldEntries
				});
			  }
			});
			
		},
		
		onRefresh: function() {
			this.getWeatherData(this);	
		},
		
		getWeatherData: function(oController) {
			console.log(oController);
			console.log("in get...");
			
			// calling chrisfrew.in api for JSON data of ski resorts
			var oModel = sap.ui.getCore().getModel("oldEntries");
			var oView = oController.getView();
			console.log(oModel);
			var sLastEntryDate = oModel.getData()[oModel.getData().length - 1].reportdate + " " + oModel.getData()[oModel.getData().length - 1].reporttime; // last entry is the newest, compare that date!
			sLastEntryDate = sLastEntryDate.substring(3,5) + "/" + sLastEntryDate.substring(0,2) + sLastEntryDate.substr(5);
			var lastEntryReportDate = new Date(Date.parse(sLastEntryDate)); // top of the list of current items has newest date

			$.ajax({
			  url: "https://chrisfrew.in/api/skimonitor",
			  type: "GET",
			  success: function(data) {
			  	var oJSON = JSON.parse(data);
				var oJSONModel = new JSONModel(oJSON);
				console.log(oJSONModel);
				var sCurrentEntryDate = oJSONModel.getData()[oJSONModel.getData().length - 1].reportdate + " " + oJSONModel.getData()[oJSONModel.getData().length - 1].reporttime;
				sCurrentEntryDate = sCurrentEntryDate.substring(3,5) + "/" + sCurrentEntryDate.substring(0,2) + sCurrentEntryDate.substr(5);
				console.log(sCurrentEntryDate);
				var currentEntryReportDate = new Date(Date.parse(sCurrentEntryDate)); // last in the list of php data has newest date
				console.log(lastEntryReportDate);
				console.log(currentEntryReportDate);
				if (currentEntryReportDate > lastEntryReportDate) {
					// update oldEntries - now this new entry actually becomes an 'old entry'
					oController.addNewEntry(oJSONModel.getData()[oJSONModel.getData().length - 1]);
				}
				// finally close the pull to refresh
				oView.byId("pullToRefresh").hide();
			  }
			});
		},
		
		addNewEntry: function(oJSONElement) {
			// create new entry
			var sText = "General Report: '" + oJSONElement.conditions + "'\n" 
					          + "The last storm on " + oJSONElement.lastsnow + " dropped " + oJSONElement.newsnow_cm + " cm (" + oJSONElement.newsnow_in + " in) of snow!\n"
					          + "Current snow depth on mountain: "  + oJSONElement.uppersnow_cm + " cm (" + oJSONElement.uppersnow_in + " in)\n"
					          + "Current snow at base: "  + oJSONElement.lowersnow_cm + " cm (" + oJSONElement.lowersnow_in + " in)\n";
					var oNewEntry = {
						Author: "Ski Monitor",
						Type: "Update Time",
						Date: oJSONElement.reportdate + " " + oJSONElement.reporttime,
						Text: sText
					};
			// update the view model
			var oModel = this.getView().getModel();
			var aOldEntries = oModel.getData().EntryCollection;
			aOldEntries.unshift(oNewEntry); // put to front of list
			oModel.setData({
				EntryCollection: aOldEntries
			});
			if (!sap.ui.Device.system.phone) {
				this.showNotification();
			}
		},
		
		showNotification: function() {
			  if (Notification.permission !== "granted") {
			    Notification.requestPermission();
			  } else {
			    var notification = new Notification("Ski Monitor Update", {
			      icon: "https://pbs.twimg.com/profile_images/474919605618475008/7IFjw-Lq.jpeg",
			      body: "Check out the page! There's a new update!"
			    });
			    notification.onclick = function () {
			      window.open("https://stackoverflow.com/a/13328397/1269037");      
			    };
			}
		},
		
		openStackPopOver: function(oEvent) {
			var oButton = oEvent.getSource();
			if (!this._oStackPopOver) {
				this._oStackPopOver = sap.ui.xmlfragment("openui5-ski-monitor.openui5-ski-monitor.view.Stack", this);
				this.getView().addDependent(this._oStackPopOver);
			}
			this._oStackPopOver.openBy(oButton);
		},
		
		onStackPopOverClose: function() {
			this._oStackPopOver.close();
		}
	});
});