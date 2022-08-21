Files.listFileNames = function(path, explore, root) {
	let files = [],
		file = new java.io.File(path);
	if (root === undefined) root = path;
	if (file.isFile()) return [("" + path).replace(root, "")];
	if (!("" + root).endsWith("/") && ("" + root).length > 0) {
		root += "/";
	}
	let list = file.listFiles() || [];
	for (let i = 0; i < list.length; i++) {
		if (list[i].isFile()) {
			files.push(("" + list[i]).replace(root, ""));
		} else if (explore) {
			files = files.concat(this.listFileNames(list[i], explore, root));
		}
	}
	return files.sort();
};
