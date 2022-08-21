Files.read = function(file, massive) {
	if (!file.exists()) return massive ? [] : null;
	let reader = java.io.BufferedReader(new java.io.FileReader(file)),
		result = [],
		line;
	while (line = reader.readLine()) {
		result.push("" + line);
	}
	return massive ? result : result.join("\n");
};
