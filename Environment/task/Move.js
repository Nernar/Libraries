Environment.Task.Move = function(environment, json) {
	Environment.Task.apply(this, arguments);
};

Environment.Task.Move.prototype = new Environment.Task;
Environment.Task.Move.prototype.SUBTASK = Environment.Task.Move;

Environment.Task.Move.prototype.parseJson = function(json) {
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
				log("Environment: Move task must_explore must be string or boolean");
			}
		}
		if (json.hasOwnProperty("includes_directories")) {
			if (typeof json.includes_directories == "string") {
				this.includes_directories = new Environment.Parser(this.getEnvironment(), json.includes_directories);
			} else if (typeof json.includes_directories == "boolean") {
				this.includes_directories = json.includes_directories;
			} else {
				log("Environment: Move task includes_directories must be string or boolean");
			}
		}
		if (json.hasOwnProperty("comparing")) {
			if (typeof json.comparing == "string") {
				this.comparing = new Environment.Parser(this.getEnvironment(), json.comparing);
			} else if (typeof json.comparing == "boolean") {
				this.comparing = json.comparing;
			} else {
				log("Environment: Move task comparing must be string or boolean");
			}
		}
		if (json.hasOwnProperty("simple_comparing")) {
			if (typeof json.simple_comparing == "string") {
				this.simple_comparing = new Environment.Parser(this.getEnvironment(), json.simple_comparing);
			} else if (typeof json.simple_comparing == "boolean") {
				this.simple_comparing = json.simple_comparing;
			} else {
				log("Environment: Move task comparing must be string or boolean");
			}
		}
	} else if (typeof json == "string") {
		this.path = new Environment.Parser(this.getEnvironment(), json);
	} else {
		log("Environment: Move task must be object or string")
	}
};

Environment.Task.Move.prototype.getPath = function() {
	let prefix = this.getEnvironment().getPath(),
		path = instanceOrFormat(this.path) || null;
	return Files.restorePathCorrection(prefix, path);
};

Environment.Task.Move.prototype.getOutput = function() {
	let prefix = this.getEnvironment().getPath(),
		path = instanceOrFormat(this.output) || null;
	return Files.restorePathCorrection(prefix, path);
};

Environment.Task.Move.prototype.isMustExplore = function() {
	return instanceOrFormat(this.must_explore) !== false;
};

Environment.Task.Move.prototype.isIncludesDirectories = function() {
	return instanceOrFormat(this.includes_directories) || false;
};

Environment.Task.Move.prototype.isComparing = function() {
	return instanceOrFormat(this.isComparing) !== false;
};

Environment.Task.Move.prototype.isSimpleComparing = function() {
	return instanceOrFormat(this.simple_comparing) || false;
};

Environment.Task.Move.prototype.process = function() {
	if (this.isComparing()) {
		if (!Files.copyAndCompare(this.getPath(), this.getOutput(), this.isMustExplore(), this.isSimpleComparing(), this.isIncludesDirectories())) {
			return false;
		}
	} else {
		Files.copyRecursive(this.getPath(), this.getOutput(), this.isMustExplore(), this.isIncludesDirectories());
	}
	Files.deleteRecursive(this.getPath(), this.isMustExplore());
	return true;
};

Environment.Task.registerTask("move", Environment.Task.Move);
Environment.Task.registerTask("explorer:move", Environment.Task.Move);
Environment.Task.registerTask("cut", Environment.Task.Move);
Environment.Task.registerTask("explorer:cut", Environment.Task.Move);
