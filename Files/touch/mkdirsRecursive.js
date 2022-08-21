Files.mkdirsRecursive = function(path, output, explore) {
	let directories = this.listDirectories(path, explore),
		count = 0;
	for (let i = 0; i < directories.length; i++) {
		let source = this.shrinkPathes(path, directories[i]);
		if (source.length > 0) {
			let file = new java.io.File(output, source);
			if (!file.exists()) file.mkdirs();
			count++;
		}
	}
};
