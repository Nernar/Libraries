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
