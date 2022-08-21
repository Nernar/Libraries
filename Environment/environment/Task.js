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
