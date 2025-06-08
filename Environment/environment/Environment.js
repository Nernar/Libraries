function Environment(pathOrJson, json) {
	if (pathOrJson instanceof java.io.File) {
		this.path = pathOrJson.getParentFile().getPath();
		if (json == null || typeof json != "object") {
			json = JSON.parse(Files.read(pathOrJson));
		}
		this.parseJson(json);
	} else {
		if (json != null && typeof json == "object") {
			this.path = pathOrJson;
			this.parseJson(json);
		} else if (pathOrJson != null && typeof pathOrJson == "object") {
			this.parseJson(pathOrJson);
		} else if (pathOrJson) {
			this.path = pathOrJson;
		}
	}
}

Environment.prototype.getTask = function() {
	return this.task || null;
};

Environment.prototype.getContext = function() {
	return this.context || null;
};

Environment.prototype.getScriptable = function() {
	return this.scriptable || null;
};

Environment.prototype.getPath = function() {
	return this.path || null;
};

Environment.prototype.isPrepared = function() {
	return Boolean(this.getContext());
};

Environment.prototype.parseJson = function(json) {
	if (json == null || typeof json != "object") {
		return;
	}
	this.task = Environment.Task.parseJson(this, json);
	this.instance = json;
};

Environment.prototype.prepareScriptable = function() {
	let javascript = org.mozilla.javascript.Context.enter();
	javascript.setLanguageVersion(200);
	this.context = javascript;
	if (this.scriptable === undefined) {
		let scriptable = javascript.initStandardObjects(null, false);
		scriptable.variable = {};
		scriptable.query = {};
		this.scriptable = scriptable;
	}
};

Environment.prototype.resetScriptable = function() {
	this.getContext().exit();
	this.context = null;
};

Environment.prototype.evaluateString = function(stroke) {
	return this.getContext().evaluateString(this.getScriptable(), stroke, "environment.js", 0, null);
};

Environment.prototype.execute = function() {
	if (!this.isPrepared()) {
		this.prepareScriptable();
	}
	let sequence = this.getTask();
	sequence && sequence.run();
	this.resetScriptable();
};
