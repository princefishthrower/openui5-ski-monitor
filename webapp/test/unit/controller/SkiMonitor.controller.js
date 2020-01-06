/*global QUnit*/

sap.ui.define([
	"openui5-ski-monitor/openui5-ski-monitor/controller/SkiMonitor.controller"
], function (Controller) {
	"use strict";

	QUnit.module("SkiMonitor Controller");

	QUnit.test("I should test the SkiMonitor controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});