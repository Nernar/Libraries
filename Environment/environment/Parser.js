Environment.Parser = function(environment, stroke) {
	this.environment = environment;
	this.buffer = null;
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

function parseInRuntime(environment, stroke) {
	return new Environment.Parser(environment, stroke).format();
}

function instanceOrFormat(value) {
	if (value instanceof Environment.Parser) {
		return value.format();
	}
	return value;
}
