Files.restorePathCorrection = function(prefix, path) {
	if (path && new java.io.File(path).exists()) {
		return path;
	}
	return prefix ? path ? prefix + "/" + path : prefix : path;
};
