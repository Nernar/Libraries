Environment.Task.Remove = function(environment, json) {
	Environment.Task.apply(this, arguments);
};

Environment.Task.Remove.prototype = new Environment.Task;
Environment.Task.Remove.prototype.SUBTASK = Environment.Task.Remove;

Environment.Task.Remove.prototype.parseJson = function(json) {
	Environment.Task.prototype.parseJson.apply(this, arguments);
	if (json != null && typeof json == "object") {
		if (json.hasOwnProperty("path") && json.path) {
			this.path = new Environment.Parser(this.getEnvironment(), json.path);
		}
		if (json.hasOwnProperty("must_explore")) {
			if (typeof json.must_explore == "string") {
				this.must_explore = new Environment.Parser(this.getEnvironment(), json.must_explore);
			} else if (typeof json.must_explore == "boolean") {
				this.must_explore = json.must_explore;
			} else {
				log("Environment: Remove task must_explore must be string or boolean");
			}
		}
	} else if (typeof json == "string") {
		this.path = new Environment.Parser(this.getEnvironment(), json);
	} else {
		log("Environment: Remove task must be object or string")
	}
};

Environment.Task.Remove.prototype.getPath = function() {
	let prefix = this.getEnvironment().getPath(),
		path = instanceOrFormat(this.path) || null;
	return Files.restorePathCorrection(prefix, path);
};

Environment.Task.Remove.prototype.isMustExplore = function() {
	return instanceOrFormat(this.must_explore) !== false;
};

Environment.Task.Remove.prototype.process = function() {
	Files.deleteRecursive(this.getPath(), this.isMustExplore());
	return true;
};

Environment.Task.registerTask("remove", Environment.Task.Remove);
Environment.Task.registerTask("explorer:remove", Environment.Task.Remove);
