Files.listDirectoryNames = function(path, explore, root) {
	let directories = [],
		file = new java.io.File(path);
	if (file.isFile()) return directories;
	let list = file.listFiles() || [];
	if (root === undefined) root = path;
	if (!("" + root).endsWith("/") && ("" + root).length > 0) {
		root += "/";
	}
	for (let i = 0; i < list.length; i++) {
		if (list[i].isDirectory()) {
			directories.push(("" + list[i]).replace(root, ""));
			if (explore) directories = directories.concat(this.listDirectoryNames(list[i], explore, root));
		}
	}
	return directories.sort();
};
