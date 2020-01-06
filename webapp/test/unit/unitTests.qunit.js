/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"openui5-ski-monitor/openui5-ski-monitor/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});