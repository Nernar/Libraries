Files.createFile = function(path, name) {
	let file = name == undefined ? new java.io.File(path) : new java.io.File(path, name);
	if (!file.exists()) file.createNewFile();
};
