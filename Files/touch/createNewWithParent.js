Files.createNewWithParent = function(path, name) {
	let file = name == undefined ? new java.io.File(path) : new java.io.File(path, name);
	file.getParentFile().mkdirs();
	file.createNewFile();
};
