reformatSpecial = function(element) {
	element = "" + element;
	element = element.replace(/\+/g, "\\+");
	element = element.replace(/\(/g, "\\(");
	element = element.replace(/\)/g, "\\)");
	element = element.replace(/\[/g, "\\[");
	element = element.replace(/\]/g, "\\]");
	element = element.replace(/\{/g, "\\{");
	element = element.replace(/\}/g, "\\}");
	return element.replace(/\./g, "\\.");
};

requireFormat = function(message) {
	for (let element in addTranslation.messages) {
		let exp = reformatSpecial(element);
		exp = exp.replace(/%s/g, "(.*)");
		try {
			let regexp = new RegExp(exp, "m");
			if (regexp.test(message)) {
				return {
					message: "" + element,
					exec: regexp.exec(message)
				};
			}
		} catch (e) {
			// Must be detected if regexp fail
		}
	}
	return {
		message: message
	};
};

translateMessage = function(message) {
	if (typeof message != "string") {
		message = "" + message;
	}
	let format = requireFormat(message);
	if (addTranslation.messages.hasOwnProperty(format.message)) {
		message = Translation.translate(format.message);
		if (format.exec && format.exec.length > 1) {
			format.exec.shift();
			try {
				return java.lang.String.format(message, format.exec);
			} catch (e) {
				format.exec.forEach(function(who) {
					message = message.replace("%s", who);
				});
			}
		}
	}
	return message;
};

resolveTraceSource = function(line) {
	if (typeof line != "string") {
		line = "" + line;
	}
	let at = line.indexOf("at ");
	if (at == -1) {
		return null;
	}
	line = line.substring(at + 3);
	let resolved = {};
	resolved.trace = line;
	if (line.endsWith(")")) {
		let index = line.lastIndexOf("(");
		resolved.where = line.slice(index + 1, line.length - 1);
		line = line.substring(0, index - 1);
	}
	let semi = line.lastIndexOf(":");
	if (semi != -1) {
		resolved.line = line.slice(semi + 1, line.length);
		line = line.substring(0, semi);
	}
	let name = line.indexOf("$");
	if (name != -1) {
		resolved.source = line.slice(0, name);
		line = line.substring(name + 1);
	}
	resolved.file = line;
	return resolved;
};

sliceMessageWithoutTrace = function(message, line) {
	if (typeof message != "string") {
		message = "" + message;
	}
	let trace = resolveTraceSource(line);
	if (trace === null) {
		return message;
	}
	trace = trace.trace.replace(":", "#");
	let index = message.lastIndexOf(trace);
	if (index != -1) {
		return message.slice(0, index - 2);
	}
	return message;
};

retraceToArray = function(trace) {
	if (trace === null || trace === undefined) {
		return [];
	}
	if (typeof trace != "string") {
		trace = "" + trace;
	}
	return trace.split("\n");
};

fetchErrorMessage = function(error) {
	if (error === null) {
		return "" + error;
	}
	if (typeof error == "object") {
		if (error.hasOwnProperty("message")) {
			return "" + error.message;
		}
		return null;
	}
	return "" + error;
};

fetchErrorName = function(error) {
	if (error && typeof error == "object") {
		if (error.name !== undefined) {
			return "" + error.name;
		}
	}
	return Translation.translate("Oh nose everything broke");
};

saveOrRewrite = function(path, text) {
	text = new java.lang.String(text);
	let file = new java.io.File(__dir__ + ".logging", path + ".trace");
	file.getParentFile().mkdirs();
	if (!file.isDirectory()) {
		file.createNewFile();
		let stream = new java.io.FileOutputStream(file);
		stream.write(text.getBytes());
		stream.close();
		print(Translation.translate("Saved as") + " " + path);
		return;
	}
	print(Translation.translate("Couldn't save trace"));
};
