Files.listDirectories = function(path, explore) {
	let directories = [],
		file = new java.io.File(path);
	if (file.isFile()) return directories;
	let list = file.listFiles() || [];
	for (let i = 0; i < list.length; i++) {
		if (list[i].isDirectory()) {
			directories.push(list[i]);
			if (explore) directories = directories.concat(this.listDirectories(list[i], explore));
		}
	}
	return directories.sort();
};
