Files.cut = function(file, path) {
	Files.copy(file, path);
	file.delete();
};
