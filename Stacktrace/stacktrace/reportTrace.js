/**
 * Reports catched modification errors,
 * may used in [[catch]]-block when any throw
 * code occurs. Stacktrace will be displayed
 * on display with sources hieracly.
 * @param {Error|any} value to report
 */
reportTrace = function(error) {
	if (error === undefined) {
		return;
	}
	if (error instanceof java.lang.Object) {
		MCSystem.throwException("" + error);
	}
	if (reportTrace.isReporting) {
		if (!Array.isArray(reportTrace.handled)) {
			reportTrace.handled = [];
		}
		reportTrace.handled.push(error);
		if (reportTrace.handled.length > 8) {
			reportTrace.handled.shift();
		}
		return;
	}
	let date = reportTrace.fetchTime();
	reportTrace.isReporting = true;
	UI.getContext().runOnUiThread(function() {
		let builder = new android.app.AlertDialog.Builder(UI.getContext(),
			android.R.style.Theme_DeviceDefault_DialogWhenLarge);
		builder.setTitle(fetchErrorName(error));
		builder.setCancelable(false);
		builder.setMessage(Translation.translate("Preparing report"));
		builder.setPositiveButton(Translation.translate("Understand"), null);
		builder.setNeutralButton(Translation.translate("Leave"), function() {
			delete reportTrace.handled;
		});
		let code = reportTrace.toCode(error);
		builder.setNegativeButton(code, function() {
			posted.export = true;
			new java.lang.Thread(function() {
				while (posted.inProcess()) {
					java.lang.Thread.yield();
				}
				saveOrRewrite(code, posted.toResult());
			}).start();
		});
		let dialog = builder.create();
		dialog.setOnDismissListener(function() {
			delete reportTrace.isReporting;
			let next = reportTrace.findNextTrace();
			next !== null && reportTrace(next);
			!posted.export && posted.cancel();
		});
		let popup = dialog.getWindow();
		popup.setLayout(UI.getContext().getWindowManager().getDefaultDisplay().getWidth() / 1.35,
			android.view.ViewGroup.LayoutParams.WRAP_CONTENT);
		popup.clearFlags(android.view.WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS);
		let posted = reportTrace.postUpdate(dialog, error, date);
		dialog.show();
		let view = popup.findViewById(android.R.id.message);
		if (view != null) {
			view.setTextIsSelectable(true);
			view.setTextSize(view.getTextSize() * 0.475);
		}
	});
};

reportTrace.handled = [];

reportTrace.postUpdate = function(dialog, error, date) {
	let handler = android.os.Handler.createAsync(dialog.getContext().getMainLooper(), new android.os.Handler.Callback({
			handleMessage: function(message) {
				return false;
			}
		})),
		completed = false,
		formatted,
		update;
	new java.lang.Thread(function() {
		let message = fetchErrorMessage(error),
			retraced = retraceToArray(error ? error.stack : null);
		retraced.length > 0 && retraced.pop();
		let sliced = sliceMessageWithoutTrace(message, retraced[0]),
			localized = translateMessage(sliced);
		update = new java.lang.Runnable(function() {
			let additional = [];
			if (message != null) {
				let entry = "<font color=\"#CCCC33\">";
				if (localized != sliced) {
					entry += localized + "<br/>";
				}
				entry += sliced + "</font>";
				additional.push(entry);
			}
			for (let i = 0; i < retraced.length; i++) {
				let element = requested.formatted[i];
				if (element !== undefined) {
					additional.push(element);
					continue;
				}
				if (additional.length < 2) {
					additional.push("");
				}
				additional.push(retraced[i]);
			}
			let attached = [];
			if (additional.length > 0) {
				attached.push(additional.join("<br/>"));
			}
			let marked = "";
			marked += new Date(launchTime).toString();
			if (date > 0) {
				marked += "<br/>" + new Date(launchTime + date).toString();
				marked += "<br/>" + Translation.translate("Milliseconds estimated after launch") + ": " + date;
			}
			attached.push(marked);
			if (requested.error) {
				attached.push("<font color=\"#DD3333\">" + Translation.translate("Wouldn't fetch modification sources") +
					": " + localizeError(requested.error) + "</font>");
			}
			formatted = android.text.Html.fromHtml(attached.join("<br/><br/>"));
			dialog.setMessage(formatted);
			if (requested.completed) {
				completed = true;
			}
		});
		let requested = reportTrace.handleRequest(handler, update, retraced);
		handler.post(update);
	}).start();
	return {
		inProcess: function() {
			return !completed;
		},
		toResult: function() {
			return formatted !== undefined ? formatted.toString() : "";
		},
		cancel: function() {
			if (update !== undefined) {
				handler.removeCallbacks(update);
			}
		}
	};
};

reportTrace.processFile = function(file, where) {
	if (typeof where != "number" || where === NaN) {
		return null;
	}
	let strokes = [];
	if (!isValidFile(file)) {
		return strokes;
	}
	let scanner = new java.io.FileReader(file),
		reader = java.io.BufferedReader(scanner),
		wasErrorLines = false,
		encounted = 0,
		hieracly = 0,
		count = 0,
		included,
		another,
		line;
	// Up to 3 lines before and 4 after throw place
	while (count < where + 3 && (line = reader.readLine())) {
		count++;
		encounted++;
		line = "" + line;
		if (line.startsWith("// file: ")) {
			included = line.substring(9);
			encounted = -1;
		}
		if (count > where - 3) {
			if (count == where) {
				wasErrorLines = true;
				another = encounted;
			} else if (/\}|\]/.test(line)) {
				// Simple construction detection
				if (hieracly > 0) {
					hieracly--;
				} else if (wasErrorLines) {
					wasErrorLines = false;
				}
			}
			if (count >= where && /\{|\[/.test(line)) {
				hieracly++;
			}
			strokes.push("<font face=\"monospace\"><small>" + count + "</small> " +
				(wasErrorLines ? "<font color=\"#DD3333\">" + line + "</font>" : line) + "</font>");
		}
	}
	if (strokes.length >= 3) {
		if (included !== undefined) {
			strokes.push("<i>" + Translation.translate("Defined at") + " " + included + ":" + another + "</i>");
		}
		return strokes;
	}
	// No exception found here
	return [];
};

reportTrace.processSources = function(related, resolved, where) {
	if (typeof where != "number" || where === NaN) {
		return null;
	}
	let strokes = [];
	if (related == null || typeof related != "object") {
		return strokes;
	}
	for (let mod in related) {
		let sources = related[mod],
			directory = setupLoadedSources.sources[mod].dir;
		for (let i = 0; i < sources.length; i++) {
			let file = new java.io.File(directory, sources[i]),
				result = reportTrace.processFile(file, where);
			if (result && result.length > 0) {
				strokes = strokes.concat(result);
				break;
			}
		}
		if (strokes.length > 0) {
			if (!(getModName(mod) == resolved.source || setupLoadedSources.sources[mod].dir.endsWith("/" + resolved.source + "/"))) {
				strokes.push("<small><font color=\"#CCCC33\">" + Translation.translate("Source may be incorrectly") + "</font></small>");
			}
			break;
		}
	}
	return strokes;
};

reportTrace.processStack = function(resolved) {
	let strokes = [],
		where = parseInt(resolved.line) + 1;
	strokes.push((resolved.source ? resolved.source + " " + Translation.translate("from") + " " : "") + resolved.file +
		(resolved.where ? " (" + resolved.where + ")" : "") + " " + Translation.translate("at line") + " " + where);
	let sources = findRelatedSources(resolved.source, resolved.file),
		processed = reportTrace.processSources(sources, resolved, where);
	if (processed != null && processed.length > 0) {
		strokes[0] = "<br/>" + strokes[0];
		strokes = strokes.concat(processed);
	}
	return strokes.join("<br/>");
};

reportTrace.handleRequest = function(handler, update, trace) {
	let requested = {};
	requested.formatted = [];
	new java.lang.Thread(function() {
		try {
			for (let i = 0; i < trace.length; i++) {
				let resolved = resolveTraceSource(trace[i]);
				if (resolved === null) continue;
				let processed = reportTrace.processStack(resolved);
				requested.formatted.push(processed);
				handler.post(update);
			}
		} catch (e) {
			requested.error = e;
			try {
				handler.post(update);
			} catch (e) {
				print(e.message);
			}
		}
		requested.completed = true;
	}).start();
	return requested;
};

reportTrace.findNextTrace = function() {
	let handled = this.handled;
	if (!Array.isArray(handled)) {
		return null;
	}
	if (handled.length > 0) {
		return handled.shift();
	}
	return null;
};

reportTrace.fetchTime = function() {
	return Date.now() - launchTime;
};

reportTrace.toCode = function(error) {
	let message = "" + error;
	if (error && typeof error == "object") {
		let fetched = fetchErrorMessage(error.message);
		fetched !== null && (message = fetched);
		if (error.stack !== undefined) {
			message += "\n" + error.stack;
		}
	}
	let encoded = new java.lang.String(message);
	return "NE-" + Math.abs(encoded.hashCode());
};

reportTrace.setupPrint = function(action) {
	if (typeof action != "function") {
		return delete print;
	}
	return !!(print = action);
};

reportTrace.reloadModifications = function() {
	setupLoadedSources(getLoadedModList());
};
