/**
 * Fetches error message and represent it
 * into localized string without source.
 * @param {Error|string} error to localize
 * @returns {string} represented stroke
 */
localizeError = function(error) {
	let message = fetchErrorMessage(error);
	if (error instanceof java.lang.Object) {
		MCSystem.throwException("Stacktrace: unsupported localize error type: " + error);
	} else if (error && typeof error == "object") {
		let retraced = retraceToArray(error.stack)[0];
		error = sliceMessageWithoutTrace(message, retraced);
	}
	return translateMessage(error);
};
