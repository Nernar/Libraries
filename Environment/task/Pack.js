Environment.Task.Pack = function(environment, json) {
	Environment.Task.apply(this, arguments);
};

Environment.Task.Pack.prototype = new Environment.Task;
Environment.Task.Pack.prototype.SUBTASK = Environment.Task.Pack;

Environment.Task.Pack.prototype.parseJson = function(json) {
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
				log("Environment: Pack task must_explore must be string or boolean");
			}
		}
	} else if (typeof json == "string") {
		this.path = new Environment.Parser(this.getEnvironment(), json);
	} else {
		log("Environment: Pack task must be object or string")
	}
};

Environment.Task.Pack.prototype.getPath = function() {
	let prefix = this.getEnvironment().getPath(),
		path = instanceOrFormat(this.path) || null;
	return Files.restorePathCorrection(prefix, path);
};

Environment.Task.Pack.prototype.getOutput = function() {
	let prefix = this.getEnvironment().getPath(),
		path = instanceOrFormat(this.output) || null;
	return Files.restorePathCorrection(prefix, path);
};

Environment.Task.Pack.prototype.isMustExplore = function() {
	return instanceOrFormat(this.must_explore) !== false;
};

Environment.Task.Pack.prototype.process = function() {
	let who = Files.listFiles(this.getPath(), this.isMustExplore());
	Files.packZip(this.getPath(), who, this.getOutput());
	return true;
};

Environment.Task.registerTask("zip", Environment.Task.Pack);
Environment.Task.registerTask("pack", Environment.Task.Pack);
Environment.Task.registerTask("explorer:zip", Environment.Task.Pack);
Environment.Task.registerTask("explorer:pack", Environment.Task.Pack);
