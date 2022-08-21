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
