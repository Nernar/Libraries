/*
BUILD INFO:
  dir: Environment
  target: out/Environment.js
  files: 14
*/



// file: header.js

/*

   Copyright 2018-2022 Nernar (github.com/nernar)

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.

*/

LIBRARY({
	name: "Environment",
	version: 1,
	api: "Preloader",
	dependencies: ["Files:1"],
	shared: true
});

IMPORT("Files:1");




// file: environment/Environment.js

Environment = function(pathOrJson, json) {
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
};

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




// file: environment/Condition.js

Environment.Condition = function(environment, something) {
	this.environment = environment;
	if (typeof something == "boolean") {
		this.constant = something;
	} else if (typeof something == "string") {
		this.runtime = new Environment.Parser.Runtime(environment, something);
	} else {
		log("Environment: Condition must be boolean or string");
	}
};

Environment.Condition.prototype.isConstant = function() {
	return this.hasOwnProperty("constant");
};

Environment.Condition.prototype.isRuntime = function() {
	return this.hasOwnProperty("runtime");
};

Environment.Condition.prototype.condition = function() {
	if (this.isRuntime()) {
		return this.runtime.test();
	}
	if (this.isConstant()) {
		return this.constant;
	}
	return true;
};




// file: environment/Parser.js

Environment.Parser = function(environment, stroke) {
	this.environment = environment;
	if (typeof stroke == "string") {
		this.parse(stroke);
	} else {
		log("Environment: Parser must be string");
	}
};

Environment.Parser.prototype.getEnvironment = function() {
	return this.environment || null;
};

Environment.Parser.prototype.getBuffer = function() {
	return this.buffer || null;
};

Environment.Parser.prototype.parse = function(stroke) {
	let formation = [],
		bufferDefault = null,
		bufferRuntime = null;
	for (let i = 0; i < stroke.length; i++) {
		let char = stroke.charAt(i);
		if (char == "`") {
			if (bufferRuntime) {
				formation.push(bufferRuntime);
				bufferRuntime = null;
			} else {
				bufferRuntime = new Environment.Parser.Runtime(this.getEnvironment());
				if (bufferDefault) {
					formation.push(bufferDefault);
					bufferDefault = null;
				}
			}
		} else if (bufferRuntime) {
			bufferRuntime.append(char);
		} else {
			if (!bufferDefault) {
				bufferDefault = "";
			}
			bufferDefault = bufferDefault.concat(char);
		}
	}
	if (bufferRuntime) {
		log("Environment: Parser runtime buffer must be closed");
		formation.push(bufferRuntime);
	} else if (bufferDefault) {
		formation.push(bufferDefault);
	}
	if (!this.hasOwnProperty("buffer")) {
		this.buffer = formation;
	} else {
		this.buffer = this.buffer.concat(formation);
	}
};

Environment.Parser.prototype.format = function() {
	let buffer = this.getBuffer();
	if (buffer == null) {
		return "";
	}
	return buffer.concat().map(function(value) {
		if (value instanceof Environment.Parser.Runtime) {
			return value.run();
		}
		return value;
	}).join("");
};

Environment.Parser.Runtime = function(environment, buffer) {
	this.environment = environment;
	if (typeof buffer == "string") {
		this.buffer = buffer;
	} else {
		this.buffer = "";
	}
};

Environment.Parser.Runtime.prototype.getEnvironment = function() {
	return this.environment || null;
};

Environment.Parser.Runtime.prototype.getBuffer = function() {
	return this.buffer || null;
};

Environment.Parser.Runtime.prototype.append = function(who) {
	this.buffer = this.buffer.concat(who);
};

Environment.Parser.Runtime.prototype.run = function() {
	return this.getEnvironment().evaluateString(this.getBuffer());
};

Environment.Parser.Runtime.prototype.test = function() {
	return this.run() == true;
};

parseInRuntime = function(environment, stroke) {
	return new Environment.Parser(environment, stroke).format();
};

instanceOrFormat = function(value) {
	if (value instanceof Environment.Parser) {
		return value.format();
	}
	return value;
};




// file: environment/Sequence.js

Environment.Sequence = function(task, json) {
	this.task = task;
	if (Array.isArray(json)) {
		this.sequence = json;
	} else if (sequence !== undefined) {
		this.sequence = [];
		this.sequence.push(json);
	}
};

Environment.Sequence.prototype.getTask = function() {
	return this.task || null;
};

Environment.Sequence.prototype.getSequence = function() {
	return this.sequence || null;
};

Environment.Sequence.prototype.getEnvironment = function() {
	return this.getTask().getEnvironment();
};

Environment.Sequence.prototype.process = function() {
	let task = this.getTask(),
		sequence = this.getSequence();
	task && sequence && sequence.forEach(function(who) {
		who !== undefined && task.run(who);
	});
};




// file: environment/Task.js

Environment.Task = function(environment, json) {
	this.environment = environment;
	if (json !== undefined) {
		this.parseJson(json);
	}
};

Environment.Task.prototype.getEnvironment = function() {
	return this.environment || null;
};

Environment.Task.prototype.getSequence = function() {
	return this.sequence || null;
};

Environment.Task.prototype.getPrototype = function() {
	return this.instance || null;
};

Environment.Task.prototype.precondition = function() {
	return this.condition ? this.condition.condition() : true;
};

Environment.Task.prototype.process = function() {
	log("Environment: Task process must be implemented");
	return null;
};

Environment.Task.prototype.next = function(who) {
	let where = this.SUBTASK;
	if (where) {
		where = new where(this.getEnvironment(), this.getPrototype());
		where.parseJson(who);
		return where;
	}
	return null;
};

Environment.Task.prototype.run = function(who) {
	if (!this.precondition()) {
		return false;
	}
	if (who !== undefined) {
		let second = this.next(who);
		if (second instanceof Environment.Task) {
			return second.run();
		}
		return this.process();
	}
	let sequence = this.getSequence();
	if (sequence instanceof Environment.Sequence) {
		return sequence.process();
	} else {
		return this.process();
	}
};

Environment.Task.prototype.parseJson = function(json) {
	if (json == null || typeof json != "object") {
		return;
	}
	if (json.hasOwnProperty("condition") && json.condition !== undefined) {
		this.condition = new Environment.Condition(this.getEnvironment(), json.condition);
		delete json.condition;
	}
	if (json.hasOwnProperty("sequence") && json.sequence !== undefined) {
		this.sequence = new Environment.Sequence(this, json.sequence);
		delete json.sequence;
	}
	this.instance = json;
};

Environment.Task.registerTask = function(name, task) {
	if (this.registered === undefined) {
		this.registered = {};
	}
	if (this.registered.hasOwnProperty(name)) {
		log("Environment: Redefines environment task " + name);
	}
	this.registered[name] = task;
};

Environment.Task.requireInstance = function(name) {
	if (name) {
		if (this.registered && this.registered.hasOwnProperty(name)) {
			return this.registered[name];
		}
		log("Environment: Task " + name + " not found");
	}
	return null;
};

Environment.Task.parseInstance = function(environment, json) {
	if (json != null && typeof json == "object") {
		if (json.hasOwnProperty("type") && json.type !== undefined) {
			let formation = parseInRuntime(environment, json.type),
				instance = this.requireInstance(json.type);
			if (typeof instance == "function") {
				return new instance(environment, json);
			}
		}
	}
	return null;
};

Environment.Task.parseJson = function(environment, json) {
	let instance = this.parseInstance(environment, json);
	return instance instanceof Environment.Task ? instance : null;
};




// file: task/Subsequence.js

Environment.Task.Subsequence = function(environment, json) {
	Environment.Task.apply(this, arguments);
};

Environment.Task.Subsequence.prototype = new Environment.Task;

Environment.Task.Subsequence.prototype.next = function(who) {
	return Environment.Task.parseJson(this.getEnvironment(), who);
};

Environment.Task.Subsequence.prototype.process = function() {
	log("Environment: Subsequence task must contain sequence");
	return false;
};

Environment.Task.registerTask("subsequence", Environment.Task.Subsequence);




// file: task/Append.js

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




// file: task/Copy.js

Environment.Task.Copy = function(environment, json) {
	Environment.Task.apply(this, arguments);
};

Environment.Task.Copy.prototype = new Environment.Task;
Environment.Task.Copy.prototype.SUBTASK = Environment.Task.Copy;

Environment.Task.Copy.prototype.parseJson = function(json) {
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
				log("Environment: Copy task must_explore must be string or boolean");
			}
		}
		if (json.hasOwnProperty("includes_directories")) {
			if (typeof json.includes_directories == "string") {
				this.includes_directories = new Environment.Parser(this.getEnvironment(), json.includes_directories);
			} else if (typeof json.includes_directories == "boolean") {
				this.includes_directories = json.includes_directories;
			} else {
				log("Environment: Copy task includes_directories must be string or boolean");
			}
		}
	} else if (typeof json == "string") {
		this.path = new Environment.Parser(this.getEnvironment(), json);
	} else {
		log("Environment: Copy task must be object or string")
	}
};

Environment.Task.Copy.prototype.getPath = function() {
	let prefix = this.getEnvironment().getPath(),
		path = instanceOrFormat(this.path) || null;
	return Files.restorePathCorrection(prefix, path);
};

Environment.Task.Copy.prototype.getOutput = function() {
	let prefix = this.getEnvironment().getPath(),
		path = instanceOrFormat(this.output) || null;
	return Files.restorePathCorrection(prefix, path);
};

Environment.Task.Copy.prototype.isMustExplore = function() {
	return instanceOrFormat(this.must_explore) !== false;
};

Environment.Task.Copy.prototype.isIncludesDirectories = function() {
	return instanceOrFormat(this.includes_directories) || false;
};

Environment.Task.Copy.prototype.process = function() {
	return Files.copyRecursive(this.getPath(), this.getOutput(), this.isMustExplore(), this.isIncludesDirectories());
};

Environment.Task.registerTask("copy", Environment.Task.Copy);
Environment.Task.registerTask("explorer:copy", Environment.Task.Copy);




// file: task/Move.js

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




// file: task/Remove.js

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




// file: task/Unpack.js

Environment.Task.Unpack = function(environment, json) {
	Environment.Task.apply(this, arguments);
};

Environment.Task.Unpack.prototype = new Environment.Task;
Environment.Task.Unpack.prototype.SUBTASK = Environment.Task.Unpack;

Environment.Task.Unpack.prototype.parseJson = function(json) {
	Environment.Task.prototype.parseJson.apply(this, arguments);
	if (json != null && typeof json == "object") {
		if (json.hasOwnProperty("output") && json.output) {
			this.output = new Environment.Parser(this.getEnvironment(), json.output);
		}
		if (json.hasOwnProperty("path") && json.path) {
			this.path = new Environment.Parser(this.getEnvironment(), json.path);
		}
	} else if (typeof json == "string") {
		this.path = new Environment.Parser(this.getEnvironment(), json);
	} else {
		log("Environment: Unpack task must be object or string")
	}
};

Environment.Task.Unpack.prototype.getPath = function() {
	let prefix = this.getEnvironment().getPath(),
		path = instanceOrFormat(this.path) || null;
	return Files.restorePathCorrection(prefix, path);
};

Environment.Task.Unpack.prototype.getOutput = function() {
	let prefix = this.getEnvironment().getPath(),
		path = instanceOrFormat(this.output) || null;
	return Files.restorePathCorrection(prefix, path);
};

Environment.Task.Unpack.prototype.process = function() {
	Files.unpackZip(this.getPath(), this.getOutput());
	return true;
};

Environment.Task.registerTask("unzip", Environment.Task.Unpack);
Environment.Task.registerTask("unpack", Environment.Task.Unpack);
Environment.Task.registerTask("explorer:unzip", Environment.Task.Unpack);
Environment.Task.registerTask("explorer:unpack", Environment.Task.Unpack);




// file: task/Pack.js

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




// file: integration.js

EXPORT("executeInEnvironment", function(who, scope) {
	let environment = new Environment(who);
	if (scope !== undefined) {
		environment.prepareScriptable();
		let scriptable = environment.getScriptable();
		for (let element in scope) {
			scriptable.query[element] = scope[element];
		}
	}
	environment.execute();
});

EXPORT("Environment", Environment);




