Files.append = function(file, path) {
	let result = new java.io.File(path);
	if (result.exists()) {
		this.addText(result, "\n" + this.read(file));
	} else {
		this.createNewWithParent(result);
		this.writeBytes(result, this.readBytes(file));
	}
};
