Files.listFiles = function(path, explore) {
	let files = [],
		file = new java.io.File(path);
	if (file.isFile()) return [file];
	let list = file.listFiles() || [];
	for (let i = 0; i < list.length; i++) {
		if (list[i].isFile()) {
			files.push(list[i]);
		} else if (explore) {
			files = files.concat(this.listFiles(list[i], explore));
		}
	}
	return files.sort();
};
