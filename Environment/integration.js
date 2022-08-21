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
