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
