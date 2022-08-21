Environment.Task.Append = function(environment, json) {
	Environment.Task.apply(this, arguments);
};

Environment.Task.Append.prototype = new Environment.Task;
Environment.Task.Append.prototype.SUBTASK = Environment.Task.Append;

Environment.Task.Append.prototype.parseJson = function(json) {
	Environment.Task.prototype.parseJson.apply(this, arguments);
	if (json != null && typeof json == "object") {
		if (json.hasOwnProperty("output") && json.output) {
			this.output = new Environment.Parser(this.getEnvironment(), json.output);
		}
		if (json.hasOwnProperty("path") && json.path) {
			this.path = new Environment.Parser(this.getEnvironment(), json.path);
		}
		if (json.hasOwnProperty("must_explore")) {
			if (typeof json.must_explore == "string") {
				this.must_explore = new Environment.Parser(this.getEnvironment(), json.must_explore);
			} else if (typeof json.must_explore == "boolean") {
				this.must_explore = json.must_explore;
			} else {
				log("Environment: Append task must_explore must be string or boolean");
			}
		}
		if (json.hasOwnProperty("includes_directories")) {
			if (typeof json.includes_directories == "string") {
				this.includes_directories = new Environment.Parser(this.getEnvironment(), json.includes_directories);
			} else if (typeof json.includes_directories == "boolean") {
				this.includes_directories = json.includes_directories;
			} else {
				log("Environment: Append task includes_directories must be string or boolean");
			}
		}
	} else if (typeof json == "string") {
		this.path = new Environment.Parser(this.getEnvironment(), json);
	} else {
		log("Environment: Append task must be object or string")
	}
};

Environment.Task.Append.prototype.getPath = function() {
	let prefix = this.getEnvironment().getPath(),
		path = instanceOrFormat(this.path) || null;
	return Files.restorePathCorrection(prefix, path);
};

Environment.Task.Append.prototype.getOutput = function() {
	let prefix = this.getEnvironment().getPath(),
		path = instanceOrFormat(this.output) || null;
	return Files.restorePathCorrection(prefix, path);
};

Environment.Task.Append.prototype.isMustExplore = function() {
	return instanceOrFormat(this.must_explore) !== false;
};

Environment.Task.Append.prototype.isIncludesDirectories = function() {
	return instanceOrFormat(this.includes_directories) || false;
};

Environment.Task.Append.prototype.process = function() {
	return Files.appendRecursive(this.getPath(), this.getOutput(), this.isMustExplore(), this.isIncludesDirectories());
};

Environment.Task.registerTask("append", Environment.Task.Append);
Environment.Task.registerTask("explorer:append", Environment.Task.Append);
