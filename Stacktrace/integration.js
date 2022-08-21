EXPORT("localizeError", localizeError);

Callback.addCallback("PreBlocksDefined", function() {
	reportTrace.reloadModifications();
});
Callback.addCallback("CorePreconfigured", function() {
	reportTrace.reloadModifications();
});
if (this.isInstant !== undefined) {
	reportTrace.reloadModifications();
}

EXPORT("reportTrace", reportTrace);
